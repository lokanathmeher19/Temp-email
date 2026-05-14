import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middlewares/auth';
import express from 'express';

const router = Router();

router.post('/checkout', authenticate, SubscriptionController.createCheckout);

// Stripe webhook must receive raw body
router.post(
  '/webhook', 
  express.raw({ type: 'application/json' }), 
  SubscriptionController.webhook
);

export default router;
