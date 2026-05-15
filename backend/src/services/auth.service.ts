import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  static async register(email: string, passwordHashRaw: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const err = new Error('Email is already in use');
      (err as any).statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(passwordHashRaw, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    return this.generateTokens(user.id, user.role);
  }

  static async login(email: string, passwordHashRaw: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      const err = new Error('Invalid email or password');
      (err as any).statusCode = 401;
      throw err;
    }

    const isValid = await bcrypt.compare(passwordHashRaw, user.passwordHash);
    if (!isValid) {
      const err = new Error('Invalid email or password');
      (err as any).statusCode = 401;
      throw err;
    }

    return this.generateTokens(user.id, user.role);
  }

  static generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign(
      { id: userId, role },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { id: userId, role },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }
}
