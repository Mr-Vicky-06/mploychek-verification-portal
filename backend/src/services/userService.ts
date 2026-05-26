import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { mockStore, MockUser } from './mockData';

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'user';
  department?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'suspended';
  role?: 'admin' | 'user';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Returns paginated, searchable, filterable list of users.
 */
export const getUsers = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  role?: string,
  status?: string
): PaginatedResult<Omit<MockUser, 'password'>> => {
  let filtered = [...mockStore.users];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
    );
  }

  if (role) filtered = filtered.filter(u => u.role === role);
  if (status) filtered = filtered.filter(u => u.status === status);

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    data: paginated.map(({ password, ...u }) => u),
    total,
    page,
    limit,
    totalPages,
  };
};

/**
 * Finds a single user by ID.
 */
export const getUserById = (userId: string): Omit<MockUser, 'password'> | null => {
  const user = mockStore.users.find(u => u.userId === userId);
  if (!user) return null;
  const { password, ...sanitized } = user;
  return sanitized;
};

/**
 * Creates a new user and adds to the mock store.
 */
export const createUser = async (payload: CreateUserPayload): Promise<Omit<MockUser, 'password'>> => {
  const existing = mockStore.users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
  if (existing) throw Object.assign(new Error('User with this email already exists'), { statusCode: 409 });

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const newUser: MockUser = {
    userId: `user-${uuidv4().slice(0, 6)}`,
    email: payload.email.toLowerCase(),
    password: hashedPassword,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role || 'user',
    department: payload.department || 'General',
    avatar: '',
    status: 'active',
    verificationCount: 0,
    riskScore: 0,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockStore.users.push(newUser);
  const { password, ...sanitized } = newUser;
  return sanitized;
};

/**
 * Updates an existing user's fields.
 */
export const updateUser = (userId: string, payload: UpdateUserPayload): Omit<MockUser, 'password'> | null => {
  const idx = mockStore.users.findIndex(u => u.userId === userId);
  if (idx === -1) return null;

  const user = mockStore.users[idx];
  if (payload.firstName) user.firstName = payload.firstName;
  if (payload.lastName) user.lastName = payload.lastName;
  if (payload.department) user.department = payload.department;
  if (payload.status) user.status = payload.status;
  if (payload.role) user.role = payload.role;
  user.updatedAt = new Date();

  const { password, ...sanitized } = user;
  return sanitized;
};

/**
 * Removes a user from the mock store.
 */
export const deleteUser = (userId: string): boolean => {
  const idx = mockStore.users.findIndex(u => u.userId === userId);
  if (idx === -1) return false;
  mockStore.users.splice(idx, 1);
  return true;
};
