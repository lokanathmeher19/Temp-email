import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export class AdminController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalUsers,
        activeMailboxes,
        totalSMS,
        totalRevenue
      ] = await Promise.all([
        prisma.user.count(),
        prisma.mailbox.count({ where: { status: 'ACTIVE' } }),
        prisma.sMSMessage.count(),
        // Simple aggregate for subscriptions or payments if added
        prisma.subscription.count({ where: { status: 'active' } })
      ]);

      // Note: totalRevenue here is just active subscription count for demo.
      // In reality, we'd query Stripe or sum a Payments table.

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          activeMailboxes,
          totalSMS,
          activeSubscriptions: totalRevenue, 
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: { mailboxes: true, phoneNumbers: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50 // pagination would be here
      });

      res.status(200).json({ success: true, users });
    } catch (error) {
      next(error);
    }
  }
}
