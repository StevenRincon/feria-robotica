import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Registration, RegistrationStatus } from '../src/app/models/registration.model';
import { createParticipationCertificate } from '../src/server/certificate.js';
import {
    countInstitutionCategoryRegistrations,
    findRegistrationByCodeOrDocument,
    hasDuplicateParticipantDocuments,
    registrationsCollection,
    updateRegistrationStatus,
} from '../src/server/database.js';

const api = express();
api.use(express.json());

function getCategoryName(category: string): string {
    if (category === 'seguidores') return 'Seguidores de línea';
    if (category === 'educativos') return 'Proyectos educativos en robótica';
    return 'Proyecto de automatización electrónica';
}

api.get('/api/registrations', async (req, res) => {
    try {
        const category = req.query['category'] as string | undefined;
        const search = String(req.query['search'] || '').trim();
        const query: Record<string, unknown> = {};
        const filters: Record<string, unknown>[] = [];
        if (category && category !== 'all') query['category'] = category;
        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filters.push({
                $or: ['teamName', 'projectTitle', 'institution', 'city', 'code', 'leaderName', 'leaderDoc', 'mentorName', 'mentorDoc']
                    .map(field => ({ [field]: { $regex: escapedSearch, $options: 'i' } }))
            });
        }
        const project = String(req.query['project'] || '').trim();
        const teacher = String(req.query['teacher'] || '').trim();
        const teacherDoc = String(req.query['teacherDoc'] || '').trim();
        const institution = String(req.query['institution'] || '').trim();
        if (project) filters.push({ $or: ['projectTitle', 'teamName'].map(field => ({ [field]: { $regex: project.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } })) });
        if (teacher) filters.push({ mentorName: { $regex: teacher.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });
        if (teacherDoc) filters.push({ mentorDoc: { $regex: teacherDoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });
        if (institution) filters.push({ institution: { $regex: institution.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });
        if (filters.length) query['$and'] = filters;
        const data = await (await registrationsCollection()).find(query).sort({ createdAt: -1 }).toArray();
        return res.json({ success: true, count: data.length, data });
    } catch (error) {
        console.error('Error consultando inscripciones:', error);
        return res.status(503).json({ success: false, message: 'La base de datos no está disponible.' });
    }
});

api.get('/api/registrations/:codeOrId', async (req, res) => {
    try {
        const found = await findRegistrationByCodeOrDocument(req.params.codeOrId);
        if (!found) return res.status(404).json({ success: false, message: 'Registro no encontrado con el código o documento ingresado' });
        return res.json({ success: true, data: found });
    } catch (error) {
        console.error('Error consultando inscripción:', error);
        return res.status(503).json({ success: false, message: 'La base de datos no está disponible.' });
    }
});

api.get('/api/certificates/:id', async (req, res) => {
    try {
        const certificateId = decodeURIComponent(req.params.id).trim();
        const registration = await (await registrationsCollection()).findOne({ $or: [{ id: certificateId }, { code: certificateId }] });
        if (!registration) return res.status(404).json({ success: false, message: 'Proyecto no encontrado.' });
        if (!registration.mentorName || !registration.mentorDoc) return res.status(422).json({ success: false, message: 'El proyecto no tiene docente a cargo registrado.' });
        const pdf = await createParticipationCertificate(registration);
        const filename = `Certificado_${registration.projectTitle.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(pdf);
    } catch (error) {
        console.error('Error generando certificado:', error);
        return res.status(500).json({ success: false, message: 'No fue posible generar el certificado.' });
    }
});

api.post('/api/registrations', async (req, res) => {
    try {
        const body = req.body;
        if (!body || !body.teamName || !body.projectTitle || !body.institution || !body.leaderName || !body.leaderDoc || !body.leaderEmail || !body.leaderPhone || !body.category || !body.projectDescription) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para el registro.' });
        }
        if (!['automatizacion', 'seguidores', 'educativos'].includes(body.category)) {
            return res.status(400).json({ success: false, message: 'La categoría de inscripción no es válida.' });
        }
        if (await countInstitutionCategoryRegistrations(body.institution, body.category) >= 2) {
            return res.status(409).json({ success: false, message: 'Esta institución ya tiene el máximo de dos proyectos inscritos en esta categoría.' });
        }

        const requestedMembers = Array.isArray(body.members) ? body.members : [];
        if (requestedMembers.length > 1) return res.status(400).json({ success: false, message: 'Una inscripción permite máximo dos estudiantes y un profesor.' });
        if (requestedMembers.some((member: { fullName?: string; documentId?: string }) => !member.fullName || !member.documentId)) {
            return res.status(400).json({ success: false, message: 'Cada estudiante debe tener nombre y documento.' });
        }
        if (Boolean(body.mentorName) !== Boolean(body.mentorDoc)) {
            return res.status(400).json({ success: false, message: 'El profesor o tutor debe registrarse con nombre y documento.' });
        }

        const members = [
            { id: `member-${randomUUID()}`, fullName: body.leaderName, documentId: body.leaderDoc, role: 'Líder / Capitán' as const, email: body.leaderEmail, phone: body.leaderPhone },
            ...requestedMembers.map((member: { fullName: string; documentId: string }) => ({ id: `member-${randomUUID()}`, fullName: member.fullName, documentId: member.documentId, role: 'Integrante' as const }))
        ];
        const documents = [body.leaderDoc, ...requestedMembers.map((member: { documentId: string }) => member.documentId), body.mentorDoc].filter(Boolean);
        if (new Set(documents).size !== documents.length) return res.status(400).json({ success: false, message: 'Los documentos de los participantes deben ser diferentes.' });
        if (await hasDuplicateParticipantDocuments(documents)) return res.status(409).json({ success: false, message: 'Uno de los documentos ya pertenece a otra inscripción.' });

        const categoryCode = body.category === 'seguidores' ? 'S' : body.category === 'educativos' ? 'E' : 'A';
        const registration: Registration = {
            id: `reg-${randomUUID()}`,
            code: `NOBSA-ROB-2026-${categoryCode}${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            category: body.category,
            categoryName: getCategoryName(body.category),
            teamName: body.teamName,
            projectTitle: body.projectTitle,
            institution: body.institution,
            institutionType: body.institutionType || 'Colegio / I.E.',
            city: body.city || 'Nobsa',
            department: body.department || 'Boyacá',
            leaderName: body.leaderName,
            leaderDoc: body.leaderDoc,
            leaderEmail: body.leaderEmail,
            leaderPhone: body.leaderPhone,
            mentorName: body.mentorName || '',
            mentorDoc: body.mentorDoc || '',
            members,
            projectDescription: body.projectDescription,
            technicalSpecs: body.technicalSpecs || '',
            spaceRequirements: body.spaceRequirements || '',
            status: 'Aprobado'
        };

        await (await registrationsCollection()).insertOne(registration);
        return res.status(201).json({ success: true, message: 'Inscripción registrada con éxito', data: registration });
    } catch (error) {
        console.error('Error guardando inscripción:', error);
        if (error instanceof Error && error.message.includes('duplicate key')) return res.status(409).json({ success: false, message: 'El código de inscripción ya existe, intenta de nuevo.' });
        return res.status(500).json({ success: false, message: 'Error en el servidor procesando la inscripción.' });
    }
});

api.put('/api/registrations/:id/status', async (req, res) => {
    try {
        const status = req.body.status as RegistrationStatus;
        if (!['Confirmado', 'En revisión', 'Aprobado', 'Pendiente'].includes(status)) return res.status(400).json({ success: false, message: 'Estado de inscripción no válido.' });
        const item = await updateRegistrationStatus(req.params.id, status);
        if (!item) return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
        return res.json({ success: true, message: 'Estado actualizado correctamente', data: item });
    } catch (error) {
        console.error('Error actualizando estado:', error);
        return res.status(500).json({ success: false, message: 'Error actualizando la inscripción.' });
    }
});

api.delete('/api/registrations/:id', async (req, res) => {
    try {
        const result = await (await registrationsCollection()).deleteOne({ $or: [{ id: req.params.id }, { code: req.params.id }] });
        if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
        return res.json({ success: true, message: 'Inscripción eliminada correctamente' });
    } catch (error) {
        console.error('Error eliminando inscripción:', error);
        return res.status(500).json({ success: false, message: 'Error eliminando la inscripción.' });
    }
});

api.get('/api/stats', async (_req, res) => {
    try {
        const registrations = await (await registrationsCollection()).find().toArray();
        const byCategory = { automatizacion: 0, seguidores: 0, educativos: 0 };
        const byStatus = { confirmado: 0, pendiente: 0, aprobado: 0 };
        const municipalities = new Set<string>();
        registrations.forEach(registration => {
            byCategory[registration.category]++;
            municipalities.add(registration.city.toLowerCase().trim());
            if (registration.status === 'Aprobado') byStatus.aprobado++;
            else if (registration.status === 'Confirmado') byStatus.confirmado++;
            else byStatus.pendiente++;
        });
        return res.json({ success: true, data: { totalTeams: registrations.length, totalParticipants: registrations.reduce((total, registration) => total + registration.members.length, 0), totalMunicipalities: municipalities.size, byCategory, byStatus } });
    } catch (error) {
        console.error('Error consultando estadísticas:', error);
        return res.status(503).json({ success: false, message: 'La base de datos no está disponible.' });
    }
});

export default api;
