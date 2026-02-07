import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-security-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Security & Shifts</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'guards'" (click)="activeTab = 'guards'; loadGuards()">Security Staff</button>
        <button class="tab" [class.active]="activeTab === 'shifts'" (click)="activeTab = 'shifts'; loadShifts()">Shifts</button>
        <button class="tab" [class.active]="activeTab === 'assignments'" (click)="activeTab = 'assignments'; loadAssignments()">Assignments</button>
      </div>

      <!-- GUARDS TAB -->
      <div *ngIf="activeTab === 'guards'">
        <div class="card form-card" *ngIf="showGuardForm">
          <h3>{{ editingGuardId ? 'Edit Guard' : 'Add Security Staff' }}</h3>
          <form (ngSubmit)="saveGuard()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="guardForm.name" name="gname" required placeholder="Full name"></div>
              <div class="form-group"><label>Phone *</label><input type="text" [(ngModel)]="guardForm.phone" name="gphone" required placeholder="10-digit" maxlength="10"></div>
              <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="guardForm.email" name="gemail" placeholder="Optional"></div>
              <div class="form-group"><label>Employee ID</label><input type="text" [(ngModel)]="guardForm.employeeId" name="geid" placeholder="Optional"></div>
              <div class="form-group"><label>Designation</label><input type="text" [(ngModel)]="guardForm.designation" name="gdesig" placeholder="e.g. Senior Guard"></div>
              <div class="form-group"><label>Gate</label>
                <select [(ngModel)]="guardForm.gateId" name="ggate"><option value="">Select Gate</option><option *ngFor="let g of gates" [value]="g.id">{{ g.name }}</option></select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
              <button type="button" class="btn btn-secondary" (click)="showGuardForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Security Staff</span><button class="btn btn-primary btn-sm" (click)="showGuardForm = true" *ngIf="!showGuardForm">+ Add Guard</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Phone</th><th>Employee ID</th><th>Designation</th><th>Gate</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let g of guards">
                <td class="name-cell">{{ g.name || (g.firstName + ' ' + g.lastName) }}</td>
                <td>{{ g.phone }}</td><td>{{ g.employeeId || '-' }}</td><td>{{ g.designation || '-' }}</td>
                <td>{{ g.gateName || '-' }}</td>
                <td><span class="badge" [class.badge-active]="g.isActive !== false" [class.badge-inactive]="g.isActive === false">{{ g.isActive !== false ? 'Active' : 'Inactive' }}</span></td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editGuard(g)">Edit</button>
                </td>
              </tr>
              <tr *ngIf="guards.length === 0"><td colspan="7" class="empty">No security staff found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SHIFTS TAB -->
      <div *ngIf="activeTab === 'shifts'">
        <div class="card form-card" *ngIf="showShiftForm">
          <h3>{{ editingShiftId ? 'Edit Shift' : 'Create Shift' }}</h3>
          <form (ngSubmit)="saveShift()">
            <div class="form-grid">
              <div class="form-group"><label>Shift Name *</label><input type="text" [(ngModel)]="shiftForm.name" name="sname" required placeholder="e.g. Morning Shift"></div>
              <div class="form-group"><label>Start Time *</label><input type="time" [(ngModel)]="shiftForm.shiftStart" name="sstart" required></div>
              <div class="form-group"><label>End Time *</label><input type="time" [(ngModel)]="shiftForm.shiftEnd" name="send" required></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showShiftForm = false">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Shifts</span><button class="btn btn-primary btn-sm" (click)="showShiftForm = true" *ngIf="!showShiftForm">+ Create Shift</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let s of shifts">
                <td class="name-cell">{{ s.name }}</td><td>{{ s.shiftStart }}</td><td>{{ s.shiftEnd }}</td>
                <td><span class="badge" [class.badge-active]="s.isActive !== false" [class.badge-inactive]="s.isActive === false">{{ s.isActive !== false ? 'Active' : 'Inactive' }}</span></td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editShift(s)">Edit</button>
                  <button class="btn btn-danger btn-sm" *ngIf="s.isActive !== false" (click)="deactivateShift(s)">Deactivate</button>
                </td>
              </tr>
              <tr *ngIf="shifts.length === 0"><td colspan="5" class="empty">No shifts found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ASSIGNMENTS TAB -->
      <div *ngIf="activeTab === 'assignments'">
        <div class="card form-card" *ngIf="showAssignForm">
          <h3>Assign Shift</h3>
          <form (ngSubmit)="saveAssignment()">
            <div class="form-grid">
              <div class="form-group"><label>Guard *</label>
                <select [(ngModel)]="assignForm.guardId" name="aguard" required>
                  <option value="">Select Guard</option><option *ngFor="let g of guards" [value]="g.id">{{ g.name || (g.firstName + ' ' + g.lastName) }}</option>
                </select>
              </div>
              <div class="form-group"><label>Shift *</label>
                <select [(ngModel)]="assignForm.shiftId" name="ashift" required>
                  <option value="">Select Shift</option><option *ngFor="let s of shifts" [value]="s.id">{{ s.name }} ({{ s.shiftStart }} - {{ s.shiftEnd }})</option>
                </select>
              </div>
              <div class="form-group"><label>Gate</label>
                <select [(ngModel)]="assignForm.gateId" name="agate">
                  <option value="">Select Gate</option><option *ngFor="let g of gates" [value]="g.id">{{ g.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>Date</label><input type="date" [(ngModel)]="assignForm.date" name="adate"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Assign</button>
              <button type="button" class="btn btn-secondary" (click)="showAssignForm = false">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Shift Assignments</span><button class="btn btn-primary btn-sm" (click)="showAssignForm = true" *ngIf="!showAssignForm">+ Assign Shift</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Guard</th><th>Shift</th><th>Gate</th><th>Date</th><th>Check-In</th><th>Check-Out</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of assignments">
                <td class="name-cell">{{ a.guardName || '-' }}</td>
                <td>{{ a.shiftName || '-' }}</td><td>{{ a.gateName || '-' }}</td>
                <td>{{ a.date | date:'mediumDate' }}</td>
                <td>{{ a.checkInTime || '-' }}</td><td>{{ a.checkOutTime || '-' }}</td>
                <td><span class="badge" [ngClass]="'badge-' + (a.status || 'pending')">{{ a.status || 'pending' }}</span></td>
              </tr>
              <tr *ngIf="assignments.length === 0"><td colspan="7" class="empty">No assignments found</td></tr>
            </tbody>
          </table>
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
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active, .badge-completed { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-in_progress { background: #e3f2fd; color: #1565c0; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class SecurityShiftsComponent implements OnInit {
  activeTab = 'guards';
  loading = false;
  saving = false;
  formError = '';

  guards: any[] = [];
  shifts: any[] = [];
  assignments: any[] = [];
  gates: any[] = [];

  showGuardForm = false; editingGuardId = '';
  guardForm: any = { name: '', phone: '', email: '', employeeId: '', designation: '', gateId: '' };

  showShiftForm = false; editingShiftId = '';
  shiftForm: any = { name: '', shiftStart: '', shiftEnd: '' };

  showAssignForm = false;
  assignForm: any = { guardId: '', shiftId: '', gateId: '', date: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadGuards(); this.loadGates(); }

  loadGates(): void {
    this.api.get<any>('/society/gate').subscribe({
      next: (res) => { this.gates = res.data?.gates || res.data || []; }
    });
  }

  loadGuards(): void {
    this.loading = true;
    this.api.get<any>('/society/security').subscribe({
      next: (res) => { this.guards = res.data?.guards || res.data || []; this.loading = false; },
      error: () => { this.guards = []; this.loading = false; }
    });
  }

  saveGuard(): void {
    this.saving = true; this.formError = '';
    const req$ = this.editingGuardId
      ? this.api.put<any>('/society/security', { id: this.editingGuardId, ...this.guardForm })
      : this.api.post<any>('/auth/create-staff', { ...this.guardForm, role: 'guard' });
    req$.subscribe({
      next: () => { this.saving = false; this.showGuardForm = false; this.editingGuardId = ''; this.loadGuards(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save'; }
    });
  }

  editGuard(g: any): void {
    this.editingGuardId = g.id;
    this.guardForm = { name: g.name || (g.firstName + ' ' + g.lastName), phone: g.phone || '', email: g.email || '', employeeId: g.employeeId || '', designation: g.designation || '', gateId: g.gateId || '' };
    this.showGuardForm = true;
  }

  loadShifts(): void {
    this.loading = true;
    this.api.get<any>('/society/security/shift-assignment', { type: 'shifts' }).subscribe({
      next: (res) => { this.shifts = res.data?.shifts || res.data || []; this.loading = false; },
      error: () => { this.shifts = []; this.loading = false; }
    });
  }

  saveShift(): void {
    this.saving = true;
    const req$ = this.editingShiftId
      ? this.api.put<any>('/society/security/shift-assignment', { id: this.editingShiftId, ...this.shiftForm })
      : this.api.post<any>('/society/security/shift', this.shiftForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showShiftForm = false; this.editingShiftId = ''; this.loadShifts(); },
      error: () => { this.saving = false; }
    });
  }

  editShift(s: any): void {
    this.editingShiftId = s.id;
    this.shiftForm = { name: s.name, shiftStart: s.shiftStart, shiftEnd: s.shiftEnd };
    this.showShiftForm = true;
  }

  deactivateShift(s: any): void {
    if (confirm(`Deactivate shift "${s.name}"?`)) {
      this.api.put<any>('/society/security/shift/inactive', { id: s.id }).subscribe({ next: () => this.loadShifts() });
    }
  }

  loadAssignments(): void {
    this.loading = true;
    this.api.get<any>('/society/security/shift-assignment').subscribe({
      next: (res) => { this.assignments = res.data?.assignments || res.data || []; this.loading = false; },
      error: () => { this.assignments = []; this.loading = false; }
    });
  }

  saveAssignment(): void {
    this.saving = true;
    this.api.post<any>('/society/security/shift-assignment', this.assignForm).subscribe({
      next: () => { this.saving = false; this.showAssignForm = false; this.loadAssignments(); },
      error: () => { this.saving = false; }
    });
  }
}
