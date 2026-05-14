import { Request, Response, NextFunction } from 'express';
import { MailboxService } from '../services/mailbox.service';
import { createMailboxSchema } from '../validators/mailbox.validator';

export class MailboxController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, domain } = createMailboxSchema.parse(req.body);
      const userId = (req as any).user?.id || null; // Support both auth and anonymous
      
      const mailbox = await MailboxService.createMailbox(userId, username, domain);

      res.status(201).json({ success: true, mailbox });
    } catch (error) {
      next(error);
    }
  }

  static async getAllForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required for this route' });
      }

      const mailboxes = await MailboxService.getUserMailboxes(userId);
      res.status(200).json({ success: true, mailboxes });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id; // Can be undefined

      const mailbox = await MailboxService.getMailboxById(id, userId);
      res.status(200).json({ success: true, mailbox });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      await MailboxService.deleteMailbox(id, userId);
      res.status(200).json({ success: true, message: 'Mailbox deleted' });
    } catch (error) {
      next(error);
    }
  }
}
