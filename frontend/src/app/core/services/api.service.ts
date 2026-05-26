import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, delay, retry } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse, User, VerificationRecord, VerificationStats, AsyncVerificationPipeline, DashboardAnalytics } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /* ── Users ─────────────────────────────────────────────── */

  getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    status?: string,
    delayMs?: number
  ): Observable<ApiResponse<PaginatedResponse<User>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (status) params = params.set('status', status);
    if (delayMs) params = params.set('delay', delayMs.toString());

    return this.http
      .get<ApiResponse<PaginatedResponse<User>>>(`${this.baseUrl}/users`, { params })
      .pipe(retry(1));
  }

  getUserById(userId: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/users/${userId}`);
  }

  createUser(userData: Partial<User> & { password: string }): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/users`, userData);
  }

  updateUser(userId: string, userData: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/users/${userId}`);
  }

  /* ── Verifications ─────────────────────────────────────── */

  getVerifications(status?: string, type?: string): Observable<ApiResponse<VerificationRecord[]>> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (type) params = params.set('type', type);

    return this.http.get<ApiResponse<VerificationRecord[]>>(`${this.baseUrl}/verifications`, { params });
  }

  getVerificationById(recordId: string): Observable<ApiResponse<VerificationRecord>> {
    return this.http.get<ApiResponse<VerificationRecord>>(`${this.baseUrl}/verifications/${recordId}`);
  }

  getAsyncVerification(recordId: string): Observable<ApiResponse<AsyncVerificationPipeline>> {
    return this.http.get<ApiResponse<AsyncVerificationPipeline>>(
      `${this.baseUrl}/verifications/async/${recordId}`
    );
  }

  getVerificationStats(): Observable<ApiResponse<VerificationStats>> {
    return this.http.get<ApiResponse<VerificationStats>>(`${this.baseUrl}/verifications/stats`);
  }

  /* ── Analytics ─────────────────────────────────────────── */

  getAnalytics(delayMs?: number): Observable<ApiResponse<DashboardAnalytics>> {
    let params = new HttpParams();
    if (delayMs) params = params.set('delay', delayMs.toString());

    return this.http
      .get<ApiResponse<DashboardAnalytics>>(`${this.baseUrl}/analytics`, { params })
      .pipe(retry(1));
  }

  /* ── Health ────────────────────────────────────────────── */

  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }
}
