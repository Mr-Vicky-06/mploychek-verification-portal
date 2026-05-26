import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { authMiddleware, adminGuard } from '../middleware/auth';

const router = Router();

router.use(authMiddleware, adminGuard);

router.get('/', getAnalytics);

export default router;
