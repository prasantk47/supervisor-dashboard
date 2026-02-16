import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-move-in-out',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Move In / Out</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'requests'" (click)="activeTab = 'requests'; loadRequests()">Requests</button>
        <button class="tab" [class.active]="activeTab === 'today'" (click)="activeTab = 'today'; loadToday()">Today's Schedule</button>
      </div>

      <!-- REQUESTS TAB -->
      <div *ngIf="activeTab === 'requests'">
        <!-- Filters -->
        <div class="filters-bar">
          <div class="filter-group">
            <label>Status</label>
            <select [(ngModel)]="filterStatus" name="filterStatus" (change)="loadRequests()">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Type</label>
            <select [(ngModel)]="filterType" name="filterType" (change)="loadRequests()">
              <option value="">All Types</option>
              <option value="move_in">Move In</option>
              <option value="move_out">Move Out</option>
            </select>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Move In/Out Requests</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Resident</th>
                <th>Type</th>
                <th>Scheduled Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Vehicle #</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of requests">
                <td class="name-cell">{{ r.unitNumber || r.unit || '-' }}</td>
                <td>{{ r.residentName || r.resident || '-' }}</td>
                <td>
                  <span class="badge" [class.badge-move-in]="r.type === 'move_in'" [class.badge-move-out]="r.type === 'move_out'">
                    {{ r.type === 'move_in' ? 'Move In' : 'Move Out' }}
                  </span>
                </td>
                <td>{{ r.scheduledDate ? (r.scheduledDate | date:'mediumDate') : '-' }}</td>
                <td>{{ r.timeSlot || '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-pending]="r.status === 'pending'"
                    [class.badge-active]="r.status === 'approved'"
                    [class.badge-inactive]="r.status === 'rejected'"
                    [class.badge-progress]="r.status === 'in_progress'"
                    [class.badge-completed]="r.status === 'completed'">
                    {{ r.status | titlecase }}
                  </span>
                </td>
                <td>{{ r.vehicleNumber || '-' }}</td>
                <td class="actions-cell">
                  <button class="btn btn-primary btn-sm" *ngIf="r.status === 'pending'" (click)="approveRequest(r)">Approve</button>
                  <button class="btn btn-danger btn-sm" *ngIf="r.status === 'pending'" (click)="openReject(r)">Reject</button>
                  <button class="btn btn-warning btn-sm" *ngIf="r.status === 'approved'" (click)="startMove(r)">Start Move</button>
                  <button class="btn btn-success btn-sm" *ngIf="r.status === 'in_progress'" (click)="completeMove(r)">Complete</button>
                  <button class="btn btn-secondary btn-sm" (click)="generateNOC(r)">NOC</button>
                </td>
              </tr>
              <tr *ngIf="requests.length === 0"><td colspan="8" class="empty">No requests found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TODAY'S SCHEDULE TAB -->
      <div *ngIf="activeTab === 'today'">
        <div class="card">
          <div class="card-header"><span>Today's Schedule</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Time</th>
                <th>Unit</th>
                <th>Resident</th>
                <th>Type</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of todaySchedule">
                <td>{{ r.timeSlot || '-' }}</td>
                <td class="name-cell">{{ r.unitNumber || r.unit || '-' }}</td>
                <td>{{ r.residentName || r.resident || '-' }}</td>
                <td>
                  <span class="badge" [class.badge-move-in]="r.type === 'move_in'" [class.badge-move-out]="r.type === 'move_out'">
                    {{ r.type === 'move_in' ? 'Move In' : 'Move Out' }}
                  </span>
                </td>
                <td>{{ r.vehicleNumber || '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-pending]="r.status === 'pending'"
                    [class.badge-active]="r.status === 'approved'"
                    [class.badge-inactive]="r.status === 'rejected'"
                    [class.badge-progress]="r.status === 'in_progress'"
                    [class.badge-completed]="r.status === 'completed'">
                    {{ r.status | titlecase }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn btn-primary btn-sm" *ngIf="r.status === 'pending'" (click)="approveRequest(r)">Approve</button>
                  <button class="btn btn-danger btn-sm" *ngIf="r.status === 'pending'" (click)="openReject(r)">Reject</button>
                  <button class="btn btn-warning btn-sm" *ngIf="r.status === 'approved'" (click)="startMove(r)">Start Move</button>
                  <button class="btn btn-success btn-sm" *ngIf="r.status === 'in_progress'" (click)="completeMove(r)">Complete</button>
                  <button class="btn btn-secondary btn-sm" (click)="generateNOC(r)">NOC</button>
                </td>
              </tr>
              <tr *ngIf="todaySchedule.length === 0"><td colspan="7" class="empty">No moves scheduled for today</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reject Modal -->
      <div class="modal-overlay" *ngIf="showRejectModal" (click)="showRejectModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Reject Request</h3>
          <div class="form-group">
            <label>Reason for rejection *</label>
            <textarea [(ngModel)]="rejectReason" name="rejectReason" rows="3" placeholder="Enter reason for rejection"></textarea>
          </div>
          <div class="form-actions">
            <button class="btn btn-danger" [disabled]="!rejectReason.trim() || saving" (click)="confirmReject()">Reject</button>
            <button class="btn btn-secondary" (click)="showRejectModal = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { margin: 0; color: #333; }
    .tabs { display: flex; gap: 4px; margin-bottom: 16px; }
    .tab { padding: 8px 20px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
    .tab:hover { background: #f5f5f5; }
    .tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; }
    .filter-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .filter-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .filter-group select:focus { outline: none; border-color: #4fc3f7; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #333; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .actions-cell { white-space: nowrap; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-completed { background: #e8f5e9; color: #2e7d32; }
    .badge-progress { background: #e3f2fd; color: #1565c0; }
    .badge-move-in { background: #e8f5e9; color: #2e7d32; }
    .badge-move-out { background: #fce4ec; color: #c62828; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-warning { background: #ff9800; color: #fff; }
    .btn-success { background: #4caf50; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 10px; padding: 24px; width: 440px; max-width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    .modal h3 { margin: 0 0 16px; color: #333; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-group textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; resize: vertical; font-family: inherit; }
    .form-group textarea:focus { outline: none; border-color: #4fc3f7; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
  `]
})
export class MoveInOutComponent implements OnInit {
  activeTab = 'requests';
  loading = false;
  saving = false;

  requests: any[] = [];
  todaySchedule: any[] = [];

  filterStatus = '';
  filterType = '';

  showRejectModal = false;
  rejectReason = '';
  rejectingRequest: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadRequests(); }

  loadRequests(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterType) params.type = this.filterType;
    this.api.get<any>('/move-in-out', params).subscribe({
      next: (res) => { this.requests = res.data?.requests || res.data || []; this.loading = false; },
      error: () => { this.requests = []; this.loading = false; }
    });
  }

  loadToday(): void {
    this.loading = true;
    this.api.get<any>('/move-in-out/today').subscribe({
      next: (res) => { this.todaySchedule = res.data?.schedule || res.data || []; this.loading = false; },
      error: () => { this.todaySchedule = []; this.loading = false; }
    });
  }

  approveRequest(r: any): void {
    if (confirm('Approve this move request?')) {
      this.api.put<any>(`/move-in-out/${r.id}/approve`, {}).subscribe({
        next: () => { this.refreshCurrentTab(); },
        error: () => { alert('Failed to approve request'); }
      });
    }
  }

  openReject(r: any): void {
    this.rejectingRequest = r;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.rejectingRequest || !this.rejectReason.trim()) return;
    this.saving = true;
    this.api.put<any>(`/move-in-out/${this.rejectingRequest.id}/reject`, { reason: this.rejectReason.trim() }).subscribe({
      next: () => { this.saving = false; this.showRejectModal = false; this.rejectingRequest = null; this.refreshCurrentTab(); },
      error: () => { this.saving = false; alert('Failed to reject request'); }
    });
  }

  startMove(r: any): void {
    if (confirm('Start this move?')) {
      this.api.put<any>(`/move-in-out/${r.id}/start`, {}).subscribe({
        next: () => { this.refreshCurrentTab(); },
        error: () => { alert('Failed to start move'); }
      });
    }
  }

  completeMove(r: any): void {
    if (confirm('Mark this move as completed?')) {
      this.api.put<any>(`/move-in-out/${r.id}/complete`, {}).subscribe({
        next: () => { this.refreshCurrentTab(); },
        error: () => { alert('Failed to complete move'); }
      });
    }
  }

  generateNOC(r: any): void {
    this.api.post<any>(`/move-in-out/${r.id}/noc`, {}).subscribe({
      next: (res) => {
        const url = res.data?.url || res.data?.nocUrl;
        if (url) { window.open(url, '_blank'); }
        else { alert('NOC generated successfully'); }
      },
      error: () => { alert('Failed to generate NOC'); }
    });
  }

  private refreshCurrentTab(): void {
    if (this.activeTab === 'requests') this.loadRequests();
    else this.loadToday();
  }
}
