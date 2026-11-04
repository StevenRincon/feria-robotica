import type { Request, Response } from 'express';
import {
  getAnnouncementRecipients,
  isReminderEmailConfigured,
  isValidAnnouncementEmail,
  sendTwoDaysReminder
} from './announcement-email';
import { isValidAdminPassword } from './admin-auth';
import { registrationsCollection } from './database';

function isAuthorized(req: Request, res: Response): boolean {
  if (isValidAdminPassword(req.get('x-admin-password'))) return true;
  res.status(401).json({ success: false, message: 'No tienes autorización para ejecutar este envío.' });
  return false;
}

function isEmailConfigured(res: Response): boolean {
  if (isReminderEmailConfigured()) return true;
  console.error('Job de correo no disponible: configura GMAIL_USER y GMAIL_APP_PASSWORD.');
  res.status(503).json({ success: false, message: 'El servicio de correo no está configurado en el servidor.' });
  return false;
}

export async function sendReminderTestHandler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Método no permitido.' });
    return;
  }
  if (!isAuthorized(req, res) || !isEmailConfigured(res)) return;

  const recipient = req.body?.email;
  if (!isValidAnnouncementEmail(recipient)) {
    res.status(400).json({ success: false, message: 'Ingresa una dirección de correo válida.' });
    return;
  }

  try {
    const email = recipient.trim().toLowerCase();
    const result = await sendTwoDaysReminder([email]);
    if (result.failed) {
      res.status(502).json({ success: false, message: 'No fue posible entregar el correo de prueba.' });
      return;
    }
    res.status(200).json({ success: true, email });
  } catch (error) {
    console.error('Error enviando el correo de prueba:', error);
    res.status(500).json({ success: false, message: 'No fue posible enviar el correo de prueba. Revisa los registros del servidor.' });
  }
}

export async function sendBulkReminderHandler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Método no permitido.' });
    return;
  }
  if (!isAuthorized(req, res) || !isEmailConfigured(res)) return;

  try {
    const registrations = await (await registrationsCollection()).find().toArray();
    const recipients = getAnnouncementRecipients(registrations);
    if (!recipients.length) {
      res.status(422).json({ success: false, message: 'No hay correos válidos registrados para enviar el recordatorio.' });
      return;
    }

    const result = await sendTwoDaysReminder(recipients);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error ejecutando el job de recordatorio por correo:', error);
    res.status(500).json({ success: false, message: 'No fue posible ejecutar el envío. Revisa los registros del servidor.' });
  }
}
