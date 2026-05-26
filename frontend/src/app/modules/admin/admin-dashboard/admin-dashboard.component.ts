import { Component, OnInit, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { DashboardAnalytics } from '../../../shared/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('weeklyChart') weeklyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('riskChart') riskChartRef!: ElementRef<HTMLCanvasElement>;

  isLoading = signal(true);
  analytics = signal<DashboardAnalytics | null>(null);

  private weeklyChart: Chart | null = null;
  private riskChart: Chart | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngAfterViewInit(): void {
    // Charts are initialized after data loads
  }

  private loadAnalytics(): void {
    this.apiService.getAnalytics(1500).subscribe({
      next: (res) => {
        if (res.success) {
          this.analytics.set(res.data);
          this.isLoading.set(false);
          // Need to wait for the DOM to update
          setTimeout(() => this.initCharts(), 100);
        }
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private initCharts(): void {
    const data = this.analytics();
    if (!data) return;

    this.createWeeklyChart(data);
    this.createRiskChart(data);
  }

  private createWeeklyChart(data: DashboardAnalytics): void {
    const ctx = this.weeklyChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;

    if (this.weeklyChart) this.weeklyChart.destroy();

    this.weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.weeklyActivity.map(d => d.day),
        datasets: [
          {
            label: 'Verifications',
            data: data.weeklyActivity.map(d => d.verifications),
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            borderColor: 'rgba(99, 102, 241, 0.8)',
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.6,
          },
          {
            label: 'Completions',
            data: data.weeklyActivity.map(d => d.completions),
            backgroundColor: 'rgba(34, 197, 94, 0.4)',
            borderColor: 'rgba(34, 197, 94, 0.7)',
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { color: '#a1a1aa', font: { family: 'Inter', size: 11 }, boxWidth: 12, boxHeight: 12, borderRadius: 3, useBorderRadius: true },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#71717a', font: { family: 'Inter', size: 11 } } },
          y: { grid: { color: 'rgba(63, 63, 70, 0.3)' }, ticks: { color: '#71717a', font: { family: 'Inter', size: 11 } } },
        },
      },
    });
  }

  private createRiskChart(data: DashboardAnalytics): void {
    const ctx = this.riskChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;

    if (this.riskChart) this.riskChart.destroy();

    this.riskChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [{
          data: [data.riskDistribution['low'] || 0, data.riskDistribution['medium'] || 0, data.riskDistribution['high'] || 0],
          backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(245, 158, 11, 0.6)', 'rgba(239, 68, 68, 0.6)'],
          borderColor: ['rgba(34, 197, 94, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)'],
          borderWidth: 1,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#a1a1aa', font: { family: 'Inter', size: 11 }, padding: 16, boxWidth: 12, boxHeight: 12, borderRadius: 3, useBorderRadius: true },
          },
        },
      },
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      completed: 'badge-success',
      processing: 'badge-info',
      'cross-validating': 'badge-info',
      'blockchain-hashing': 'badge-warning',
      queued: 'badge-neutral',
      failed: 'badge-danger',
    };
    return map[status] || 'badge-neutral';
  }
}
