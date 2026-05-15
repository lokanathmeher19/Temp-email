"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sms_controller_1 = require("../controllers/sms.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const optionalAuth = (req, res, next) => {
    (0, auth_1.authenticate)(req, res, (err) => {
        next();
    });
};
router.post('/request', optionalAuth, sms_controller_1.SMSController.requestNumber);
router.get('/', auth_1.authenticate, sms_controller_1.SMSController.getAllForUser);
router.get('/:id', optionalAuth, sms_controller_1.SMSController.getById);
// Webhook endpoint (should be protected by provider signature verification)
router.post('/webhook', sms_controller_1.SMSController.webhook);
exports.default = router;
