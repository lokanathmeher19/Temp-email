import { Router } from 'express';
import { PublicApiController } from '../controllers/publicApi.controller';
import { authenticate } from '../middlewares/auth';
import { apiKeyAuth } from '../middlewares/apiKeyAuth';

const router = Router();

// Dashboard Route: Generate API Key (Protected by standard JWT auth)
router.post('/keys', authenticate, PublicApiController.generateKey);

// Public Developer API Routes (Protected by API Key)
router.post('/mailboxes', apiKeyAuth, PublicApiController.createMailbox);
router.get('/mailboxes/:mailboxId/emails', apiKeyAuth, PublicApiController.getEmails);

export default router;
