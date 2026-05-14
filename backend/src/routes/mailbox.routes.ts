import { Router } from 'express';
import { MailboxController } from '../controllers/mailbox.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Optional auth middleware
const optionalAuth = (req: any, res: any, next: any) => {
  authenticate(req, res, (err: any) => {
    // Ignore error and proceed as anonymous
    next();
  });
};

router.post('/', optionalAuth, MailboxController.create);
router.get('/', authenticate, MailboxController.getAllForUser);
router.get('/:id', optionalAuth, MailboxController.getById);
router.delete('/:id', optionalAuth, MailboxController.delete);

export default router;
