import { Request, Response } from 'express';
import { getDashboardAnalytics } from '../services/analyticsService';

/**
 * GET /api/analytics
 * Returns comprehensive dashboard analytics. Supports ?delay= for async demo.
 */
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const delay = parseInt(req.query.delay as string) || 0;

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 5000)));
    }

    const analytics = getDashboardAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
};
