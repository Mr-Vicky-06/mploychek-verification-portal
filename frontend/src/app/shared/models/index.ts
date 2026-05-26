export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  department: string;
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  verificationCount: number;
  riskScore: number;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type VerificationType = 'identity' | 'employment' | 'education' | 'criminal' | 'reference' | 'address' | 'credit';
export type VerificationStatus = 'queued' | 'processing' | 'cross-validating' | 'blockchain-hashing' | 'completed' | 'failed';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface VerificationStage {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

export interface VerificationRecord {
  recordId: string;
  userId: string;
  candidateName: string;
  verificationType: VerificationType;
  status: VerificationStatus;
  confidenceScore: number;
  riskLevel: RiskLevel;
  completionProgress: number;
  stages: VerificationStage[];
  result: string;
  notes: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AsyncVerificationPipeline {
  recordId: string;
  stages: { name: string; delay: number; progress: number }[];
  totalDuration: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
}

export interface VerificationStats {
  total: number;
  completed: number;
  processing: number;
  queued: number;
  failed: number;
  avgConfidence: number;
  successRate: number;
  byType: Record<string, number>;
  byRisk: Record<string, number>;
  monthlyTrend: { month: string; completed: number; failed: number; processing: number }[];
}

export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    totalVerifications: number;
    completedVerifications: number;
    successRate: number;
    avgProcessingTime: number;
    avgConfidence: number;
  };
  riskDistribution: Record<string, number>;
  departmentStats: Record<string, { users: number; verifications: number }>;
  weeklyActivity: { day: string; verifications: number; completions: number }[];
  confidenceDistribution: { range: string; count: number }[];
  recentActivity: {
    recordId: string;
    candidateName: string;
    type: string;
    status: string;
    confidenceScore: number;
    timestamp: string;
  }[];
}
