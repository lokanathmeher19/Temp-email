"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
const auth_1 = require("../middlewares/auth");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
router.post('/checkout', auth_1.authenticate, subscription_controller_1.SubscriptionController.createCheckout);
// Stripe webhook must receive raw body
router.post('/webhook', express_2.default.raw({ type: 'application/json' }), subscription_controller_1.SubscriptionController.webhook);
exports.default = router;
