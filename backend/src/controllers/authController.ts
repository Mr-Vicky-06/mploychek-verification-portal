import { Request, Response } from 'express';
import { authenticateUser } from '../services/authService';

/**
 * POST /api/auth/login
 * Authenticates user credentials and returns JWT token.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const result = await authenticateUser({ email, password });

    if (!result) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    res.json({
      success: true,
      message: 'Authentication successful',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication failed.' });
  }
};

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile.
 */
export const getProfile = (req: any, res: Response): void => {
  res.json({
    success: true,
    data: req.user,
  });
};
