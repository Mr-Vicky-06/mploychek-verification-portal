import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as verificationService from '../services/verificationService';

/**
 * GET /api/verifications
 * Returns verifications for current user (or all for admin).
 */
export const getVerifications = (req: AuthRequest, res: Response): void => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    if (isAdmin) {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = verificationService.getAllVerifications(page, limit, status, type);
      res.json({ success: true, data: result });
    } else {
      const records = verificationService.getVerificationsByUser(req.user!.userId, status as any);
      res.json({ success: true, data: records });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch verifications.' });
  }
};

/**
 * GET /api/verifications/:id
 */
export const getVerificationById = (req: AuthRequest, res: Response): void => {
  const record = verificationService.getVerificationById(req.params.id);
  if (!record) {
    res.status(404).json({ success: false, message: 'Verification record not found.' });
    return;
  }
  res.json({ success: true, data: record });
};

/**
 * GET /api/verifications/async/:id
 * Returns staged async pipeline data for frontend animation.
 */
export const getAsyncVerification = (req: AuthRequest, res: Response): void => {
  const simulation = verificationService.simulateAsyncVerification(req.params.id);
  res.json({ success: true, data: simulation });
};

/**
 * GET /api/verifications/stats
 * Returns verification analytics & statistics.
 */
export const getVerificationStats = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.role === 'admin' ? undefined : req.user?.userId;
  const stats = verificationService.getVerificationStats(userId);
  res.json({ success: true, data: stats });
};
