"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../utils/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    static async register(email, passwordHashRaw) {
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            const err = new Error('Email is already in use');
            err.statusCode = 409;
            throw err;
        }
        const passwordHash = await bcryptjs_1.default.hash(passwordHashRaw, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                passwordHash,
            },
        });
        return this.generateTokens(user.id, user.role);
    }
    static async login(email, passwordHashRaw) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            throw err;
        }
        const isValid = await bcryptjs_1.default.compare(passwordHashRaw, user.passwordHash);
        if (!isValid) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            throw err;
        }
        return this.generateTokens(user.id, user.role);
    }
    static generateTokens(userId, role) {
        const accessToken = jsonwebtoken_1.default.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') });
        const refreshToken = jsonwebtoken_1.default.sign({ id: userId, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') });
        return { accessToken, refreshToken };
    }
}
exports.AuthService = AuthService;
