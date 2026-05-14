import { prisma } from '../utils/prisma';
import crypto from 'crypto';

export class SMSService {
  // Provider Abstraction Layer Example
  static async rentNumberFromProvider(country: string, service: string) {
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

  static async requestNumber(userId: string | null, country: string, service: string) {
    // 1. Call provider
    const { number, provider } = await this.rentNumberFromProvider(country, service);

    // 2. Set expiration (e.g., 20 mins for OTP reception)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 20);

    // 3. Save to DB
    const phoneNumber = await prisma.phoneNumber.create({
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

  static async getUserNumbers(userId: string) {
    return prisma.phoneNumber.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getNumberById(id: string, userId?: string) {
    const phoneNumber = await prisma.phoneNumber.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { receivedAt: 'desc' },
        },
      },
    });

    if (!phoneNumber) {
      const err = new Error('Phone number not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (userId && phoneNumber.userId !== userId) {
      const err = new Error('Forbidden');
      (err as any).statusCode = 403;
      throw err;
    }

    return phoneNumber;
  }

  // Webhook for provider to push SMS
  static async handleIncomingSMS(number: string, sender: string, content: string) {
    const phoneNumber = await prisma.phoneNumber.findUnique({
      where: { number }
    });

    if (!phoneNumber || phoneNumber.status !== 'ACTIVE') return;

    const message = await prisma.sMSMessage.create({
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
