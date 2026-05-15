"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = require("../utils/prisma");
exports.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2023-10-16',
});
class StripeService {
    static async createCheckoutSession(userId, plan) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        // Define mock price IDs for the plans
        const priceId = plan === 'PRO' ? 'price_pro_mock' : 'price_enterprise_mock';
        const session = await exports.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            client_reference_id: userId,
            customer_email: user.email,
            success_url: `${process.env.FRONTEND_URL}/dashboard/billing?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard/billing?canceled=true`,
        });
        return session.url;
    }
    static async handleWebhook(event) {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id;
            if (userId) {
                // Find subscription from session (in real life, retrieve sub details)
                await prisma_1.prisma.subscription.upsert({
                    where: { stripeSubscriptionId: session.subscription },
                    create: {
                        userId,
                        stripeCustomerId: session.customer,
                        stripeSubscriptionId: session.subscription,
                        plan: 'PRO', // In real life, extract from line items
                        status: 'active',
                        currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    },
                    update: {
                        status: 'active',
                    }
                });
                // Upgrade user role
                await prisma_1.prisma.user.update({
                    where: { id: userId },
                    data: { role: 'PREMIUM' }
                });
            }
        }
        else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            const dbSub = await prisma_1.prisma.subscription.findUnique({
                where: { stripeSubscriptionId: subscription.id }
            });
            if (dbSub) {
                await prisma_1.prisma.subscription.update({
                    where: { id: dbSub.id },
                    data: { status: 'canceled' }
                });
                await prisma_1.prisma.user.update({
                    where: { id: dbSub.userId },
                    data: { role: 'USER' } // Revert to free
                });
            }
        }
    }
}
exports.StripeService = StripeService;
