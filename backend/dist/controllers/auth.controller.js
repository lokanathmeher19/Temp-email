"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
class AuthController {
    static async register(req, res, next) {
        try {
            const { email, password } = auth_validator_1.registerSchema.parse(req.body);
            const { accessToken, refreshToken } = await auth_service_1.AuthService.register(email, password);
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                accessToken
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = auth_validator_1.loginSchema.parse(req.body);
            const { accessToken, refreshToken } = await auth_service_1.AuthService.login(email, password);
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.status(200).json({
                success: true,
                message: 'Login successful',
                accessToken
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            res.clearCookie('refresh_token');
            res.status(200).json({ success: true, message: 'Logged out successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
