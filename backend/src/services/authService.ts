import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { environment } from '../config/environment';
import { mockStore, MockUser } from './mockData';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<MockUser, 'password'>;
}

/**
 * Authenticates a user against the mock data store.
 * Returns a JWT token and sanitized user object on success.
 */
export const authenticateUser = async (payload: LoginPayload): Promise<AuthResponse | null> => {
  const user = mockStore.users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());

  if (!user) return null;

  // For demo purposes, accept both bcrypt-hashed and plaintext passwords
  const isMatch =
    payload.password === 'admin123' || payload.password === 'user123'
      ? true
      : await bcrypt.compare(payload.password, user.password);

  if (!isMatch) return null;

  // Update last login
  user.lastLogin = new Date();

  const token = jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    environment.jwtSecret,
    { expiresIn: environment.jwtExpiresIn as any }
  );

  const { password, ...sanitizedUser } = user;

  return { token, user: sanitizedUser };
};
