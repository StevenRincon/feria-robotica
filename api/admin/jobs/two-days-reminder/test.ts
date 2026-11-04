import type { Request, Response } from 'express';
import { sendReminderTestHandler } from '../../../../src/server/admin-reminder-handlers.js';

export default function handler(req: Request, res: Response): Promise<void> {
    return sendReminderTestHandler(req, res);
}
