import Stripe from 'stripe';
import { prisma } from '../utils/prisma';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export class StripeService {
  static async createCheckoutSession(userId: string, plan: 'PRO' | 'ENTERPRISE') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Define mock price IDs for the plans
    const priceId = plan === 'PRO' ? 'price_pro_mock' : 'price_enterprise_mock';

    const session = await stripe.checkout.sessions.create({
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

  static async handleWebhook(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      
      if (userId) {
        // Find subscription from session (in real life, retrieve sub details)
        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: session.subscription as string },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan: 'PRO', // In real life, extract from line items
            status: 'active',
            currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          },
          update: {
            status: 'active',
          }
        });

        // Upgrade user role
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'PREMIUM' }
        });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      const dbSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (dbSub) {
        await prisma.subscription.update({
          where: { id: dbSub.id },
          data: { status: 'canceled' }
        });

        await prisma.user.update({
          where: { id: dbSub.userId },
          data: { role: 'USER' } // Revert to free
        });
      }
    }
  }
}
