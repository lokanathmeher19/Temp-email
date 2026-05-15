"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailboxController = void 0;
const mailbox_service_1 = require("../services/mailbox.service");
const mailbox_validator_1 = require("../validators/mailbox.validator");
class MailboxController {
    static async create(req, res, next) {
        try {
            const { username, domain } = mailbox_validator_1.createMailboxSchema.parse(req.body);
            const userId = req.user?.id || null; // Support both auth and anonymous
            const mailbox = await mailbox_service_1.MailboxService.createMailbox(userId, username, domain);
            res.status(201).json({ success: true, mailbox });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllForUser(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Authentication required for this route' });
            }
            const mailboxes = await mailbox_service_1.MailboxService.getUserMailboxes(userId);
            res.status(200).json({ success: true, mailboxes });
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id; // Can be undefined
            const mailbox = await mailbox_service_1.MailboxService.getMailboxById(id, userId);
            res.status(200).json({ success: true, mailbox });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            await mailbox_service_1.MailboxService.deleteMailbox(id, userId);
            res.status(200).json({ success: true, message: 'Mailbox deleted' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MailboxController = MailboxController;
