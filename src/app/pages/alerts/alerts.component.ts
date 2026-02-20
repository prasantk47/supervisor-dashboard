import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>SOS / Emergency Alerts</h2>
        <div class="header-actions">
          <select [(ngModel)]="statusFilter" (ngModelChange)="page=1;loadData()" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="responding">Responding</option>
            <option value="resolved">Resolved</option>
            <option value="false_alarm">False Alarm</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select [(ngModel)]="typeFilter" (ngModelChange)="page=1;loadData()" class="filter-select">
            <option value="">All Types</option>
            <option value="sos">SOS</option>
            <option value="fire">Fire</option>
            <option value="medical">Medical</option>
            <option value="security">Security</option>
            <option value="intrusion">Intrusion</option>
            <option value="gas_leak">Gas Leak</option>
            <option value="water_leak">Water Leak</option>
            <option value="power_outage">Power Outage</option>
            <option value="lift_emergency">Lift Emergency</option>
            <option value="other">Other</option>
          </select>
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search alerts..." class="search-input">
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row" *ngIf="stats">
        <div class="stat-card stat-active">
          <div class="stat-value">{{ stats.active || 0 }}</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat-card stat-ack">
          <div class="stat-value">{{ stats.acknowledged || 0 }}</div>
          <div class="stat-label">Acknowledged</div>
        </div>
        <div class="stat-card stat-resolved">
          <div class="stat-value">{{ stats.resolved || 0 }}</div>
          <div class="stat-label">Resolved</div>
        </div>
        <div class="stat-card stat-total">
          <div class="stat-value">{{ stats.total || 0 }}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>

      <!-- Detail Modal -->
      <div class="modal-overlay" *ngIf="selectedAlert" (click)="selectedAlert=null">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Alert Details</h3>
            <button class="btn-close" (click)="selectedAlert=null">&times;</button>
          </div>
          <div class="modal-body">
            <div class="detail-row"><strong>Type:</strong> {{ selectedAlert.alertType }}</div>
            <div class="detail-row"><strong>Title:</strong> {{ selectedAlert.title }}</div>
            <div class="detail-row"><strong>Status:</strong> <span class="badge" [ngClass]="'badge-' + selectedAlert.status">{{ selectedAlert.status }}</span></div>
            <div class="detail-row"><strong>Priority:</strong> <span class="badge" [ngClass]="'badge-priority-' + selectedAlert.priority">{{ selectedAlert.priority }}</span></div>
            <div class="detail-row" *ngIf="selectedAlert.description"><strong>Description:</strong> {{ selectedAlert.description }}</div>
            <div class="detail-row" *ngIf="selectedAlert.location"><strong>Location:</strong> {{ selectedAlert.location }}</div>
            <div class="detail-row"><strong>Raised By:</strong> {{ selectedAlert.user?.firstName || '' }} {{ selectedAlert.user?.lastName || '' }}</div>
            <div class="detail-row"><strong>Phone:</strong> {{ selectedAlert.user?.mobileNumber || 'N/A' }}</div>
            <div class="detail-row"><strong>Created:</strong> {{ selectedAlert.createdAt | date:'medium' }}</div>
            <div class="detail-row" *ngIf="selectedAlert.acknowledgedAt"><strong>Acknowledged:</strong> {{ selectedAlert.acknowledgedAt | date:'medium' }}</div>
            <div class="detail-row" *ngIf="selectedAlert.resolvedAt"><strong>Resolved:</strong> {{ selectedAlert.resolvedAt | date:'medium' }}</div>
            <div class="detail-row" *ngIf="selectedAlert.resolutionNotes"><strong>Resolution:</strong> {{ selectedAlert.resolutionNotes }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" *ngIf="selectedAlert.status === 'active'" (click)="acknowledge(selectedAlert)">Acknowledge</button>
            <button class="btn btn-info" *ngIf="selectedAlert.status === 'acknowledged'" (click)="respond(selectedAlert)">Mark Responding</button>
            <button class="btn btn-success" *ngIf="selectedAlert.status !== 'resolved' && selectedAlert.status !== 'false_alarm' && selectedAlert.status !== 'cancelled'" (click)="resolve(selectedAlert)">Resolve</button>
            <button class="btn btn-warning" *ngIf="selectedAlert.status !== 'resolved' && selectedAlert.status !== 'false_alarm' && selectedAlert.status !== 'cancelled'" (click)="falseAlarm(selectedAlert)">False Alarm</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Raised By</th>
              <th>Location</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items" [class.row-active]="item.status === 'active'" [class.row-critical]="item.priority === 'critical'">
              <td><span class="type-badge">{{ item.alertType }}</span></td>
              <td class="clickable" (click)="selectedAlert=item">{{ item.title || '-' }}</td>
              <td><span class="badge" [ngClass]="'badge-priority-' + item.priority">{{ item.priority || 'medium' }}</span></td>
              <td><span class="badge" [ngClass]="'badge-' + item.status">{{ item.status }}</span></td>
              <td>{{ item.user?.firstName || '' }} {{ item.user?.lastName || '' }}</td>
              <td>{{ item.location || '-' }}</td>
              <td>{{ item.createdAt | date:'short' }}</td>
              <td class="actions">
                <button class="btn btn-primary btn-sm" *ngIf="item.status === 'active'" (click)="acknowledge(item)">Ack</button>
                <button class="btn btn-info btn-sm" *ngIf="item.status === 'acknowledged'" (click)="respond(item)">Respond</button>
                <button class="btn btn-success btn-sm" *ngIf="item.status !== 'resolved' && item.status !== 'false_alarm' && item.status !== 'cancelled'" (click)="resolve(item)">Resolve</button>
                <button class="btn btn-sm btn-view" (click)="selectedAlert=item">View</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="8" class="empty">No alerts found</td>
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
    .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .search-input, .filter-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .search-input { width: 200px; }
    .search-input:focus, .filter-select:focus { outline: none; border-color: #4fc3f7; }

    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-top: 3px solid #ddd; }
    .stat-active { border-top-color: #f44336; }
    .stat-ack { border-top-color: #ff9800; }
    .stat-resolved { border-top-color: #4caf50; }
    .stat-total { border-top-color: #2196f3; }
    .stat-value { font-size: 28px; font-weight: 700; color: #333; }
    .stat-label { font-size: 12px; color: #888; margin-top: 4px; }

    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }

    .row-active { background: #fff3e0; }
    .row-critical { background: #ffebee; }
    .clickable { cursor: pointer; color: #1565c0; }
    .clickable:hover { text-decoration: underline; }

    .type-badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #e3f2fd; color: #1565c0; text-transform: uppercase; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #ffebee; color: #c62828; }
    .badge-acknowledged { background: #fff3e0; color: #e65100; }
    .badge-responding { background: #e3f2fd; color: #1565c0; }
    .badge-resolved { background: #e8f5e9; color: #2e7d32; }
    .badge-false_alarm { background: #fce4ec; color: #ad1457; }
    .badge-cancelled { background: #f5f5f5; color: #757575; }
    .badge-priority-critical { background: #f44336; color: #fff; }
    .badge-priority-high { background: #ff9800; color: #fff; }
    .badge-priority-medium { background: #ff9800; color: #fff; }
    .badge-priority-low { background: #4caf50; color: #fff; }

    .btn { padding: 5px 12px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-success { background: #4caf50; color: #fff; }
    .btn-info { background: #2196f3; color: #fff; }
    .btn-warning { background: #ff9800; color: #fff; }
    .btn-view { background: #eee; color: #333; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .actions { white-space: nowrap; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: #fff; border-radius: 10px; padding: 0; width: 500px; max-height: 80vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #eee; }
    .modal-header h3 { margin: 0; }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
    .modal-body { padding: 20px; }
    .detail-row { margin-bottom: 12px; font-size: 14px; }
    .detail-row strong { color: #555; min-width: 120px; display: inline-block; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid #eee; display: flex; gap: 8px; justify-content: flex-end; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class AlertsComponent implements OnInit {
  items: any[] = [];
  loading = false;
  search = '';
  statusFilter = '';
  typeFilter = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;
  stats: any = null;
  selectedAlert: any = null;

  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
    this.loadStats();
  }

  loadData(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.typeFilter) params.alertType = this.typeFilter;

    this.api.get<any>('/alerts', params).subscribe({
      next: (res) => {
        this.items = res.data?.alerts || res.data || [];
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

  loadStats(): void {
    this.api.get<any>('/alerts/statistics').subscribe({
      next: (res) => { this.stats = res.data || null; },
      error: () => {}
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

  acknowledge(item: any): void {
    this.api.put<any>(`/alerts/${item.id}/acknowledge`).subscribe({
      next: () => { this.loadData(); this.loadStats(); if (this.selectedAlert?.id === item.id) this.selectedAlert = null; }
    });
  }

  respond(item: any): void {
    this.api.put<any>(`/alerts/${item.id}/respond`).subscribe({
      next: () => { this.loadData(); this.loadStats(); if (this.selectedAlert?.id === item.id) this.selectedAlert = null; }
    });
  }

  resolve(item: any): void {
    if (!confirm('Mark this alert as resolved?')) return;
    this.api.put<any>(`/alerts/${item.id}/resolve`, { resolutionNotes: 'Resolved from dashboard' }).subscribe({
      next: () => { this.loadData(); this.loadStats(); if (this.selectedAlert?.id === item.id) this.selectedAlert = null; }
    });
  }

  falseAlarm(item: any): void {
    const reason = prompt('Enter reason for marking as false alarm:');
    if (!reason) return;
    this.api.put<any>(`/alerts/${item.id}/false-alarm`, { reason }).subscribe({
      next: () => { this.loadData(); this.loadStats(); if (this.selectedAlert?.id === item.id) this.selectedAlert = null; }
    });
  }
}
