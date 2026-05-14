import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// Secure all routes with ADMIN role
router.use(authenticate, requireRole(['ADMIN']));

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getUsers);

export default router;
