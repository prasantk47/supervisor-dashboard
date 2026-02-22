import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-visitors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Visitors</h2>
        <div class="header-actions">
          <select [(ngModel)]="statusFilter" (ngModelChange)="page=1;loadData()" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="rejected">Rejected</option>
          </select>
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search visitors..." class="search-input">
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
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>{{ item.name }}</td>
              <td>{{ item.mobileNumber || '-' }}</td>
              <td>{{ item.rentalUnit?.name || '-' }}</td>
              <td>{{ item.type || '-' }}</td>
              <td><span class="badge" [ngClass]="'badge-' + item.status">{{ item.status }}</span></td>
              <td>{{ item.createdAt | date:'short' }}</td>
              <td class="actions">
                <button class="btn btn-success btn-sm" *ngIf="item.status === 'pending'" (click)="approve(item)">Approve</button>
                <button class="btn btn-danger btn-sm" *ngIf="item.status === 'pending'" (click)="reject(item)">Reject</button>
                <button class="btn btn-primary btn-sm" *ngIf="item.status === 'approved'" (click)="checkIn(item)">Check In</button>
                <button class="btn btn-warning btn-sm" *ngIf="item.status === 'checked_in'" (click)="checkOut(item)">Check Out</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="7" class="empty">No visitors found</td>
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
    .badge-active, .badge-approved, .badge-resolved, .badge-closed, .badge-checked_in { background: #e8f5e9; color: #2e7d32; }
    .badge-pending, .badge-open, .badge-waiting { background: #fff3e0; color: #e65100; }
    .badge-rejected, .badge-cancelled, .badge-checked_out { background: #ffebee; color: #c62828; }
    .badge-in_progress, .badge-acknowledged { background: #e3f2fd; color: #1565c0; }
    .btn { padding: 4px 10px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-success { background: #4caf50; color: #fff; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-warning { background: #ff9800; color: #fff; }
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
export class VisitorsComponent implements OnInit {
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

    this.api.get<any>('/visitors', params).subscribe({
      next: (res) => {
        this.items = res.data?.visitors || res.data || [];
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
    this.api.put<any>(`/visitors/${item.id}/approve`).subscribe({
      next: () => this.loadData()
    });
  }

  reject(item: any): void {
    this.api.put<any>(`/visitors/${item.id}/reject`).subscribe({
      next: () => this.loadData()
    });
  }

  checkIn(item: any): void {
    this.api.put<any>(`/visitors/${item.id}/check-in`).subscribe({
      next: () => this.loadData()
    });
  }

  checkOut(item: any): void {
    this.api.put<any>(`/visitors/${item.id}/check-out`).subscribe({
      next: () => this.loadData()
    });
  }
}
