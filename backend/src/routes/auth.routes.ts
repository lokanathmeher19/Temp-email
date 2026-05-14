import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', authenticate, AuthController.logout);

// Example protected route to get current user info
router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, user: (req as any).user });
});

export default router;
