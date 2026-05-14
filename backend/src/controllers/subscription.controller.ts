import { Request, Response, NextFunction } from 'express';
import { StripeService, stripe } from '../services/stripe.service';

export class SubscriptionController {
  static async createCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { plan } = req.body;

      if (!['PRO', 'ENTERPRISE'].includes(plan)) {
        return res.status(400).json({ success: false, message: 'Invalid plan selected' });
      }

      const url = await StripeService.createCheckoutSession(userId, plan);
      res.status(200).json({ success: true, url });
    } catch (error) {
      next(error);
    }
  }

  static async webhook(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['stripe-signature'] as string;

    let event;
    try {
      // Must use raw body for stripe signature verification, 
      // but for simplicity in this boiler we assume parsed or raw is configured correctly
      event = stripe.webhooks.constructEvent(
        req.body, // In real app, this should be raw Buffer
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await StripeService.handleWebhook(event);
      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}
