import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import crypto from 'crypto';
import { MailboxService } from '../services/mailbox.service';

export class PublicApiController {
  // Generate a new API Key for a user (called from dashboard via JWT)
  static async generateKey(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { name } = req.body;

      const rawKey = `te_live_${crypto.randomBytes(24).toString('hex')}`;

      const apiKey = await prisma.aPIKey.create({
        data: {
          key: rawKey,
          name: name || 'Default Key',
          userId
        }
      });

      res.status(201).json({ success: true, apiKey: { id: apiKey.id, key: apiKey.key, name: apiKey.name } });
    } catch (error) {
      next(error);
    }
  }

  // Called externally via x-api-key
  static async createMailbox(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { username, domain } = req.body;
      const mailbox = await MailboxService.createMailbox(userId, username, domain);
      res.status(201).json({ success: true, mailbox });
    } catch (error) {
      next(error);
    }
  }

  // Called externally via x-api-key
  static async getEmails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { mailboxId } = req.params;

      const mailbox = await MailboxService.getMailboxById(mailboxId, userId);
      res.status(200).json({ success: true, emails: mailbox.emails });
    } catch (error) {
      next(error);
    }
  }
}
