import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { User, PaginatedResponse } from '../../../shared/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  isLoading = signal(true);
  users = signal<User[]>([]);
  pagination = signal({ total: 0, page: 1, limit: 10, totalPages: 0 });

  searchQuery = '';
  filterRole = '';
  filterStatus = '';

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  selectedUser = signal<User | null>(null);
  isSaving = signal(false);

  // New user form
  newUser = { email: '', password: '', firstName: '', lastName: '', department: 'General', role: 'user' as const };

  // Edit user form
  editData = { firstName: '', lastName: '', department: '', status: '' as any, role: '' as any };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 1): void {
    this.isLoading.set(true);
    this.apiService
      .getUsers(page, 10, this.searchQuery || undefined, this.filterRole || undefined, this.filterStatus || undefined, 1000)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.users.set(res.data.data);
            this.pagination.set({
              total: res.data.total,
              page: res.data.page,
              limit: res.data.limit,
              totalPages: res.data.totalPages,
            });
          }
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  onSearch(): void {
    this.loadUsers(1);
  }

  onFilterChange(): void {
    this.loadUsers(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination().totalPages) {
      this.loadUsers(page);
    }
  }

  openCreateModal(): void {
    this.newUser = { email: '', password: '', firstName: '', lastName: '', department: 'General', role: 'user' };
    this.showCreateModal.set(true);
  }

  createUser(): void {
    this.isSaving.set(true);
    this.apiService.createUser(this.newUser as any).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showCreateModal.set(false);
        this.loadUsers();
      },
      error: () => this.isSaving.set(false),
    });
  }

  openEditModal(user: User): void {
    this.selectedUser.set(user);
    this.editData = {
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      status: user.status,
      role: user.role,
    };
    this.showEditModal.set(true);
  }

  saveEdit(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.isSaving.set(true);
    this.apiService.updateUser(user.userId, this.editData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showEditModal.set(false);
        this.loadUsers(this.pagination().page);
      },
      error: () => this.isSaving.set(false),
    });
  }

  openDeleteModal(user: User): void {
    this.selectedUser.set(user);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.isSaving.set(true);
    this.apiService.deleteUser(user.userId).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showDeleteModal.set(false);
        this.loadUsers(this.pagination().page);
      },
      error: () => this.isSaving.set(false),
    });
  }

  getStatusClass(status: string): string {
    return status === 'active' ? 'badge-success' : status === 'suspended' ? 'badge-danger' : 'badge-neutral';
  }

  getUserInitials(user: User): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  get paginationPages(): number[] {
    const p = this.pagination();
    const pages: number[] = [];
    const start = Math.max(1, p.page - 2);
    const end = Math.min(p.totalPages, p.page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
