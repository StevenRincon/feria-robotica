import type { Registration } from '../app/models/registration.model';
import nodemailer from 'nodemailer';

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character] ?? character);
}

export async function sendRegistrationConfirmation(registration: Registration): Promise<boolean> {
    const user = process.env['GMAIL_USER'];
    const appPassword = process.env['GMAIL_APP_PASSWORD']?.replace(/\s/g, '');
    if (!user || !appPassword) {
        console.warn('Correo de confirmación omitido: configura GMAIL_USER y GMAIL_APP_PASSWORD.');
        return false;
    }

    const fields: [string, string][] = [
        ['Código de inscripción', registration.code],
        ['Estado', registration.status],
        ['Categoría', registration.categoryName],
        ['Equipo', registration.teamName],
        ['Proyecto', registration.projectTitle],
        ['NIT de la institución', registration.institutionNit || 'No registrado'],
        ['Ubicación', `${registration.city}, ${registration.department}`],
        ['Líder', registration.leaderName],
        ['Documento del líder', registration.leaderDoc],
        ['Correo', registration.leaderEmail],
        ['Teléfono', registration.leaderPhone],
        ['Docente', registration.mentorName || 'No registrado'],
        ['Documento del docente', registration.mentorDoc || 'No registrado'],
        ['Integrantes adicionales', registration.members.slice(1).map(member => `${member.fullName} (${member.documentId})`).join(', ') || 'Ninguno'],
        ['Descripción', registration.projectDescription],
        ['Especificaciones técnicas', registration.technicalSpecs || 'No registradas'],
        ['Requerimientos de espacio', registration.spaceRequirements || 'No registrados']
    ];
    const text = [
        `Hola ${registration.leaderName},`,
        'Tu inscripción a la Feria de Robótica Nobsa 2026 fue registrada correctamente.',
        '',
        ...fields.map(([label, value]) => `${label}: ${value}`),
        '',
        'Conserva este correo y tu código de inscripción para futuras consultas.',
        'Si no encuentras este mensaje en tu bandeja de entrada, revisa la carpeta de spam o correo no deseado.'
    ].join('\n');
    const rows = fields.map(([label, value]) =>
        `<tr><th style="padding:8px;text-align:left;border-bottom:1px solid #dbe4ea">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #dbe4ea">${escapeHtml(value)}</td></tr>`
    ).join('');
    const html = `<div style="font-family:Arial,sans-serif;color:#17212b;max-width:680px;margin:auto"><h1 style="color:#087e8b">Inscripción confirmada</h1><p>Hola ${escapeHtml(registration.leaderName)}, tu inscripción a la Feria de Robótica Nobsa 2026 fue registrada correctamente.</p><table style="border-collapse:collapse;width:100%">${rows}</table><p>Conserva este correo y tu código de inscripción para futuras consultas.</p><p>Si no encuentras este mensaje en tu bandeja de entrada, revisa la carpeta de spam o correo no deseado.</p></div>`;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass: appPassword }
        });
        const result = await transporter.sendMail({
            from: { name: 'Feria de Robótica Nobsa', address: user },
            to: registration.leaderEmail,
            subject: `Inscripción confirmada: ${registration.code}`,
            text,
            html
        });

        return result.accepted.length > 0;
    } catch (error) {
        console.error('No fue posible enviar el correo por Gmail SMTP:', error instanceof Error ? error.message : error);
        return false;
    }
}