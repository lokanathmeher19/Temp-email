"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mailbox_controller_1 = require("../controllers/mailbox.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Optional auth middleware
const optionalAuth = (req, res, next) => {
    (0, auth_1.authenticate)(req, res, (err) => {
        // Ignore error and proceed as anonymous
        next();
    });
};
router.post('/', optionalAuth, mailbox_controller_1.MailboxController.create);
router.get('/', auth_1.authenticate, mailbox_controller_1.MailboxController.getAllForUser);
router.get('/:id', optionalAuth, mailbox_controller_1.MailboxController.getById);
router.delete('/:id', optionalAuth, mailbox_controller_1.MailboxController.delete);
exports.default = router;
