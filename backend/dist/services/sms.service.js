"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSService = void 0;
const prisma_1 = require("../utils/prisma");
class SMSService {
    // Provider Abstraction Layer Example
    static async rentNumberFromProvider(country, service) {
        // In a real scenario, we would use axios to call Twilio / SMSPool / 5SIM APIs
        // e.g., SMSPool.rent({ country, service })
        // For this full working implementation, we mock the provider response
        // since we don't have active paid API keys configured.
        const mockNumber = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        return {
            number: mockNumber,
            provider: 'MockProvider',
        };
    }
    static async requestNumber(userId, country, service) {
        // 1. Call provider
        const { number, provider } = await this.rentNumberFromProvider(country, service);
        // 2. Set expiration (e.g., 20 mins for OTP reception)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 20);
        // 3. Save to DB
        const phoneNumber = await prisma_1.prisma.phoneNumber.create({
            data: {
                number,
                country,
                provider,
                userId,
                expiresAt,
            },
        });
        return phoneNumber;
    }
    static async getUserNumbers(userId) {
        return prisma_1.prisma.phoneNumber.findMany({
            where: { userId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getNumberById(id, userId) {
        const phoneNumber = await prisma_1.prisma.phoneNumber.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { receivedAt: 'desc' },
                },
            },
        });
        if (!phoneNumber) {
            const err = new Error('Phone number not found');
            err.statusCode = 404;
            throw err;
        }
        if (userId && phoneNumber.userId !== userId) {
            const err = new Error('Forbidden');
            err.statusCode = 403;
            throw err;
        }
        return phoneNumber;
    }
    // Webhook for provider to push SMS
    static async handleIncomingSMS(number, sender, content) {
        const phoneNumber = await prisma_1.prisma.phoneNumber.findUnique({
            where: { number }
        });
        if (!phoneNumber || phoneNumber.status !== 'ACTIVE')
            return;
        const message = await prisma_1.prisma.sMSMessage.create({
            data: {
                phoneNumberId: phoneNumber.id,
                sender,
                content,
            }
        });
        // Realtime update would be done here using io.to(phoneNumber.id).emit(...)
        return message;
    }
}
exports.SMSService = SMSService;
