"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSController = void 0;
const sms_service_1 = require("../services/sms.service");
const sms_validator_1 = require("../validators/sms.validator");
class SMSController {
    static async requestNumber(req, res, next) {
        try {
            const { country, service } = sms_validator_1.requestNumberSchema.parse(req.body);
            const userId = req.user?.id || null;
            const phoneNumber = await sms_service_1.SMSService.requestNumber(userId, country, service);
            res.status(201).json({ success: true, phoneNumber });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllForUser(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Auth required' });
            }
            const numbers = await sms_service_1.SMSService.getUserNumbers(userId);
            res.status(200).json({ success: true, numbers });
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const phoneNumber = await sms_service_1.SMSService.getNumberById(id, userId);
            res.status(200).json({ success: true, phoneNumber });
        }
        catch (error) {
            next(error);
        }
    }
    // Provider webhook endpoint
    static async webhook(req, res, next) {
        try {
            const { to, from, text } = req.body; // Mock payload
            await sms_service_1.SMSService.handleIncomingSMS(to, from, text);
            res.status(200).send('OK');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SMSController = SMSController;
