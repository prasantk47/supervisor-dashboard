import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-staff-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Staff Leave</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'requests'" (click)="activeTab = 'requests'; loadRequests()">Requests</button>
        <button class="tab" [class.active]="activeTab === 'types'" (click)="activeTab = 'types'; loadLeaveTypes()">Leave Types</button>
        <button class="tab" [class.active]="activeTab === 'statistics'" (click)="activeTab = 'statistics'; loadStatistics()">Statistics</button>
      </div>

      <!-- REQUESTS TAB -->
      <div *ngIf="activeTab === 'requests'">
        <div class="categories-bar">
          <span class="cat-chip" [class.active]="statusFilter === ''" (click)="statusFilter = ''; loadRequests()">All</span>
          <span class="cat-chip" [class.active]="statusFilter === 'pending'" (click)="statusFilter = 'pending'; loadRequests()">Pending</span>
          <span class="cat-chip" [class.active]="statusFilter === 'approved'" (click)="statusFilter = 'approved'; loadRequests()">Approved</span>
          <span class="cat-chip" [class.active]="statusFilter === 'rejected'" (click)="statusFilter = 'rejected'; loadRequests()">Rejected</span>
        </div>

        <div class="card">
          <div class="card-header"><span>Leave Requests</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Staff Name</th><th>Leave Type</th><th>From Date</th><th>To Date</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of requests">
                <td class="name-cell">{{ r.staffName || r.name || '-' }}</td>
                <td>{{ r.leaveType || r.leaveTypeName || '-' }}</td>
                <td>{{ r.fromDate ? (r.fromDate | date:'mediumDate') : '-' }}</td>
                <td>{{ r.toDate ? (r.toDate | date:'mediumDate') : '-' }}</td>
                <td>{{ r.days || r.numberOfDays || '-' }}</td>
                <td>{{ r.reason || '-' }}</td>
                <td>
                  <span class="badge" [class.badge-pending]="r.status === 'pending'" [class.badge-active]="r.status === 'approved'" [class.badge-inactive]="r.status === 'rejected'">
                    {{ r.status || '-' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm" *ngIf="r.status === 'pending'" (click)="approveRequest(r)">Approve</button>
                  <button class="btn btn-danger btn-sm" *ngIf="r.status === 'pending'" (click)="rejectRequest(r)">Reject</button>
                </td>
              </tr>
              <tr *ngIf="requests.length === 0"><td colspan="8" class="empty">No leave requests found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- LEAVE TYPES TAB -->
      <div *ngIf="activeTab === 'types'">
        <div class="card form-card" *ngIf="showTypeForm">
          <h3>{{ editingTypeId ? 'Edit Leave Type' : 'Add Leave Type' }}</h3>
          <form (ngSubmit)="saveLeaveType()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="typeForm.name" name="tname" required placeholder="e.g. Casual Leave"></div>
              <div class="form-group"><label>Code *</label><input type="text" [(ngModel)]="typeForm.code" name="tcode" required placeholder="e.g. CL"></div>
              <div class="form-group"><label>Days Allowed *</label><input type="number" [(ngModel)]="typeForm.daysAllowed" name="tdays" required placeholder="e.g. 12"></div>
            </div>
            <div class="checkbox-row">
              <label class="checkbox-label"><input type="checkbox" [(ngModel)]="typeForm.isPaid" name="tpaid"> Paid Leave</label>
              <label class="checkbox-label"><input type="checkbox" [(ngModel)]="typeForm.carryForward" name="tcarry"> Carry Forward</label>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelTypeForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Leave Types</span><button class="btn btn-primary btn-sm" (click)="openTypeForm()" *ngIf="!showTypeForm">+ Add Leave Type</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Code</th><th>Days Allowed</th><th>Carry Forward</th><th>Paid</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let t of leaveTypes">
                <td class="name-cell">{{ t.name }}</td>
                <td><span class="code-badge">{{ t.code }}</span></td>
                <td>{{ t.daysAllowed || 0 }}</td>
                <td>{{ t.carryForward ? 'Yes' : 'No' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="t.isPaid" [class.badge-inactive]="!t.isPaid">
                    {{ t.isPaid ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class.badge-active]="!t.disabled" [class.badge-inactive]="t.disabled">
                    {{ t.disabled ? 'Disabled' : 'Active' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editLeaveType(t)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteLeaveType(t)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="leaveTypes.length === 0"><td colspan="7" class="empty">No leave types found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- STATISTICS TAB -->
      <div *ngIf="activeTab === 'statistics'">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.totalRequests || 0 }}</div>
            <div class="stat-label">Total Requests</div>
          </div>
          <div class="stat-card">
            <div class="stat-value approved">{{ statistics.approved || 0 }}</div>
            <div class="stat-label">Approved</div>
          </div>
          <div class="stat-card">
            <div class="stat-value rejected">{{ statistics.rejected || 0 }}</div>
            <div class="stat-label">Rejected</div>
          </div>
          <div class="stat-card">
            <div class="stat-value pending">{{ statistics.pending || 0 }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Leave Statistics</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <div *ngIf="!loading && statisticsList.length === 0" class="empty">No statistics data available</div>
          <table *ngIf="!loading && statisticsList.length > 0">
            <thead><tr><th>Staff Name</th><th>Total Leaves</th><th>Approved</th><th>Rejected</th><th>Pending</th><th>Days Used</th></tr></thead>
            <tbody>
              <tr *ngFor="let s of statisticsList">
                <td class="name-cell">{{ s.staffName || s.name || '-' }}</td>
                <td>{{ s.totalLeaves || 0 }}</td>
                <td>{{ s.approved || 0 }}</td>
                <td>{{ s.rejected || 0 }}</td>
                <td>{{ s.pending || 0 }}</td>
                <td>{{ s.daysUsed || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reject Reason Modal -->
      <div class="modal-overlay" *ngIf="showRejectModal" (click)="showRejectModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Reject Leave Request</h3>
          <div class="form-group">
            <label>Reason for Rejection *</label>
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
    .categories-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .cat-chip { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #f0f0f0; color: #555; cursor: pointer; transition: all 0.2s; }
    .cat-chip:hover { background: #e0e0e0; }
    .cat-chip.active { background: #1a1a2e; color: #fff; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #333; }
    .stat-value.approved { color: #2e7d32; }
    .stat-value.rejected { color: #c62828; }
    .stat-value.pending { color: #e65100; }
    .stat-label { font-size: 12px; color: #888; margin-top: 4px; font-weight: 500; text-transform: uppercase; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #333; }
    .form-card { margin-bottom: 16px; }
    .form-card h3 { margin: 0 0 16px; color: #333; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-group input, .form-group select, .form-group textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #4fc3f7; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
    .error-msg { color: #f44336; font-size: 13px; margin-top: 8px; }
    .checkbox-row { display: flex; gap: 24px; margin-top: 12px; }
    .checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; cursor: pointer; }
    .checkbox-label input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .code-badge { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 10px; padding: 24px; width: 440px; max-width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .modal h3 { margin: 0 0 16px; color: #333; }
  `]
})
export class StaffLeaveComponent implements OnInit {
  activeTab = 'requests';
  loading = false;
  saving = false;
  formError = '';

  // Requests
  requests: any[] = [];
  statusFilter = '';

  // Leave Types
  leaveTypes: any[] = [];
  showTypeForm = false;
  editingTypeId = '';
  typeForm = { name: '', code: '', daysAllowed: 0, isPaid: false, carryForward: false };

  // Statistics
  statistics: any = {};
  statisticsList: any[] = [];

  // Reject modal
  showRejectModal = false;
  rejectReason = '';
  rejectingRequest: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadRequests(); }

  loadRequests(): void {
    this.loading = true;
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    this.api.get<any>('/staff-leave/requests', params).subscribe({
      next: (res) => { this.requests = res.data?.requests || res.data || []; this.loading = false; },
      error: () => { this.requests = []; this.loading = false; }
    });
  }

  approveRequest(r: any): void {
    if (confirm(`Approve leave request for "${r.staffName || r.name}"?`)) {
      this.api.put<any>(`/staff-leave/requests/${r.id}/approve`, {}).subscribe({
        next: () => this.loadRequests(),
        error: () => {}
      });
    }
  }

  rejectRequest(r: any): void {
    this.rejectingRequest = r;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.rejectingRequest || !this.rejectReason.trim()) return;
    this.saving = true;
    this.api.put<any>(`/staff-leave/requests/${this.rejectingRequest.id}/reject`, { reason: this.rejectReason.trim() }).subscribe({
      next: () => { this.saving = false; this.showRejectModal = false; this.rejectingRequest = null; this.rejectReason = ''; this.loadRequests(); },
      error: () => { this.saving = false; }
    });
  }

  loadLeaveTypes(): void {
    this.loading = true;
    this.api.get<any>('/staff-leave/types').subscribe({
      next: (res) => { this.leaveTypes = res.data?.types || res.data || []; this.loading = false; },
      error: () => { this.leaveTypes = []; this.loading = false; }
    });
  }

  openTypeForm(): void {
    this.editingTypeId = '';
    this.typeForm = { name: '', code: '', daysAllowed: 0, isPaid: false, carryForward: false };
    this.formError = '';
    this.showTypeForm = true;
  }

  cancelTypeForm(): void {
    this.showTypeForm = false;
    this.editingTypeId = '';
    this.formError = '';
  }

  saveLeaveType(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingTypeId
      ? this.api.put<any>(`/staff-leave/types/${this.editingTypeId}`, this.typeForm)
      : this.api.post<any>('/staff-leave/types', this.typeForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showTypeForm = false; this.editingTypeId = ''; this.loadLeaveTypes(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save'; }
    });
  }

  editLeaveType(t: any): void {
    this.editingTypeId = t.id;
    this.typeForm = { name: t.name, code: t.code, daysAllowed: t.daysAllowed || 0, isPaid: !!t.isPaid, carryForward: !!t.carryForward };
    this.formError = '';
    this.showTypeForm = true;
  }

  deleteLeaveType(t: any): void {
    if (confirm(`Delete leave type "${t.name}"? This cannot be undone.`)) {
      this.api.delete<any>(`/staff-leave/types/${t.id}`).subscribe({
        next: () => this.loadLeaveTypes(),
        error: () => {}
      });
    }
  }

  loadStatistics(): void {
    this.loading = true;
    this.api.get<any>('/staff-leave/statistics').subscribe({
      next: (res) => {
        const data = res.data || {};
        this.statistics = {
          totalRequests: data.totalRequests || data.summary?.totalRequests || 0,
          approved: data.approved || data.summary?.approved || 0,
          rejected: data.rejected || data.summary?.rejected || 0,
          pending: data.pending || data.summary?.pending || 0
        };
        this.statisticsList = data.staffStats || data.list || [];
        this.loading = false;
      },
      error: () => { this.statistics = {}; this.statisticsList = []; this.loading = false; }
    });
  }
}
