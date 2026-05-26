import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as userService from '../services/userService';

/**
 * GET /api/users
 * Returns paginated users list. Supports ?delay= for async demo.
 */
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;
    const delay = parseInt(req.query.delay as string) || 0;

    // Simulate async processing delay for frontend demo
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 5000)));
    }

    const result = userService.getUsers(page, limit, search, role, status);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

/**
 * GET /api/users/:id
 */
export const getUserById = (req: AuthRequest, res: Response): void => {
  const user = userService.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }
  res.json({ success: true, data: user });
};

/**
 * POST /api/users
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user, message: 'User created successfully.' });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/users/:id
 */
export const updateUser = (req: AuthRequest, res: Response): void => {
  const user = userService.updateUser(req.params.id, req.body);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }
  res.json({ success: true, data: user, message: 'User updated successfully.' });
};

/**
 * DELETE /api/users/:id
 */
export const deleteUser = (req: AuthRequest, res: Response): void => {
  const deleted = userService.deleteUser(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }
  res.json({ success: true, message: 'User deleted successfully.' });
};
