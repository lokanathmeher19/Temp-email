"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailboxService = void 0;
const prisma_1 = require("../utils/prisma");
const crypto_1 = __importDefault(require("crypto"));
class MailboxService {
    static getSupportedDomains() {
        const domains = process.env.SUPPORTED_DOMAINS || 'tempmail.local';
        return domains.split(',').map((d) => d.trim());
    }
    static generateRandomString(length = 10) {
        return crypto_1.default.randomBytes(length).toString('hex').slice(0, length);
    }
    static async createMailbox(userId, customUsername, customDomain) {
        const domains = this.getSupportedDomains();
        const domain = customDomain && domains.includes(customDomain) ? customDomain : domains[0];
        const username = customUsername || this.generateRandomString(12);
        const address = `${username}@${domain}`.toLowerCase();
        // Check if address exists
        const existing = await prisma_1.prisma.mailbox.findUnique({ where: { address } });
        if (existing) {
            const err = new Error('Address already in use');
            err.statusCode = 409;
            throw err;
        }
        // Set expiration to 24 hours from now for free tier
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const mailbox = await prisma_1.prisma.mailbox.create({
            data: {
                address,
                userId,
                expiresAt,
            },
        });
        return mailbox;
    }
    static async getUserMailboxes(userId) {
        return prisma_1.prisma.mailbox.findMany({
            where: { userId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getMailboxById(id, userId) {
        const mailbox = await prisma_1.prisma.mailbox.findUnique({
            where: { id },
            include: {
                emails: {
                    orderBy: { receivedAt: 'desc' },
                },
            },
        });
        if (!mailbox) {
            const err = new Error('Mailbox not found');
            err.statusCode = 404;
            throw err;
        }
        // If userId is provided, ensure ownership
        if (userId && mailbox.userId !== userId) {
            const err = new Error('Forbidden');
            err.statusCode = 403;
            throw err;
        }
        return mailbox;
    }
    static async deleteMailbox(id, userId) {
        const mailbox = await prisma_1.prisma.mailbox.findUnique({ where: { id } });
        if (!mailbox)
            return;
        if (userId && mailbox.userId !== userId) {
            const err = new Error('Forbidden');
            err.statusCode = 403;
            throw err;
        }
        await prisma_1.prisma.mailbox.update({
            where: { id },
            data: { status: 'DELETED' },
        });
    }
}
exports.MailboxService = MailboxService;
