import type { Registration } from '../app/models/registration.model';

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
    const apiKey = process.env['RESEND_API_KEY'];
    const from = process.env['RESEND_FROM_EMAIL'];
    if (!apiKey || !from) {
        console.warn('Correo de confirmación omitido: configura RESEND_API_KEY y RESEND_FROM_EMAIL.');
        return false;
    }

    const fields: [string, string][] = [
        ['Código de inscripción', registration.code],
        ['Estado', registration.status],
        ['Categoría', registration.categoryName],
        ['Equipo', registration.teamName],
        ['Proyecto', registration.projectTitle],
        ['Institución', registration.institution],
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
        'Conserva este correo y tu código de inscripción para futuras consultas.'
    ].join('\n');
    const rows = fields.map(([label, value]) =>
        `<tr><th style="padding:8px;text-align:left;border-bottom:1px solid #dbe4ea">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #dbe4ea">${escapeHtml(value)}</td></tr>`
    ).join('');
    const html = `<div style="font-family:Arial,sans-serif;color:#17212b;max-width:680px;margin:auto"><h1 style="color:#087e8b">Inscripción confirmada</h1><p>Hola ${escapeHtml(registration.leaderName)}, tu inscripción a la Feria de Robótica Nobsa 2026 fue registrada correctamente.</p><table style="border-collapse:collapse;width:100%">${rows}</table><p>Conserva este correo y tu código de inscripción para futuras consultas.</p></div>`;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from,
                to: [registration.leaderEmail],
                subject: `Inscripción confirmada: ${registration.code}`,
                text,
                html
            }),
            signal: AbortSignal.timeout(10_000)
        });

        if (!response.ok) console.error(`Resend rechazó el correo de confirmación (${response.status}).`);
        return response.ok;
    } catch (error) {
        console.error('No fue posible enviar el correo de confirmación:', error);
        return false;
    }
}