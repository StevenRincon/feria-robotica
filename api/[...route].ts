import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Registration, RegistrationStatus } from '../src/app/models/registration.model';
import { createParticipationCertificate } from '../src/server/certificate.js';
import { sendRegistrationConfirmation } from '../src/server/registration-email.js';
import { normalizeInstitutionDane } from '../src/server/institution-nit.js';
import { calculateRegistrationStats } from '../src/server/registration-stats.js';
import { areCertificatesAvailable, CERTIFICATE_AVAILABILITY_MESSAGE } from '../src/shared/certificate-availability.js';
import {
    countInstitutionCategoryRegistrations,
    findInstitutionCategoryProjects,
    getInstitutionCategoryRegistrationLimit,
    findRegistrationByCodeOrDocument,
    hasDuplicateParticipantDocuments,
    registrationsCollection,
    updateRegistration,
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
                $or: ['teamName', 'projectTitle', 'institutionNit', 'institution', 'city', 'code', 'leaderName', 'leaderDoc', 'mentorName', 'mentorDoc']
                    .map(field => ({ [field]: { $regex: escapedSearch, $options: 'i' } }))
            });
        }
        const project = String(req.query['project'] || '').trim();
        const teacher = String(req.query['teacher'] || '').trim();
        const teacherDoc = String(req.query['teacherDoc'] || '').trim();
        const institutionNitInput = String(req.query['institutionNit'] || req.query['institution'] || '').trim();
        if (project) filters.push({ $or: ['projectTitle', 'teamName'].map(field => ({ [field]: { $regex: project.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } })) });
        if (teacher) filters.push({ mentorName: { $regex: teacher.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });
        if (teacherDoc) filters.push({ mentorDoc: { $regex: teacherDoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });
        if (institutionNitInput) {
            const institutionNit = normalizeInstitutionDane(institutionNitInput);
            if (!institutionNit) return res.status(400).json({ success: false, message: 'El Código DANE debe contener exactamente 12 dígitos, sin puntos ni comas.' });
            filters.push({ institutionNit });
        }
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
    if (!areCertificatesAvailable()) {
        return res.status(423).json({ success: false, message: CERTIFICATE_AVAILABILITY_MESSAGE });
    }

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
        if (!body || !body.teamName || !body.projectTitle || !body.institutionNit || !body.leaderName || !body.leaderDoc || !body.mentorName || !body.mentorDoc || !body.mentorEmail || !body.mentorPhone || !body.category || !body.projectDescription) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para el registro.' });
        }
        const institutionNit = normalizeInstitutionDane(body.institutionNit);
        if (!institutionNit) return res.status(400).json({ success: false, message: 'El Código DANE debe contener exactamente 12 dígitos, sin puntos ni comas.' });
        if (!/^\d+$/.test(String(body.leaderDoc)) || !/^\d+$/.test(String(body.mentorDoc))) {
            return res.status(400).json({ success: false, message: 'Los documentos deben contener únicamente números.' });
        }
        if (!/^\d{10}$/.test(String(body.mentorPhone))) {
            return res.status(400).json({ success: false, message: 'El número de contacto del docente debe contener exactamente 10 dígitos numéricos.' });
        }
        const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!emailPattern.test(String(body.mentorEmail))) {
            return res.status(400).json({ success: false, message: 'El correo electrónico del docente no tiene un formato válido.' });
        }
        if (body.institutionType && body.institutionType !== 'Colegio / I.E.') {
            return res.status(400).json({ success: false, message: 'Solo se permiten inscripciones de instituciones educativas.' });
        }
        if (!['automatizacion', 'seguidores', 'educativos'].includes(body.category)) {
            return res.status(400).json({ success: false, message: 'La categoría de inscripción no es válida.' });
        }
        const categoryLimit = getInstitutionCategoryRegistrationLimit(institutionNit, body.category);
        if (await countInstitutionCategoryRegistrations(institutionNit, body.category) >= categoryLimit) {
            const projects = await findInstitutionCategoryProjects(institutionNit, body.category);
            return res.status(409).json({
                success: false,
                message: `Esta institución ya alcanzó el máximo de ${categoryLimit} proyectos inscritos en esta categoría.`,
                projects
            });
        }

        const requestedMembers = Array.isArray(body.members)
            ? body.members.filter((member: { fullName?: string; documentId?: string }) => member?.fullName || member?.documentId)
            : [];
        if (requestedMembers.length > 1) return res.status(400).json({ success: false, message: 'Una inscripción permite máximo dos estudiantes y un profesor.' });
        if (requestedMembers.some((member: { fullName?: string; documentId?: string }) => !member.fullName || !member.documentId || !/^\d+$/.test(String(member.documentId)))) {
            return res.status(400).json({ success: false, message: 'Cada estudiante debe tener nombre y documento.' });
        }

        const members = [
            { id: `member-${randomUUID()}`, fullName: body.leaderName, documentId: body.leaderDoc, role: 'Líder / Capitán' as const },
            ...requestedMembers.map((member: { fullName: string; documentId: string }) => ({ id: `member-${randomUUID()}`, fullName: member.fullName, documentId: member.documentId, role: 'Integrante' as const }))
        ];
        const participantDocuments = [body.leaderDoc, ...requestedMembers.map((member: { documentId: string }) => member.documentId)].filter(Boolean);
        const allDocuments = [...participantDocuments, body.mentorDoc].filter(Boolean);
        if (new Set(allDocuments).size !== allDocuments.length) return res.status(400).json({ success: false, message: 'Los documentos de los participantes deben ser diferentes.' });
        if (await hasDuplicateParticipantDocuments(participantDocuments)) return res.status(409).json({ success: false, message: 'Uno de los documentos ya pertenece a otra inscripción.' });

        const categoryCode = body.category === 'seguidores' ? 'S' : body.category === 'educativos' ? 'E' : 'A';
        const registration: Registration = {
            id: `reg-${randomUUID()}`,
            code: `NOBSA-ROB-2026-${categoryCode}${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            category: body.category,
            categoryName: getCategoryName(body.category),
            teamName: body.teamName,
            projectTitle: body.projectTitle,
            institutionNit,
            institutionType: 'Colegio / I.E.',
            city: body.city || 'Nobsa',
            department: body.department || 'Boyacá',
            leaderName: body.leaderName,
            leaderDoc: body.leaderDoc,
            mentorName: body.mentorName || '',
            mentorDoc: body.mentorDoc || '',
            mentorEmail: body.mentorEmail,
            mentorPhone: body.mentorPhone,
            members,
            projectDescription: body.projectDescription,
            technicalSpecs: body.technicalSpecs || '',
            spaceRequirements: body.spaceRequirements || '',
            status: 'Aprobado'
        };

        await (await registrationsCollection()).insertOne(registration);
        const emailSent = await sendRegistrationConfirmation(registration);
        return res.status(201).json({ success: true, message: 'Inscripción registrada con éxito', emailSent, data: registration });
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

api.put('/api/registrations/:id', async (req, res) => {
    try {
        const body = req.body as Partial<Registration>;
        const validCategories = ['automatizacion', 'seguidores', 'educativos'];
        const validInstitutionTypes = ['Colegio / I.E.', 'Universidad / SENA', 'Club / Independiente', 'Empresa / StartUp'];
        const validRoles = ['Líder / Capitán', 'Integrante', 'Tutor / Asesor', 'Docente / Profesor'];
        const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        const requiredTextFields: Array<keyof Registration> = [
            'teamName', 'projectTitle', 'institutionType', 'city', 'department',
            'leaderName', 'leaderDoc', 'mentorName', 'mentorDoc', 'mentorEmail',
            'mentorPhone', 'projectDescription'
        ];

        if (!body || requiredTextFields.some(field => typeof body[field] !== 'string' || !String(body[field]).trim())) {
            return res.status(400).json({ success: false, message: 'Completa todos los campos obligatorios del proyecto, líder y docente.' });
        }
        if (!validCategories.includes(String(body.category)) || !validInstitutionTypes.includes(String(body.institutionType))) {
            return res.status(400).json({ success: false, message: 'La categoría o el tipo de institución no son válidos.' });
        }

        const institutionNit = String(body.institutionNit || '').trim();
        if (!/^(?:\d{9,10}|\d{12})$/.test(institutionNit)) {
            return res.status(400).json({ success: false, message: 'El Código DANE debe contener 9, 10 o 12 dígitos numéricos.' });
        }
        if (!/^\d+$/.test(String(body.leaderDoc)) || !/^\d+$/.test(String(body.mentorDoc))) {
            return res.status(400).json({ success: false, message: 'Los documentos del líder y docente deben contener únicamente números.' });
        }
        if (!emailPattern.test(String(body.mentorEmail)) || !/^\d{10}$/.test(String(body.mentorPhone))) {
            return res.status(400).json({ success: false, message: 'Verifica el correo y el teléfono de contacto del docente.' });
        }
        const schoolRegistrationWithDane = body.institutionType === 'Colegio / I.E.' && /^\d{12}$/.test(institutionNit);
        const registrationWithLeaderContact = Boolean(String(body.leaderEmail || '').trim() && String(body.leaderPhone || '').trim());
        if (!schoolRegistrationWithDane && !registrationWithLeaderContact) {
            return res.status(400).json({ success: false, message: 'Para colegios registra un Código DANE de 12 dígitos; para otras instituciones registra correo y teléfono del líder.' });
        }

        const members = body.members;
        if (!Array.isArray(members) || members.length < 1 || members.length > 2
            || members.some(member => !member.fullName?.trim() || !/^\d+$/.test(member.documentId)
                || !validRoles.includes(member.role))
            || members.filter(member => member.role === 'Líder / Capitán').length !== 1) {
            return res.status(400).json({ success: false, message: 'Registra entre uno y dos participantes con nombre, documento y rol válidos.' });
        }

        const leaderName = String(body.leaderName).trim();
        const leaderDoc = String(body.leaderDoc).trim();
        const normalizedMembers = members.map(member => member.role === 'Líder / Capitán'
            ? { ...member, fullName: leaderName, documentId: leaderDoc }
            : { ...member, fullName: member.fullName.trim(), documentId: member.documentId.trim() });
        const participantDocuments = normalizedMembers.map(member => member.documentId);
        if (new Set(participantDocuments).size !== participantDocuments.length) {
            return res.status(400).json({ success: false, message: 'Los documentos del líder y los participantes no se pueden repetir.' });
        }
        if (await hasDuplicateParticipantDocuments([...new Set(participantDocuments)], req.params.id)) {
            return res.status(409).json({ success: false, message: 'Uno de los documentos ya está registrado en otro proyecto.' });
        }

        const category = body.category!;
        const changes: Partial<Registration> = {
            teamName: String(body.teamName).trim(),
            projectTitle: String(body.projectTitle).trim(),
            category,
            categoryName: getCategoryName(category),
            institutionNit,
            institution: String(body.institution || '').trim(),
            institutionType: body.institutionType!,
            city: String(body.city).trim(),
            department: String(body.department).trim(),
            leaderName,
            leaderDoc,
            leaderEmail: String(body.leaderEmail || '').trim(),
            leaderPhone: String(body.leaderPhone || '').trim(),
            mentorName: String(body.mentorName).trim(),
            mentorDoc: String(body.mentorDoc).trim(),
            mentorEmail: String(body.mentorEmail).trim(),
            mentorPhone: String(body.mentorPhone).trim(),
            members: normalizedMembers,
            projectDescription: String(body.projectDescription).trim(),
            technicalSpecs: String(body.technicalSpecs || '').trim(),
            spaceRequirements: String(body.spaceRequirements || '').trim()
        };

        const item = await updateRegistration(req.params.id, changes);
        if (!item) return res.status(404).json({ success: false, message: 'Inscripción no encontrada.' });
        return res.json({ success: true, message: 'Información del proyecto actualizada correctamente.', data: item });
    } catch (error) {
        console.error('Error actualizando información del proyecto:', error);
        return res.status(500).json({ success: false, message: 'No fue posible actualizar la información del proyecto.' });
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
        return res.json({ success: true, data: calculateRegistrationStats(registrations) });
    } catch (error) {
        console.error('Error consultando estadísticas:', error);
        return res.status(503).json({ success: false, message: 'La base de datos no está disponible.' });
    }
});

export default api;
