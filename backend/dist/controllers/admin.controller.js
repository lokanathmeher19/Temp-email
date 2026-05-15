"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const prisma_1 = require("../utils/prisma");
class AdminController {
    static async getStats(req, res, next) {
        try {
            const [totalUsers, activeMailboxes, totalSMS, totalRevenue] = await Promise.all([
                prisma_1.prisma.user.count(),
                prisma_1.prisma.mailbox.count({ where: { status: 'ACTIVE' } }),
                prisma_1.prisma.sMSMessage.count(),
                // Simple aggregate for subscriptions or payments if added
                prisma_1.prisma.subscription.count({ where: { status: 'active' } })
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getUsers(req, res, next) {
        try {
            const users = await prisma_1.prisma.user.findMany({
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
