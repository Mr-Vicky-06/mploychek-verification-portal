import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { VerificationRecord, VerificationStats } from '../../shared/models';
import { interval, takeWhile, delay } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  isLoading = signal(true);
  verifications = signal<VerificationRecord[]>([]);
  stats = signal<VerificationStats | null>(null);
  activeProcessing = signal<{recordId: string; stage: string; progress: number} | null>(null);

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  statusColors: Record<string, string> = {
    completed: 'badge-success',
    processing: 'badge-info',
    'cross-validating': 'badge-info',
    'blockchain-hashing': 'badge-warning',
    queued: 'badge-neutral',
    failed: 'badge-danger',
  };

  riskColors: Record<string, string> = {
    low: 'badge-success',
    medium: 'badge-warning',
    high: 'badge-danger',
  };

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    // Load verifications
    this.apiService.getVerifications().subscribe({
      next: (res) => {
        if (res.success) {
          this.verifications.set(res.data);
        }
      },
      error: () => {},
    });

    // Load stats
    this.apiService.getVerificationStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  simulateProcessing(record: VerificationRecord): void {
    if (this.activeProcessing()) return;

    const stages = [
      { name: 'Queued', progress: 5, delay: 600 },
      { name: 'Document Upload', progress: 15, delay: 800 },
      { name: 'Data Extraction', progress: 30, delay: 1000 },
      { name: 'Processing', progress: 50, delay: 1200 },
      { name: 'Cross-Validating', progress: 70, delay: 1500 },
      { name: 'Blockchain Hashing', progress: 85, delay: 1000 },
      { name: 'AI Scoring', progress: 95, delay: 800 },
      { name: 'Completed', progress: 100, delay: 500 },
    ];

    let currentStage = 0;

    const runNext = () => {
      if (currentStage >= stages.length) {
        this.activeProcessing.set(null);
        // Update the record in the list
        this.verifications.update(records =>
          records.map(r =>
            r.recordId === record.recordId
              ? { ...r, status: 'completed' as const, completionProgress: 100, confidenceScore: Math.floor(Math.random() * 20) + 80 }
              : r
          )
        );
        return;
      }

      const stage = stages[currentStage];
      this.activeProcessing.set({
        recordId: record.recordId,
        stage: stage.name,
        progress: stage.progress,
      });

      currentStage++;
      setTimeout(runNext, stage.delay);
    };

    runNext();
  }

  getProgressWidth(progress: number): string {
    return `${progress}%`;
  }

  getConfidenceColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  trackByRecordId(_: number, record: VerificationRecord): string {
    return record.recordId;
  }
}
