"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicApi_controller_1 = require("../controllers/publicApi.controller");
const auth_1 = require("../middlewares/auth");
const apiKeyAuth_1 = require("../middlewares/apiKeyAuth");
const router = (0, express_1.Router)();
// Dashboard Route: Generate API Key (Protected by standard JWT auth)
router.post('/keys', auth_1.authenticate, publicApi_controller_1.PublicApiController.generateKey);
// Public Developer API Routes (Protected by API Key)
router.post('/mailboxes', apiKeyAuth_1.apiKeyAuth, publicApi_controller_1.PublicApiController.createMailbox);
router.get('/mailboxes/:mailboxId/emails', apiKeyAuth_1.apiKeyAuth, publicApi_controller_1.PublicApiController.getEmails);
exports.default = router;
