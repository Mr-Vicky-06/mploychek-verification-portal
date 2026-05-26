import { Router } from 'express';
import {
  getVerifications,
  getVerificationById,
  getAsyncVerification,
  getVerificationStats,
} from '../controllers/verificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/stats', getVerificationStats);
router.get('/async/:id', getAsyncVerification);
router.get('/:id', getVerificationById);
router.get('/', getVerifications);

export default router;
