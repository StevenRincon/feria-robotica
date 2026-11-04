import type { Request, Response } from 'express';
import { isValidAdminPassword } from '../../src/server/admin-auth.js';

export default function handler(req: Request, res: Response): void {
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, message: 'Método no permitido.' });
        return;
    }

    if (!isValidAdminPassword(req.body?.password)) {
        res.status(401).json({ success: false, message: 'Contraseña administrativa incorrecta.' });
        return;
    }

    res.status(200).json({ success: true });
}
