import { prisma } from '../utils/prisma';
import crypto from 'crypto';

export class MailboxService {
  static getSupportedDomains(): string[] {
    const domains = process.env.SUPPORTED_DOMAINS || 'tempmail.local';
    return domains.split(',').map((d) => d.trim());
  }

  static generateRandomString(length = 10): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  }

  static async createMailbox(userId: string | null, customUsername?: string, customDomain?: string) {
    const domains = this.getSupportedDomains();
    const domain = customDomain && domains.includes(customDomain) ? customDomain : domains[0];
    const username = customUsername || this.generateRandomString(12);
    const address = `${username}@${domain}`.toLowerCase();

    // Check if address exists
    const existing = await prisma.mailbox.findUnique({ where: { address } });
    if (existing) {
      const err = new Error('Address already in use');
      (err as any).statusCode = 409;
      throw err;
    }

    // Set expiration to 24 hours from now for free tier
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const mailbox = await prisma.mailbox.create({
      data: {
        address,
        userId,
        expiresAt,
      },
    });

    return mailbox;
  }

  static async getUserMailboxes(userId: string) {
    return prisma.mailbox.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getMailboxById(id: string, userId?: string) {
    const mailbox = await prisma.mailbox.findUnique({
      where: { id },
      include: {
        emails: {
          orderBy: { receivedAt: 'desc' },
        },
      },
    });

    if (!mailbox) {
      const err = new Error('Mailbox not found');
      (err as any).statusCode = 404;
      throw err;
    }

    // If userId is provided, ensure ownership
    if (userId && mailbox.userId !== userId) {
      const err = new Error('Forbidden');
      (err as any).statusCode = 403;
      throw err;
    }

    return mailbox;
  }

  static async deleteMailbox(id: string, userId?: string) {
    const mailbox = await prisma.mailbox.findUnique({ where: { id } });
    if (!mailbox) return;

    if (userId && mailbox.userId !== userId) {
      const err = new Error('Forbidden');
      (err as any).statusCode = 403;
      throw err;
    }

    await prisma.mailbox.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }
}
