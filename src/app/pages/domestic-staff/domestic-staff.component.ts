import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-domestic-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Domestic Staff</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'staff'" (click)="activeTab = 'staff'; loadStaff()">Staff</button>
        <button class="tab" [class.active]="activeTab === 'attendance'" (click)="activeTab = 'attendance'; loadAttendance()">Check In/Out</button>
        <button class="tab" [class.active]="activeTab === 'statistics'" (click)="activeTab = 'statistics'; loadStatistics()">Statistics</button>
      </div>

      <!-- STAFF TAB -->
      <div *ngIf="activeTab === 'staff'">
        <div class="card form-card" *ngIf="showStaffForm">
          <h3>{{ editingStaffId ? 'Edit Staff' : 'Add Staff' }}</h3>
          <form (ngSubmit)="saveStaff()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="staffForm.name" name="sname" required placeholder="Staff name"></div>
              <div class="form-group"><label>Type *</label>
                <select [(ngModel)]="staffForm.type" name="stype" required>
                  <option value="">Select Type</option>
                  <option *ngFor="let t of staffTypes" [value]="t.id || t.name || t">{{ t.name || t }}</option>
                </select>
              </div>
              <div class="form-group"><label>Mobile Number</label><input type="text" [(ngModel)]="staffForm.mobileNumber" name="smobile" placeholder="10-digit" maxlength="10"></div>
              <div class="form-group"><label>ID Proof Type</label>
                <select [(ngModel)]="staffForm.idProofType" name="sidtype">
                  <option value="">Select ID Proof</option>
                  <option value="aadhar">Aadhar</option>
                  <option value="pan">PAN</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                </select>
              </div>
              <div class="form-group"><label>ID Proof Number</label><input type="text" [(ngModel)]="staffForm.idProofNumber" name="sidnum" placeholder="ID number"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelStaffForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Search bar -->
        <div class="search-bar">
          <input type="text" [(ngModel)]="searchText" (ngModelChange)="filterStaff()" placeholder="Search staff by name, type or mobile..." class="search-input">
        </div>

        <div class="card">
          <div class="card-header"><span>Domestic Staff</span><button class="btn btn-primary btn-sm" (click)="openAddStaff()" *ngIf="!showStaffForm">+ Add Staff</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Type</th><th>Mobile</th><th>Verified</th><th>Blacklisted</th><th>Assigned Units</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let s of filteredStaff">
                <td class="name-cell">{{ s.name }}</td>
                <td>{{ s.typeName || s.type || '-' }}</td>
                <td>{{ s.mobileNumber || '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="s.isVerified" [class.badge-pending]="!s.isVerified">
                    {{ s.isVerified ? 'Verified' : 'Unverified' }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class.badge-inactive]="s.isBlacklisted" [class.badge-active]="!s.isBlacklisted">
                    {{ s.isBlacklisted ? 'Blacklisted' : 'Clear' }}
                  </span>
                </td>
                <td>{{ s.assignedUnits?.length || s.unitCount || 0 }}</td>
                <td>
                  <span class="badge" [class.badge-active]="s.status === 'active'" [class.badge-inactive]="s.status !== 'active'">
                    {{ s.status || 'active' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn btn-primary btn-sm" (click)="editStaff(s)">Edit</button>
                  <button class="btn btn-sm" [class.btn-success]="!s.isVerified" *ngIf="!s.isVerified" (click)="verifyStaff(s)">Verify</button>
                  <button class="btn btn-danger btn-sm" *ngIf="!s.isBlacklisted" (click)="blacklistStaff(s)">Blacklist</button>
                  <button class="btn btn-secondary btn-sm" *ngIf="s.isBlacklisted" (click)="removeBlacklist(s)">Remove Blacklist</button>
                </td>
              </tr>
              <tr *ngIf="filteredStaff.length === 0"><td colspan="8" class="empty">No staff found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CHECK IN/OUT TAB -->
      <div *ngIf="activeTab === 'attendance'">
        <div class="card">
          <div class="card-header"><span>Check In / Check Out Records</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Staff Name</th><th>Check In Time</th><th>Check Out Time</th><th>Duration</th><th>Recorded By</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of attendanceRecords">
                <td class="name-cell">{{ r.staffName || r.name || '-' }}</td>
                <td>{{ r.checkInTime ? (r.checkInTime | date:'medium') : '-' }}</td>
                <td>{{ r.checkOutTime ? (r.checkOutTime | date:'medium') : '-' }}</td>
                <td>{{ r.duration || '-' }}</td>
                <td>{{ r.recordedBy || '-' }}</td>
              </tr>
              <tr *ngIf="attendanceRecords.length === 0"><td colspan="5" class="empty">No attendance records found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- STATISTICS TAB -->
      <div *ngIf="activeTab === 'statistics'">
        <div class="loading" *ngIf="loading">Loading...</div>
        <div class="stat-cards" *ngIf="!loading">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.totalStaff || 0 }}</div>
            <div class="stat-label">Total Staff</div>
          </div>
          <div class="stat-card">
            <div class="stat-value stat-verified">{{ statistics.verified || 0 }}</div>
            <div class="stat-label">Verified</div>
          </div>
          <div class="stat-card">
            <div class="stat-value stat-blacklisted">{{ statistics.blacklisted || 0 }}</div>
            <div class="stat-label">Blacklisted</div>
          </div>
          <div class="stat-card">
            <div class="stat-value stat-active">{{ statistics.activeToday || 0 }}</div>
            <div class="stat-label">Active Today</div>
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
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #333; }
    .form-card { margin-bottom: 16px; }
    .form-card h3 { margin: 0 0 16px; color: #333; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-group input, .form-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #4fc3f7; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
    .error-msg { color: #f44336; font-size: 13px; margin-top: 8px; }
    .search-bar { margin-bottom: 16px; }
    .search-input { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; box-sizing: border-box; }
    .search-input:focus { outline: none; border-color: #4fc3f7; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active, .badge-completed { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .actions-cell { white-space: nowrap; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-success { background: #4caf50; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .stat-cards { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-value { font-size: 32px; font-weight: 700; color: #1a1a2e; }
    .stat-label { font-size: 13px; color: #888; margin-top: 4px; font-weight: 500; }
    .stat-verified { color: #2e7d32; }
    .stat-blacklisted { color: #c62828; }
    .stat-active { color: #1565c0; }
  `]
})
export class DomesticStaffComponent implements OnInit {
  activeTab = 'staff';
  loading = false;
  saving = false;
  formError = '';
  searchText = '';

  staffList: any[] = [];
  filteredStaff: any[] = [];
  staffTypes: any[] = [];
  attendanceRecords: any[] = [];
  statistics: any = {};

  showStaffForm = false;
  editingStaffId = '';
  staffForm = { name: '', type: '', mobileNumber: '', idProofType: '', idProofNumber: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadStaff();
    this.loadStaffTypes();
  }

  loadStaffTypes(): void {
    this.api.get<any>('/domestic-staff/types').subscribe({
      next: (res) => { this.staffTypes = res.data?.types || res.data || []; },
      error: () => { this.staffTypes = []; }
    });
  }

  loadStaff(): void {
    this.loading = true;
    this.api.get<any>('/domestic-staff').subscribe({
      next: (res) => { this.staffList = res.data?.staff || res.data || []; this.filterStaff(); this.loading = false; },
      error: () => { this.staffList = []; this.filteredStaff = []; this.loading = false; }
    });
  }

  filterStaff(): void {
    if (!this.searchText.trim()) {
      this.filteredStaff = [...this.staffList];
      return;
    }
    const q = this.searchText.toLowerCase();
    this.filteredStaff = this.staffList.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.type && s.type.toLowerCase().includes(q)) ||
      (s.typeName && s.typeName.toLowerCase().includes(q)) ||
      (s.mobileNumber && s.mobileNumber.includes(q))
    );
  }

  openAddStaff(): void {
    this.editingStaffId = '';
    this.staffForm = { name: '', type: '', mobileNumber: '', idProofType: '', idProofNumber: '' };
    this.formError = '';
    this.showStaffForm = true;
  }

  cancelStaffForm(): void {
    this.showStaffForm = false;
    this.editingStaffId = '';
    this.formError = '';
  }

  saveStaff(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingStaffId
      ? this.api.put<any>(`/domestic-staff/${this.editingStaffId}`, this.staffForm)
      : this.api.post<any>('/domestic-staff', this.staffForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showStaffForm = false; this.editingStaffId = ''; this.loadStaff(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save'; }
    });
  }

  editStaff(s: any): void {
    this.editingStaffId = s.id;
    this.staffForm = {
      name: s.name || '',
      type: s.type || '',
      mobileNumber: s.mobileNumber || '',
      idProofType: s.idProofType || '',
      idProofNumber: s.idProofNumber || ''
    };
    this.formError = '';
    this.showStaffForm = true;
  }

  verifyStaff(s: any): void {
    this.api.put<any>(`/domestic-staff/${s.id}/verify`, {}).subscribe({
      next: () => this.loadStaff()
    });
  }

  blacklistStaff(s: any): void {
    if (confirm(`Are you sure you want to blacklist "${s.name}"? This will prevent them from being assigned to any unit.`)) {
      this.api.put<any>(`/domestic-staff/${s.id}/blacklist`, {}).subscribe({
        next: () => this.loadStaff()
      });
    }
  }

  removeBlacklist(s: any): void {
    this.api.put<any>(`/domestic-staff/${s.id}/remove-blacklist`, {}).subscribe({
      next: () => this.loadStaff()
    });
  }

  loadAttendance(): void {
    this.loading = true;
    this.api.get<any>('/domestic-staff/attendance').subscribe({
      next: (res) => { this.attendanceRecords = res.data?.records || res.data || []; this.loading = false; },
      error: () => { this.attendanceRecords = []; this.loading = false; }
    });
  }

  loadStatistics(): void {
    this.loading = true;
    this.api.get<any>('/domestic-staff/statistics').subscribe({
      next: (res) => { this.statistics = res.data || {}; this.loading = false; },
      error: () => { this.statistics = {}; this.loading = false; }
    });
  }
}
