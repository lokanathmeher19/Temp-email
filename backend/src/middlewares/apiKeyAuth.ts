import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ success: false, message: 'API Key required' });
  }

  try {
    const keyRecord = await prisma.aPIKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });

    if (!keyRecord) {
      return res.status(401).json({ success: false, message: 'Invalid API Key' });
    }

    // Update last used
    await prisma.aPIKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() }
    });

    (req as any).user = keyRecord.user;
    next();
  } catch (error) {
    next(error);
  }
};
