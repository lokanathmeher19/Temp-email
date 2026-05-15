"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const stripe_service_1 = require("../services/stripe.service");
class SubscriptionController {
    static async createCheckout(req, res, next) {
        try {
            const userId = req.user.id;
            const { plan } = req.body;
            if (!['PRO', 'ENTERPRISE'].includes(plan)) {
                return res.status(400).json({ success: false, message: 'Invalid plan selected' });
            }
            const url = await stripe_service_1.StripeService.createCheckoutSession(userId, plan);
            res.status(200).json({ success: true, url });
        }
        catch (error) {
            next(error);
        }
    }
    static async webhook(req, res, next) {
        const signature = req.headers['stripe-signature'];
        let event;
        try {
            // Must use raw body for stripe signature verification, 
            // but for simplicity in this boiler we assume parsed or raw is configured correctly
            event = stripe_service_1.stripe.webhooks.constructEvent(req.body, // In real app, this should be raw Buffer
            signature, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        try {
            await stripe_service_1.StripeService.handleWebhook(event);
            res.status(200).json({ received: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SubscriptionController = SubscriptionController;
