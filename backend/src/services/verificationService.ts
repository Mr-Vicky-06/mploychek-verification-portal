import { mockStore, MockVerification } from './mockData';
import { VerificationStatus } from '../models/VerificationRecord';

/**
 * Returns verification records for a given user, with optional filtering.
 */
export const getVerificationsByUser = (
  userId: string,
  status?: VerificationStatus
): MockVerification[] => {
  let records = mockStore.verifications.filter(v => v.userId === userId);
  if (status) records = records.filter(v => v.status === status);
  return records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

/**
 * Returns all verification records (admin view) with pagination.
 */
export const getAllVerifications = (
  page: number = 1,
  limit: number = 20,
  status?: string,
  type?: string
) => {
  let filtered = [...mockStore.verifications];
  if (status) filtered = filtered.filter(v => v.status === status);
  if (type) filtered = filtered.filter(v => v.verificationType === type);

  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;

  return {
    data: filtered.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages,
  };
};

/**
 * Returns a single verification record by ID.
 */
export const getVerificationById = (recordId: string): MockVerification | null => {
  return mockStore.verifications.find(v => v.recordId === recordId) || null;
};

/**
 * Simulates an async verification pipeline.
 * Returns stage updates as an array with computed delays.
 * The frontend should use these to animate progressive status updates.
 */
export const simulateAsyncVerification = (recordId: string) => {
  const stages = [
    { name: 'Queued', delay: 0, progress: 5 },
    { name: 'Document Upload', delay: 800, progress: 15 },
    { name: 'Data Extraction', delay: 1200, progress: 35 },
    { name: 'Processing', delay: 1500, progress: 50 },
    { name: 'Cross-Validating', delay: 2000, progress: 70 },
    { name: 'Blockchain Hashing', delay: 1000, progress: 85 },
    { name: 'AI Scoring', delay: 800, progress: 95 },
    { name: 'Completed', delay: 500, progress: 100 },
  ];

  return {
    recordId,
    stages,
    totalDuration: stages.reduce((sum, s) => sum + s.delay, 0),
    confidenceScore: Math.floor(Math.random() * 25) + 75,
    riskLevel: Math.random() > 0.7 ? 'medium' : 'low' as const,
  };
};

/**
 * Generates verification statistics for dashboard analytics.
 */
export const getVerificationStats = (userId?: string) => {
  const records = userId
    ? mockStore.verifications.filter(v => v.userId === userId)
    : mockStore.verifications;

  const total = records.length;
  const completed = records.filter(v => v.status === 'completed').length;
  const processing = records.filter(v => ['processing', 'cross-validating', 'blockchain-hashing'].includes(v.status)).length;
  const queued = records.filter(v => v.status === 'queued').length;
  const failed = records.filter(v => v.status === 'failed').length;

  const avgConfidence = records.length > 0
    ? Math.round(records.reduce((sum, v) => sum + v.confidenceScore, 0) / records.length)
    : 0;

  const byType = records.reduce((acc, v) => {
    acc[v.verificationType] = (acc[v.verificationType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byRisk = records.reduce((acc, v) => {
    acc[v.riskLevel] = (acc[v.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly trend (last 6 months)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString('default', { month: 'short' });
    return {
      month,
      completed: Math.floor(Math.random() * 30) + 10,
      failed: Math.floor(Math.random() * 8),
      processing: Math.floor(Math.random() * 15) + 5,
    };
  });

  return {
    total,
    completed,
    processing,
    queued,
    failed,
    avgConfidence,
    successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    byType,
    byRisk,
    monthlyTrend,
  };
};
