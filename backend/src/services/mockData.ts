import { v4 as uuidv4 } from 'uuid';
import { VerificationType, VerificationStatus, RiskLevel, IVerificationStage } from '../models/VerificationRecord';

/* ──────────────────────────────────────────────
 *  In-memory mock data store
 *  Used when MongoDB is unavailable (demo mode)
 * ────────────────────────────────────────────── */

const DEPARTMENTS = ['Engineering', 'Human Resources', 'Finance', 'Operations', 'Legal', 'Marketing'];
const FIRST_NAMES = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Ananya', 'Karthik', 'Divya', 'Rohan', 'Meera', 'Aditya', 'Neha', 'Siddharth', 'Kavya', 'Nikhil'];
const LAST_NAMES = ['Sharma', 'Patel', 'Reddy', 'Gupta', 'Kumar', 'Singh', 'Nair', 'Joshi', 'Mehta', 'Iyer', 'Rao', 'Chatterjee', 'Desai', 'Bhat', 'Pillai'];
const VERIFICATION_TYPES: VerificationType[] = ['identity', 'employment', 'education', 'criminal', 'reference', 'address', 'credit'];
const STATUSES: VerificationStatus[] = ['queued', 'processing', 'cross-validating', 'blockchain-hashing', 'completed', 'failed'];
const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStages(status: VerificationStatus): IVerificationStage[] {
  const stageNames = ['Document Upload', 'Data Extraction', 'Cross-Validation', 'Blockchain Hash', 'Final Review'];
  const statusIndex = STATUSES.indexOf(status);
  const completedCount = status === 'completed' ? 5 : status === 'failed' ? randomBetween(1, 3) : Math.min(statusIndex, 4);

  return stageNames.map((name, i) => ({
    name,
    status: i < completedCount ? 'completed' : i === completedCount && status !== 'completed' && status !== 'failed' ? 'active' : 'pending',
    startedAt: i <= completedCount ? new Date(Date.now() - (5 - i) * 3600000) : undefined,
    completedAt: i < completedCount ? new Date(Date.now() - (4 - i) * 3600000) : undefined,
    duration: i < completedCount ? randomBetween(120, 1800) : undefined,
  })) as IVerificationStage[];
}

export interface MockUser {
  userId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  department: string;
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  verificationCount: number;
  riskScore: number;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockVerification {
  recordId: string;
  userId: string;
  candidateName: string;
  verificationType: VerificationType;
  status: VerificationStatus;
  confidenceScore: number;
  riskLevel: RiskLevel;
  completionProgress: number;
  stages: IVerificationStage[];
  result: string;
  notes: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

function generateMockUsers(): MockUser[] {
  const users: MockUser[] = [
    {
      userId: 'admin-001',
      email: 'admin@mploychek.io',
      password: '$2a$10$xVqYLGEMBgSHRKsaLzV0OOqCe0kL/E6XjQHfcrphOeF.GVvay7pDG', // admin123
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      department: 'Engineering',
      avatar: '',
      status: 'active',
      verificationCount: 0,
      riskScore: 0,
      lastLogin: new Date(),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
    },
    {
      userId: 'user-001',
      email: 'user@mploychek.io',
      password: '$2a$10$xVqYLGEMBgSHRKsaLzV0OOqCe0kL/E6XjQHfcrphOeF.GVvay7pDG', // user123
      firstName: 'Arjun',
      lastName: 'Sharma',
      role: 'user',
      department: 'Human Resources',
      avatar: '',
      status: 'active',
      verificationCount: 12,
      riskScore: 15,
      lastLogin: new Date(),
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date(),
    },
  ];

  // Generate additional mock users
  for (let i = 2; i <= 18; i++) {
    const firstName = randomFrom(FIRST_NAMES);
    const lastName = randomFrom(LAST_NAMES);
    const statusOpts: ('active' | 'inactive' | 'suspended')[] = ['active', 'active', 'active', 'inactive', 'suspended'];
    users.push({
      userId: `user-${String(i).padStart(3, '0')}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mploychek.io`,
      password: '$2a$10$xVqYLGEMBgSHRKsaLzV0OOqCe0kL/E6XjQHfcrphOeF.GVvay7pDG',
      firstName,
      lastName,
      role: 'user',
      department: randomFrom(DEPARTMENTS),
      avatar: '',
      status: randomFrom(statusOpts),
      verificationCount: randomBetween(0, 30),
      riskScore: randomBetween(0, 85),
      lastLogin: new Date(Date.now() - randomBetween(0, 30) * 86400000),
      createdAt: new Date(Date.now() - randomBetween(30, 365) * 86400000),
      updatedAt: new Date(),
    });
  }

  return users;
}

function generateMockVerifications(users: MockUser[]): MockVerification[] {
  const records: MockVerification[] = [];
  const nonAdminUsers = users.filter(u => u.role === 'user');

  for (const user of nonAdminUsers) {
    const count = randomBetween(2, 6);
    for (let i = 0; i < count; i++) {
      const status = randomFrom(STATUSES);
      const progress = status === 'completed' ? 100 : status === 'failed' ? randomBetween(10, 60) : randomBetween(10, 90);
      const confidence = status === 'completed' ? randomBetween(75, 99) : randomBetween(20, 80);
      const riskLevel: RiskLevel = confidence >= 80 ? 'low' : confidence >= 50 ? 'medium' : 'high';
      const candidateName = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;

      records.push({
        recordId: uuidv4().slice(0, 8).toUpperCase(),
        userId: user.userId,
        candidateName,
        verificationType: randomFrom(VERIFICATION_TYPES),
        status,
        confidenceScore: confidence,
        riskLevel,
        completionProgress: progress,
        stages: generateStages(status),
        result: status === 'completed' ? (confidence > 70 ? 'Verified' : 'Flagged') : '',
        notes: status === 'failed' ? 'Insufficient documentation provided' : '',
        assignedTo: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
        createdAt: new Date(Date.now() - randomBetween(1, 60) * 86400000),
        updatedAt: new Date(),
        completedAt: status === 'completed' ? new Date(Date.now() - randomBetween(0, 5) * 86400000) : undefined,
      });
    }
  }

  return records;
}

// Singleton data store
class MockDataStore {
  private static instance: MockDataStore;
  public users: MockUser[];
  public verifications: MockVerification[];

  private constructor() {
    this.users = generateMockUsers();
    this.verifications = generateMockVerifications(this.users);
  }

  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }
}

export const mockStore = MockDataStore.getInstance();
