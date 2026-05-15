"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const mailbox_routes_1 = __importDefault(require("./mailbox.routes"));
const sms_routes_1 = __importDefault(require("./sms.routes"));
const subscription_routes_1 = __importDefault(require("./subscription.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const publicApi_routes_1 = __importDefault(require("./publicApi.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/mailboxes', mailbox_routes_1.default);
router.use('/sms', sms_routes_1.default);
router.use('/subscriptions', subscription_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/developer', publicApi_routes_1.default);
// We will mount sub-routers here later
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Temp-Email API is running' });
});
exports.default = router;
