"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicApiController = void 0;
const prisma_1 = require("../utils/prisma");
const crypto_1 = __importDefault(require("crypto"));
const mailbox_service_1 = require("../services/mailbox.service");
class PublicApiController {
    // Generate a new API Key for a user (called from dashboard via JWT)
    static async generateKey(req, res, next) {
        try {
            const userId = req.user.id;
            const { name } = req.body;
            const rawKey = `te_live_${crypto_1.default.randomBytes(24).toString('hex')}`;
            const apiKey = await prisma_1.prisma.aPIKey.create({
                data: {
                    key: rawKey,
                    name: name || 'Default Key',
                    userId
                }
            });
            res.status(201).json({ success: true, apiKey: { id: apiKey.id, key: apiKey.key, name: apiKey.name } });
        }
        catch (error) {
            next(error);
        }
    }
    // Called externally via x-api-key
    static async createMailbox(req, res, next) {
        try {
            const userId = req.user.id;
            const { username, domain } = req.body;
            const mailbox = await mailbox_service_1.MailboxService.createMailbox(userId, username, domain);
            res.status(201).json({ success: true, mailbox });
        }
        catch (error) {
            next(error);
        }
    }
    // Called externally via x-api-key
    static async getEmails(req, res, next) {
        try {
            const userId = req.user.id;
            const { mailboxId } = req.params;
            const mailbox = await mailbox_service_1.MailboxService.getMailboxById(mailboxId, userId);
            res.status(200).json({ success: true, emails: mailbox.emails });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PublicApiController = PublicApiController;
