"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = void 0;
const prisma_1 = require("../utils/prisma");
const apiKeyAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'API Key required' });
    }
    try {
        const keyRecord = await prisma_1.prisma.aPIKey.findUnique({
            where: { key: apiKey },
            include: { user: true }
        });
        if (!keyRecord) {
            return res.status(401).json({ success: false, message: 'Invalid API Key' });
        }
        // Update last used
        await prisma_1.prisma.aPIKey.update({
            where: { id: keyRecord.id },
            data: { lastUsedAt: new Date() }
        });
        req.user = keyRecord.user;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.apiKeyAuth = apiKeyAuth;
