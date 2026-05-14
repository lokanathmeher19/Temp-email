import { Request, Response, NextFunction } from 'express';
import { SMSService } from '../services/sms.service';
import { requestNumberSchema } from '../validators/sms.validator';

export class SMSController {
  static async requestNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { country, service } = requestNumberSchema.parse(req.body);
      const userId = (req as any).user?.id || null;
      
      const phoneNumber = await SMSService.requestNumber(userId, country, service);

      res.status(201).json({ success: true, phoneNumber });
    } catch (error) {
      next(error);
    }
  }

  static async getAllForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Auth required' });
      }

      const numbers = await SMSService.getUserNumbers(userId);
      res.status(200).json({ success: true, numbers });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const phoneNumber = await SMSService.getNumberById(id, userId);
      res.status(200).json({ success: true, phoneNumber });
    } catch (error) {
      next(error);
    }
  }

  // Provider webhook endpoint
  static async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { to, from, text } = req.body; // Mock payload
      await SMSService.handleIncomingSMS(to, from, text);
      res.status(200).send('OK');
    } catch (error) {
      next(error);
    }
  }
}
