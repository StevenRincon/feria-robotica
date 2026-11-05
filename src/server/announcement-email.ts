import nodemailer, { type Transporter } from 'nodemailer';
import type { Registration } from '../app/models/registration.model';

const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const eventPage = 'https://feria-robotica.vercel.app/';
const badgePage = `${eventPage}#escarapelas`;
const eventLocation = 'https://maps.app.goo.gl/zgff8TjSKKngPFrZ7';

interface AnnouncementMessage {
  text: string;
  html: string;
}

export interface AnnouncementEmailResult {
  sent: number;
  failed: number;
  total: number;
}

export function isReminderEmailConfigured(): boolean {
  return Boolean(process.env['GMAIL_USER'] && process.env['GMAIL_APP_PASSWORD']?.replace(/\s/g, ''));
}

export function isValidAnnouncementEmail(value: unknown): value is string {
  return typeof value === 'string' && emailPattern.test(value.trim());
}

export function getAnnouncementRecipients(registrations: Registration[]): string[] {
  const recipients = new Set<string>();

  for (const registration of registrations) {
    const emails = [
      registration.leaderEmail,
      registration.mentorEmail,
      ...registration.members.map(member => member.email)
    ];

    for (const email of emails) {
      const normalizedEmail = email?.trim().toLowerCase();
      if (normalizedEmail && isValidAnnouncementEmail(normalizedEmail)) {
        recipients.add(normalizedEmail);
      }
    }
  }

  return [...recipients];
}

function createAnnouncementMessage(): AnnouncementMessage {
  const imageBaseUrl = process.env['PUBLIC_APP_URL'] || eventPage;
  const imageUrl = new URL('/2dias.jpeg', imageBaseUrl).toString();
  const text = [
    'Estamos muy contentos de recibirlos. ¡Faltan solo dos días para nuestra Feria de Robótica!',
    '',
    `Descarga las escarapelas desde esta sección: ${badgePage}`,
    '',
    'Para descargarlas solo necesitas el código DANE o NIT de la institución educativa.',
    'Esperamos contar con el ingreso de los participantes alrededor de las 7:30 de la mañana.',
    'Si los datos de algún estudiante o docente quedaron incorrectos en la inscripción, podrán corregirse el día del evento.',
    'Si algún participante inscrito no puede asistir, podrá ser reemplazado por otro estudiante. El cambio de participante se podrá realizar el día del evento.',
    '',
    `Ubicación del evento: ${eventLocation}`
  ].join('\n');
  const html = `<div style="font-family:Arial,sans-serif;color:#17212b;max-width:680px;margin:0 auto">
    <img src="${imageUrl}" alt="Faltan 2 días para la Feria de Robótica Nobsa" style="display:block;width:100%;max-width:680px;height:auto;margin:0 auto 24px">
    <h1 style="color:#087e8b">¡Faltan solo dos días!</h1>
    <p>Estamos muy contentos de recibirlos en nuestra Feria de Robótica.</p>
    <p>Para descargar las escarapelas solo necesitan el código DANE o NIT de la institución educativa.</p>
    <p><a href="${badgePage}" style="display:inline-block;background:#087e8b;color:#fff;padding:12px 20px;text-decoration:none;font-weight:bold">DESCARGAR ESCARAPELAS</a></p>
    <p>Enlace directo a la sección: <a href="${badgePage}">${badgePage}</a></p>
    <p>Esperamos contar con el ingreso de los participantes alrededor de las 7:30 de la mañana.</p>
    <p>Si los datos de algún estudiante o docente quedaron incorrectos en la inscripción, podrán corregirse el día del evento.</p>
    <p>Si algún participante inscrito no puede asistir, podrá ser reemplazado por otro estudiante. El cambio de participante se podrá realizar el día del evento.</p>
    <p>Ubicación del evento: <a href="${eventLocation}">Ver ubicación en Google Maps</a></p>
  </div>`;
  return { text, html };
}

function createTransporter(): Transporter {
  const user = process.env['GMAIL_USER'];
  const appPassword = process.env['GMAIL_APP_PASSWORD']?.replace(/\s/g, '');
  if (!user || !appPassword) throw new Error('El correo no está configurado.');

  return nodemailer.createTransport({
    service: 'gmail',
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    auth: { user, pass: appPassword }
  });
}

export async function sendTwoDaysReminder(recipients: string[]): Promise<AnnouncementEmailResult> {
  const user = process.env['GMAIL_USER'];
  if (!user) throw new Error('El correo no está configurado.');
  const message = createAnnouncementMessage();
  const transporter = createTransporter();
  const result: AnnouncementEmailResult = { sent: 0, failed: 0, total: recipients.length };

  let nextRecipient = 0;
  const workerCount = Math.min(5, recipients.length);
  try {
    await Promise.all(Array.from({ length: workerCount }, async () => {
      while (nextRecipient < recipients.length) {
        const recipient = recipients[nextRecipient++];
        if (!recipient) continue;

        try {
          const response = await transporter.sendMail({
            from: { name: 'Feria de Robótica Nobsa', address: user },
            to: recipient,
            subject: '¡Faltan dos días para la Feria de Robótica Nobsa!',
            ...message
          });

          if (Array.isArray(response.accepted) && response.accepted.length > 0) {
            result.sent++;
          } else {
            result.failed++;
            console.error('Gmail no aceptó un correo del recordatorio de la feria.');
          }
        } catch (error) {
          result.failed++;
          console.error('No fue posible enviar un correo del recordatorio por Gmail SMTP:', error instanceof Error ? error.message : error);
        }
      }
    }));
  } finally {
    transporter.close();
  }
  return result;
}
