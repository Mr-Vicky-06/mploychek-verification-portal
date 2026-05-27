import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, delay, throwError } from 'rxjs';
import { ApiResponse, User, VerificationRecord, VerificationStats, AsyncVerificationPipeline, DashboardAnalytics } from '../../shared/models';

// Curated Mock Data Seed Lists
const DEPARTMENTS = ['Engineering', 'Human Resources', 'Finance', 'Operations', 'Legal', 'Marketing'];
const FIRST_NAMES = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Ananya', 'Karthik', 'Divya', 'Rohan', 'Meera', 'Aditya', 'Neha', 'Siddharth', 'Kavya', 'Nikhil'];
const LAST_NAMES = ['Sharma', 'Patel', 'Reddy', 'Gupta', 'Kumar', 'Singh', 'Nair', 'Joshi', 'Mehta', 'Iyer', 'Rao', 'Chatterjee', 'Desai', 'Bhat', 'Pillai'];
const VERIFICATION_TYPES = ['identity', 'employment', 'education', 'criminal', 'reference', 'address', 'credit'];
const STATUSES = ['queued', 'processing', 'cross-validating', 'blockchain-hashing', 'completed', 'failed'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Stored keys
const MOCK_USERS_KEY = 'mploychek_mock_users';
const MOCK_RECORDS_KEY = 'mploychek_mock_records';

// Initialize localStorage DB if empty
function initializeLocalStorageDB() {
  if (!localStorage.getItem(MOCK_USERS_KEY)) {
    const users: User[] = [
      {
        userId: 'admin-001',
        email: 'admin@mploychek.io',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        department: 'Engineering',
        avatar: '',
        status: 'active',
        verificationCount: 0,
        riskScore: 0,
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: new Date().toISOString()
      },
      {
        userId: 'user-001',
        email: 'user@mploychek.io',
        firstName: 'Arjun',
        lastName: 'Sharma',
        role: 'user',
        department: 'Human Resources',
        avatar: '',
        status: 'active',
        verificationCount: 12,
        riskScore: 15,
        lastLogin: new Date().toISOString(),
        createdAt: '2024-03-10T00:00:00.000Z',
        updatedAt: new Date().toISOString()
      }
    ];

    for (let i = 2; i <= 10; i++) {
      const firstName = randomFrom(FIRST_NAMES);
      const lastName = randomFrom(LAST_NAMES);
      users.push({
        userId: `user-00${i}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mploychek.io`,
        firstName,
        lastName,
        role: 'user',
        department: randomFrom(DEPARTMENTS),
        avatar: '',
        status: 'active',
        verificationCount: randomBetween(2, 20),
        riskScore: randomBetween(5, 75),
        lastLogin: new Date().toISOString(),
        createdAt: new Date(Date.now() - randomBetween(30, 365) * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }

  if (!localStorage.getItem(MOCK_RECORDS_KEY)) {
    const records: VerificationRecord[] = [];
    const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    const nonAdminUsers = users.filter((u: User) => u.role === 'user');

    for (const user of nonAdminUsers) {
      const count = randomBetween(2, 4);
      for (let i = 0; i < count; i++) {
        const status = randomFrom(STATUSES) as any;
        const progress = status === 'completed' ? 100 : status === 'failed' ? randomBetween(10, 50) : randomBetween(10, 90);
        const confidence = status === 'completed' ? randomBetween(80, 98) : randomBetween(30, 80);
        const riskLevel = confidence >= 80 ? 'low' : confidence >= 50 ? 'medium' : 'high';
        
        records.push({
          recordId: Math.random().toString(36).substring(2, 10).toUpperCase(),
          userId: user.userId,
          candidateName: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
          verificationType: randomFrom(VERIFICATION_TYPES) as any,
          status,
          confidenceScore: confidence,
          riskLevel,
          completionProgress: progress,
          stages: [
            { name: 'Document Upload', status: 'completed', startedAt: new Date().toISOString(), completedAt: new Date().toISOString(), duration: 250 },
            { name: 'Data Extraction', status: progress > 30 ? 'completed' : 'active', startedAt: new Date().toISOString(), completedAt: progress > 30 ? new Date().toISOString() : undefined, duration: 420 },
            { name: 'Cross-Validation', status: progress > 60 ? 'completed' : progress > 30 ? 'active' : 'pending' },
            { name: 'Blockchain Hash', status: progress > 80 ? 'completed' : progress > 60 ? 'active' : 'pending' },
            { name: 'Final Review', status: status === 'completed' ? 'completed' : 'pending' }
          ],
          result: status === 'completed' ? (confidence > 70 ? 'Verified' : 'Flagged') : '',
          notes: status === 'failed' ? 'Mismatched documentation details' : '',
          assignedTo: 'Compliance Engine v1.2',
          createdAt: new Date(Date.now() - randomBetween(1, 45) * 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
    localStorage.setItem(MOCK_RECORDS_KEY, JSON.stringify(records));
  }
}

// Trigger initialization
initializeLocalStorageDB();

export const mockHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  // We only intercept requests directed towards the backend /api endpoint
  if (!url.includes('/api/')) {
    return next(req);
  }

  const getStoredUsers = (): User[] => JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  const saveStoredUsers = (users: User[]) => localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  
  const getStoredRecords = (): VerificationRecord[] => JSON.parse(localStorage.getItem(MOCK_RECORDS_KEY) || '[]');
  const saveStoredRecords = (records: VerificationRecord[]) => localStorage.setItem(MOCK_RECORDS_KEY, JSON.stringify(records));

  // 1. POST /api/auth/login
  if (url.endsWith('/auth/login') && req.method === 'POST') {
    const { email, password } = req.body as any;
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user && (password === 'admin123' || password === 'user123')) {
      const response: ApiResponse<any> = {
        success: true,
        message: 'Authentication successful',
        data: {
          token: 'mock_jwt_token_auth_verified_2026',
          user
        }
      };
      return of(new HttpResponse({ status: 200, body: response })).pipe(delay(600));
    } else {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { success: false, message: 'Invalid credentials. Use admin@mploychek.io / admin123 or user@mploychek.io / user123.' }
      })).pipe(delay(600));
    }
  }

  // 2. GET /api/users
  if (url.includes('/api/users') && req.method === 'GET') {
    const users = getStoredUsers();
    const response: ApiResponse<any> = {
      success: true,
      message: 'Users retrieved',
      data: {
        data: users,
        total: users.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(users.length / 10)
      }
    };
    return of(new HttpResponse({ status: 200, body: response })).pipe(delay(400));
  }

  // 3. POST /api/users
  if (url.includes('/api/users') && req.method === 'POST') {
    const body = req.body as any;
    const users = getStoredUsers();
    
    const newUser: User = {
      userId: 'user-' + Math.random().toString(36).substring(2, 6),
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role || 'user',
      department: body.department || 'Operations',
      avatar: '',
      status: 'active',
      verificationCount: 0,
      riskScore: 0,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    saveStoredUsers(users);

    const response: ApiResponse<User> = {
      success: true,
      message: 'User created successfully',
      data: newUser
    };
    return of(new HttpResponse({ status: 200, body: response })).pipe(delay(500));
  }

  // 4. PUT /api/users/:id
  if (url.includes('/api/users/') && req.method === 'PUT') {
    const userId = url.split('/').pop() || '';
    const body = req.body as any;
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.userId === userId);

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...body, updatedAt: new Date().toISOString() };
      saveStoredUsers(users);

      const response: ApiResponse<User> = {
        success: true,
        message: 'User updated successfully',
        data: users[userIndex]
      };
      return of(new HttpResponse({ status: 200, body: response })).pipe(delay(400));
    }
  }

  // 5. DELETE /api/users/:id
  if (url.includes('/api/users/') && req.method === 'DELETE') {
    const userId = url.split('/').pop() || '';
    let users = getStoredUsers();
    users = users.filter(u => u.userId !== userId);
    saveStoredUsers(users);

    const response: ApiResponse<any> = {
      success: true,
      message: 'User deleted successfully',
      data: null
    };
    return of(new HttpResponse({ status: 200, body: response })).pipe(delay(300));
  }

  // 6. GET /api/verifications/stats
  if (url.includes('/api/verifications/stats') && req.method === 'GET') {
    const records = getStoredRecords();
    const stats: VerificationStats = {
      total: records.length,
      completed: records.filter(r => r.status === 'completed').length,
      processing: records.filter(r => r.status === 'processing' || r.status === 'cross-validating' || r.status === 'blockchain-hashing').length,
      queued: records.filter(r => r.status === 'queued').length,
      failed: records.filter(r => r.status === 'failed').length,
      avgConfidence: 89,
      successRate: 94,
      byType: {
        identity: records.filter(r => r.verificationType === 'identity').length,
        employment: records.filter(r => r.verificationType === 'employment').length,
        education: records.filter(r => r.verificationType === 'education').length,
        criminal: records.filter(r => r.verificationType === 'criminal').length
      },
      byRisk: {
        low: records.filter(r => r.riskLevel === 'low').length,
        medium: records.filter(r => r.riskLevel === 'medium').length,
        high: records.filter(r => r.riskLevel === 'high').length
      },
      monthlyTrend: [
        { month: 'Jan', completed: 5, failed: 0, processing: 1 },
        { month: 'Feb', completed: 12, failed: 1, processing: 2 },
        { month: 'Mar', completed: 18, failed: 2, processing: 3 }
      ]
    };

    const response: ApiResponse<VerificationStats> = {
      success: true,
      message: 'Stats retrieved',
      data: stats
    };
    return of(new HttpResponse({ status: 200, body: response })).pipe(delay(300));
  }

  // 7. GET /api/verifications/async/:id
  if (url.includes('/api/verifications/async/') && req.method === 'GET') {
    const recordId = url.split('/').pop() || '';
    const records = getStoredRecords();
    const record = records.find(r => r.recordId === recordId);

    if (record) {
      const response: ApiResponse<AsyncVerificationPipeline> = {
        success: true,
        data: {
          recordId: record.recordId,
          stages: [
            { name: 'Document Upload', delay: 1000, progress: 20 },
            { name: 'Data Extraction', delay: 2000, progress: 40 },
            { name: 'Cross-Validation', delay: 3000, progress: 60 },
            { name: 'Blockchain Hash', delay: 4000, progress: 80 },
            { name: 'Final Review', delay: 5000, progress: 100 }
          ],
          totalDuration: 15000,
          confidenceScore: record.confidenceScore,
          riskLevel: record.riskLevel
        }
      };
      return of(new HttpResponse({ status: 200, body: response })).pipe(delay(200));
    }
  }

  // 8. GET /api/verifications
  if (url.includes('/api/verifications') && req.method === 'GET') {
    const records = getStoredRecords();
    const response: ApiResponse<VerificationRecord[]> = {
      success: true,
      message: 'Records retrieved',
      data: records
    };
    return of(new HttpResponse({ status: 200, body: response })).pipe(delay(450));
  }

  // 9. GET /api/analytics
  if (url.includes('/api/analytics') && req.method === 'GET') {
    const records = getStoredRecords();
    const users = getStoredUsers();
    
    const mockAnalytics: DashboardAnalytics = {
      overview: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        newUsersThisMonth: 3,
        totalVerifications: records.length,
        completedVerifications: records.filter(r => r.status === 'completed').length,
        successRate: 94,
        avgProcessingTime: 360,
        avgConfidence: 89
      },
      riskDistribution: {
        low: records.filter(r => r.riskLevel === 'low').length,
        medium: records.filter(r => r.riskLevel === 'medium').length,
        high: records.filter(r => r.riskLevel === 'high').length
      },
      departmentStats: {
        Engineering: { users: 3, verifications: 8 },
        HR: { users: 2, verifications: 12 },
        Finance: { users: 1, verifications: 4 }
      },
      weeklyActivity: [
        { day: 'Mon', verifications: 5, completions: 3 },
        { day: 'Tue', verifications: 8, completions: 6 },
        { day: 'Wed', verifications: 12, completions: 10 },
        { day: 'Thu', verifications: 9, completions: 7 },
        { day: 'Fri', verifications: 14, completions: 12 }
      ],
      confidenceDistribution: [
        { range: '90-100', count: 12 },
        { range: '80-89', count: 8 },
        { range: '70-79', count: 4 },
        { range: 'Below 70', count: 2 }
      ],
      recentActivity: records.slice(0, 3).map(r => ({
        recordId: r.recordId,
        candidateName: r.candidateName,
        type: r.verificationType,
        status: r.status,
        confidenceScore: r.confidenceScore,
        timestamp: r.createdAt
      }))
    };

    const response: ApiResponse<DashboardAnalytics> = {
      success: true,
      message: 'Analytics retrieved',
      data: mockAnalytics
    };
    return of(new HttpResponse({ status: 200, body: response })).pipe(delay(500));
  }

  // Fallback to actual API requests if endpoint is unhandled
  return next(req);
};
