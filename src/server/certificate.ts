import PDFDocument from 'pdfkit';
import type { Registration } from '../app/models/registration.model';

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Bogota'
    }).format(new Date(date));
}

export function createParticipationCertificate(registration: Registration): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const document = new PDFDocument({
            size: 'LETTER',
            layout: 'landscape',
            margin: 0,
            userPassword: registration.mentorDoc || 'sin-docente',
            ownerPassword: `${registration.mentorDoc || 'sin-docente'}-feria-2026`,
            permissions: { printing: 'highResolution' }
        });

        document.on('data', (chunk: Buffer) => chunks.push(chunk));
        document.on('end', () => resolve(Buffer.concat(chunks)));
        document.on('error', reject);

        const width = document.page.width;
        const height = document.page.height;
        document.rect(0, 0, width, height).fill('#07111c');
        document.rect(24, 24, width - 48, height - 48).lineWidth(2).stroke('#00d9ff');
        document.rect(34, 34, width - 68, height - 68).lineWidth(0.5).stroke('#1a758d');

        document.fillColor('#00d9ff').font('Helvetica-Bold').fontSize(12)
            .text('FERIA DE ROBÓTICA NOBSA 2026', 60, 62, { align: 'center', width: width - 120, characterSpacing: 2 });
        document.fillColor('#ffffff').font('Helvetica-Bold').fontSize(30)
            .text('CERTIFICADO DE PARTICIPACIÓN', 60, 105, { align: 'center', width: width - 120 });
        document.fillColor('#9eb4c2').font('Helvetica').fontSize(13)
            .text('Se certifica que el proyecto', 60, 175, { align: 'center', width: width - 120 });
        document.fillColor('#ffffff').font('Helvetica-Bold').fontSize(23)
            .text(registration.projectTitle, 90, 204, { align: 'center', width: width - 180 });
        document.fillColor('#9eb4c2').font('Helvetica').fontSize(12)
            .text('participó en la categoría', 60, 270, { align: 'center', width: width - 120 });
        document.fillColor('#00d9ff').font('Helvetica-Bold').fontSize(16)
            .text(registration.categoryName, 60, 293, { align: 'center', width: width - 120 });

        document.fillColor('#ffffff').font('Helvetica').fontSize(12)
            .text(`Docente a cargo: ${registration.mentorName || 'No registrado'}`, 60, 350, { align: 'center', width: width - 120 })
            .text(`Institución: ${registration.institution}`, 60, 373, { align: 'center', width: width - 120 })
            .text(`Expedido el ${formatDate(registration.createdAt)}`, 60, 396, { align: 'center', width: width - 120 });

        document.moveTo(115, 478).lineTo(280, 478).lineWidth(0.7).stroke('#9eb4c2');
        document.moveTo(width - 280, 478).lineTo(width - 115, 478).lineWidth(0.7).stroke('#9eb4c2');
        document.fillColor('#9eb4c2').fontSize(10)
            .text('Firma autorizada', 115, 488, { align: 'center', width: 165 })
            .text('Firma autorizada', width - 280, 488, { align: 'center', width: 165 });
        document.fillColor('#55717f').fontSize(9)
            .text(`Código de participación: ${registration.code}`, 60, height - 62, { align: 'center', width: width - 120 });
        document.end();
    });
}