import { Router } from 'express';

import authRoutes from './auth.routes';
import mailboxRoutes from './mailbox.routes';
import smsRoutes from './sms.routes';
import subscriptionRoutes from './subscription.routes';
import adminRoutes from './admin.routes';
import publicApiRoutes from './publicApi.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/mailboxes', mailboxRoutes);
router.use('/sms', smsRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/admin', adminRoutes);
router.use('/developer', publicApiRoutes);

// We will mount sub-routers here later
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Temp-Email API is running' });
});

export default router;
