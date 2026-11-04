import type { Request, Response } from 'express';
import { sendBulkReminderHandler } from '../../../../src/server/admin-reminder-handlers.js';

export default function handler(req: Request, res: Response): Promise<void> {
    return sendBulkReminderHandler(req, res);
}
