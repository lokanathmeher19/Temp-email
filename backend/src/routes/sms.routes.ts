import { Router } from 'express';
import { SMSController } from '../controllers/sms.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

const optionalAuth = (req: any, res: any, next: any) => {
  authenticate(req, res, (err: any) => {
    next();
  });
};

router.post('/request', optionalAuth, SMSController.requestNumber);
router.get('/', authenticate, SMSController.getAllForUser);
router.get('/:id', optionalAuth, SMSController.getById);

// Webhook endpoint (should be protected by provider signature verification)
router.post('/webhook', SMSController.webhook);

export default router;
