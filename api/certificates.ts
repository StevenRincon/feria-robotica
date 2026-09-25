import type { Request, Response } from 'express';
import { registrationsCollection } from '../src/server/database.js';
import { createParticipationCertificate } from '../src/server/certificate.js';

export default async function handler(req: Request, res: Response): Promise<void> {
    if (req.method !== 'GET') {
        res.status(405).json({ success: false, message: 'Método no permitido.' });
        return;
    }

    try {
        const registrationId = String(req.query['registrationId'] || '').trim();
        if (!registrationId) {
            res.status(400).json({ success: false, message: 'Falta el identificador del proyecto.' });
            return;
        }

        const registration = await (await registrationsCollection()).findOne({
            $or: [{ id: registrationId }, { code: registrationId }]
        });
        if (!registration) {
            res.status(404).json({ success: false, message: 'Proyecto no encontrado.' });
            return;
        }
        if (!registration.mentorName || !registration.mentorDoc) {
            res.status(422).json({ success: false, message: 'El proyecto no tiene docente a cargo registrado.' });
            return;
        }

        const pdf = await createParticipationCertificate(registration);
        const filename = `Certificado_${registration.projectTitle.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(pdf);
    } catch (error) {
        console.error('Error generando certificado:', error);
        res.status(500).json({ success: false, message: 'No fue posible generar el certificado.' });
    }
}