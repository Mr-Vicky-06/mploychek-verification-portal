import { mockStore } from './mockData';

/**
 * Generates comprehensive analytics data for the admin dashboard.
 */
export const getDashboardAnalytics = () => {
  const users = mockStore.users;
  const verifications = mockStore.verifications;

  // User statistics
  const totalUsers = users.filter(u => u.role === 'user').length;
  const activeUsers = users.filter(u => u.role === 'user' && u.status === 'active').length;
  const newUsersThisMonth = users.filter(u => {
    const now = new Date();
    return u.createdAt.getMonth() === now.getMonth() && u.createdAt.getFullYear() === now.getFullYear();
  }).length;

  // Verification statistics
  const totalVerifications = verifications.length;
  const completedVerifications = verifications.filter(v => v.status === 'completed').length;
  const avgProcessingTime = Math.round(Math.random() * 120 + 60); // minutes

  // Risk distribution
  const riskDistribution = {
    low: verifications.filter(v => v.riskLevel === 'low').length,
    medium: verifications.filter(v => v.riskLevel === 'medium').length,
    high: verifications.filter(v => v.riskLevel === 'high').length,
  };

  // Department breakdown
  const departmentStats = users
    .filter(u => u.role === 'user')
    .reduce((acc, u) => {
      if (!acc[u.department]) acc[u.department] = { users: 0, verifications: 0 };
      acc[u.department].users++;
      acc[u.department].verifications += u.verificationCount;
      return acc;
    }, {} as Record<string, { users: number; verifications: number }>);

  // Weekly activity (last 7 days)
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      verifications: Math.floor(Math.random() * 20) + 5,
      completions: Math.floor(Math.random() * 15) + 3,
    };
  });

  // AI confidence score distribution
  const confidenceDistribution = [
    { range: '90-100', count: verifications.filter(v => v.confidenceScore >= 90).length },
    { range: '80-89', count: verifications.filter(v => v.confidenceScore >= 80 && v.confidenceScore < 90).length },
    { range: '70-79', count: verifications.filter(v => v.confidenceScore >= 70 && v.confidenceScore < 80).length },
    { range: '60-69', count: verifications.filter(v => v.confidenceScore >= 60 && v.confidenceScore < 70).length },
    { range: '<60', count: verifications.filter(v => v.confidenceScore < 60).length },
  ];

  // Recent activity log
  const recentActivity = verifications
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 10)
    .map(v => ({
      recordId: v.recordId,
      candidateName: v.candidateName,
      type: v.verificationType,
      status: v.status,
      confidenceScore: v.confidenceScore,
      timestamp: v.updatedAt,
    }));

  return {
    overview: {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalVerifications,
      completedVerifications,
      successRate: totalVerifications > 0 ? Math.round((completedVerifications / totalVerifications) * 100) : 0,
      avgProcessingTime,
      avgConfidence: Math.round(verifications.reduce((s, v) => s + v.confidenceScore, 0) / (verifications.length || 1)),
    },
    riskDistribution,
    departmentStats,
    weeklyActivity,
    confidenceDistribution,
    recentActivity,
  };
};
