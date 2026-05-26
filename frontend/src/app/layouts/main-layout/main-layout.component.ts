import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Sidebar -->
    <aside
      class="sidebar"
      [class.sidebar-collapsed]="sidebarCollapsed()"
      [class.sidebar-mobile-open]="mobileMenuOpen()">

      <!-- Logo -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logo-grad)"/>
              <path d="M8 14L12 18L20 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
                  <stop stop-color="#6366f1"/>
                  <stop offset="1" stop-color="#818cf8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          @if (!sidebarCollapsed()) {
            <div class="logo-text">
              <span class="logo-title">MPloyChek</span>
              <span class="logo-subtitle">Verification Portal</span>
            </div>
          }
        </div>
        <button class="collapse-btn" (click)="toggleSidebar()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            @if (sidebarCollapsed()) {
              <path d="M9 18l6-6-6-6"/>
            } @else {
              <path d="M15 18l-6-6 6-6"/>
            }
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          @if (!sidebarCollapsed()) {
            <span class="nav-section-label">Overview</span>
          }

          <a routerLink="/dashboard" routerLinkActive="nav-item-active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1.5"/>
              <rect x="14" y="3" width="7" height="5" rx="1.5"/>
              <rect x="14" y="12" width="7" height="9" rx="1.5"/>
              <rect x="3" y="16" width="7" height="5" rx="1.5"/>
            </svg>
            @if (!sidebarCollapsed()) {
              <span>Dashboard</span>
            }
          </a>

          @if (authService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="nav-item-active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3h18v18H3z" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
              @if (!sidebarCollapsed()) {
                <span>Admin Panel</span>
              }
            </a>

            <a routerLink="/admin/users" routerLinkActive="nav-item-active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              @if (!sidebarCollapsed()) {
                <span>User Management</span>
              }
            </a>
          }
        </div>
      </nav>

      <!-- User Profile -->
      <div class="sidebar-footer">
        <div class="user-profile" (click)="toggleProfileMenu()">
          <div class="user-avatar">
            {{ userInitials() }}
          </div>
          @if (!sidebarCollapsed()) {
            <div class="user-info">
              <span class="user-name">{{ authService.userDisplayName() }}</span>
              <span class="user-role">{{ authService.currentUser()?.role | titlecase }}</span>
            </div>
          }
        </div>
        @if (profileMenuOpen()) {
          <div class="profile-menu animate-fade-in">
            <button class="profile-menu-item" (click)="logout()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        }
      </div>
    </aside>

    <!-- Mobile overlay -->
    @if (mobileMenuOpen()) {
      <div class="mobile-overlay" (click)="mobileMenuOpen.set(false)"></div>
    }

    <!-- Main Content -->
    <main class="main-content" [class.main-content-collapsed]="sidebarCollapsed()">
      <!-- Topbar -->
      <header class="topbar">
        <button class="mobile-menu-btn" (click)="mobileMenuOpen.set(true)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div class="topbar-right">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">System Online</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-content">
        <router-outlet />
      </div>
    </main>
  `,
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);
  profileMenuOpen = signal(false);

  userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  });

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
