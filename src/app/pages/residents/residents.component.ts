import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Residents</h2>
        <div class="header-actions">
          <select [(ngModel)]="statusFilter" (ngModelChange)="page=1;loadData()" class="filter-select">
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search residents..." class="search-input">
        </div>
      </div>

      <div class="card">
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Unit</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>{{ item.user?.firstName || item.firstName || '' }} {{ item.user?.lastName || item.lastName || '' }}</td>
              <td>{{ item.user?.mobileNumber || item.mobileNumber || item.phone || '-' }}</td>
              <td>{{ item.unit?.unitNumber || item.unitNumber || item.unit || '-' }}</td>
              <td>{{ item.role || item.user?.role || '-' }}</td>
              <td><span class="badge" [ngClass]="'badge-' + (item.status || '').toLowerCase()">{{ item.status || '-' }}</span></td>
              <td class="actions">
                <button class="btn btn-success btn-sm" *ngIf="item.status === 'PENDING'" (click)="approve(item)">Approve</button>
                <button class="btn btn-danger btn-sm" *ngIf="item.status === 'PENDING'" (click)="reject(item)">Reject</button>
                <button class="btn btn-danger btn-sm" *ngIf="item.status === 'APPROVED'" (click)="remove(item)">Remove</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="6" class="empty">No residents found</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" *ngIf="totalPages > 1">
          <button (click)="changePage(page - 1)" [disabled]="page <= 1">Prev</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button (click)="changePage(page + 1)" [disabled]="page >= totalPages">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .page-header h2 { margin: 0; color: #333; }
    .header-actions { display: flex; gap: 10px; align-items: center; }
    .search-input, .filter-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .search-input { width: 240px; }
    .search-input:focus, .filter-select:focus { outline: none; border-color: #4fc3f7; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-approved, .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-rejected, .badge-removed { background: #ffebee; color: #c62828; }
    .btn { padding: 4px 10px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 500; }
    .btn-success { background: #4caf50; color: #fff; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .actions { white-space: nowrap; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class ResidentsComponent implements OnInit {
  items: any[] = [];
  loading = false;
  search = '';
  statusFilter = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;

  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;
    if (this.statusFilter) params.status = this.statusFilter;

    this.api.get<any>('/residents', params).subscribe({
      next: (res) => {
        this.items = res.data?.residents || res.data || [];
        this.total = res.data?.pagination?.total || res.data?.total || this.items.length;
        this.totalPages = Math.ceil(this.total / this.limit);
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 400);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadData();
    }
  }

  approve(item: any): void {
    this.api.put<any>(`/residents/${item.id}/approve`).subscribe({
      next: () => this.loadData()
    });
  }

  reject(item: any): void {
    if (!confirm('Reject this resident?')) return;
    this.api.put<any>(`/residents/${item.id}/reject`).subscribe({
      next: () => this.loadData()
    });
  }

  remove(item: any): void {
    if (!confirm('Remove this resident?')) return;
    this.api.put<any>(`/residents/${item.id}/remove`).subscribe({
      next: () => this.loadData()
    });
  }
}
