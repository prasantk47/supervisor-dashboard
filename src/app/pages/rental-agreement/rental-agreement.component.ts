import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-rental-agreement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Rental Agreements</h2>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="form-group">
          <label>Status</label>
          <select [(ngModel)]="filterStatus" name="fstatus" (change)="loadAgreements()">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        <div class="form-group">
          <label>Search</label>
          <input type="text" [(ngModel)]="filterSearch" name="fsearch" placeholder="Tenant or unit..." (keyup.enter)="loadAgreements()">
        </div>
        <button class="btn btn-primary btn-sm" (click)="loadAgreements()">Filter</button>
      </div>

      <!-- Add/Edit Form -->
      <div class="card form-card" *ngIf="showForm">
        <h3>{{ editingId ? 'Edit Agreement' : 'Add Rental Agreement' }}</h3>
        <form (ngSubmit)="saveAgreement()">
          <div class="form-grid">
            <div class="form-group"><label>Unit ID *</label><input type="text" [(ngModel)]="form.unitId" name="unitId" required placeholder="Unit ID"></div>
            <div class="form-group"><label>Tenant Name *</label><input type="text" [(ngModel)]="form.tenantName" name="tenantName" required placeholder="Full name"></div>
            <div class="form-group"><label>Tenant Phone</label><input type="text" [(ngModel)]="form.tenantPhone" name="tenantPhone" placeholder="Phone number"></div>
            <div class="form-group"><label>Tenant Email</label><input type="email" [(ngModel)]="form.tenantEmail" name="tenantEmail" placeholder="Email"></div>
            <div class="form-group"><label>Owner Name *</label><input type="text" [(ngModel)]="form.ownerName" name="ownerName" required placeholder="Owner name"></div>
            <div class="form-group"><label>Start Date *</label><input type="date" [(ngModel)]="form.startDate" name="startDate" required></div>
            <div class="form-group"><label>End Date *</label><input type="date" [(ngModel)]="form.endDate" name="endDate" required></div>
            <div class="form-group"><label>Rent Amount *</label><input type="number" [(ngModel)]="form.rentAmount" name="rentAmount" required placeholder="0.00"></div>
            <div class="form-group"><label>Security Deposit</label><input type="number" [(ngModel)]="form.securityDeposit" name="securityDeposit" placeholder="0.00"></div>
          </div>
          <div class="form-group" style="margin-top:12px"><label>Terms & Conditions</label><textarea [(ngModel)]="form.terms" name="terms" rows="3" placeholder="Agreement terms..."></textarea></div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
          <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        </form>
      </div>

      <!-- Renew Modal -->
      <div class="card form-card" *ngIf="showRenewForm">
        <h3>Renew Agreement</h3>
        <form (ngSubmit)="submitRenew()">
          <div class="form-grid">
            <div class="form-group"><label>New End Date *</label><input type="date" [(ngModel)]="renewForm.newEndDate" name="renewEndDate" required></div>
            <div class="form-group"><label>New Rent Amount *</label><input type="number" [(ngModel)]="renewForm.newRentAmount" name="renewRent" required placeholder="0.00"></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">Renew</button>
            <button type="button" class="btn btn-secondary" (click)="showRenewForm = false; renewingId = ''">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Terminate Modal -->
      <div class="card form-card" *ngIf="showTerminateForm">
        <h3>Terminate Agreement</h3>
        <form (ngSubmit)="submitTerminate()">
          <div class="form-group"><label>Reason for Termination *</label><textarea [(ngModel)]="terminateReason" name="termReason" rows="3" required placeholder="Reason..."></textarea></div>
          <div class="form-actions">
            <button type="submit" class="btn btn-danger" [disabled]="saving">Terminate</button>
            <button type="button" class="btn btn-secondary" (click)="showTerminateForm = false; terminatingId = ''">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Deposit Return Modal -->
      <div class="card form-card" *ngIf="showDepositForm">
        <h3>Return Deposit</h3>
        <form (ngSubmit)="submitDepositReturn()">
          <div class="form-grid">
            <div class="form-group"><label>Amount Returned *</label><input type="number" [(ngModel)]="depositForm.amountReturned" name="depAmt" required placeholder="0.00"></div>
            <div class="form-group"><label>Deductions</label><input type="number" [(ngModel)]="depositForm.deductions" name="depDed" placeholder="0.00"></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">Return Deposit</button>
            <button type="button" class="btn btn-secondary" (click)="showDepositForm = false; depositId = ''">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Agreements Table -->
      <div class="card">
        <div class="card-header"><span>Agreements</span><button class="btn btn-primary btn-sm" (click)="openAddForm()" *ngIf="!showForm">+ Add Agreement</button></div>
        <div class="loading" *ngIf="loading">Loading...</div>
        <div class="table-wrap" *ngIf="!loading">
          <table>
            <thead>
              <tr>
                <th>Unit</th><th>Tenant</th><th>Owner</th><th>Start Date</th><th>End Date</th>
                <th>Rent Amount</th><th>Deposit</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of agreements">
                <td class="name-cell">{{ a.unitId || a.unit?.name || '-' }}</td>
                <td>{{ a.tenantName || '-' }}</td>
                <td>{{ a.ownerName || '-' }}</td>
                <td>{{ a.startDate ? (a.startDate | date:'mediumDate') : '-' }}</td>
                <td>{{ a.endDate ? (a.endDate | date:'mediumDate') : '-' }}</td>
                <td>{{ a.rentAmount | number:'1.2-2' }}</td>
                <td>{{ a.securityDeposit | number:'1.2-2' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="a.status === 'active'"
                    [class.badge-pending]="a.status === 'pending'"
                    [class.badge-expired]="a.status === 'expired'"
                    [class.badge-inactive]="a.status === 'terminated'">
                    {{ a.status | titlecase }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn btn-primary btn-sm" (click)="editAgreement(a)">Edit</button>
                  <button class="btn btn-sm btn-approve" *ngIf="a.status === 'pending'" (click)="approveAgreement(a)">Approve</button>
                  <button class="btn btn-danger btn-sm" *ngIf="a.status === 'active'" (click)="openTerminate(a)">Terminate</button>
                  <button class="btn btn-sm btn-renew" *ngIf="a.status === 'active' || a.status === 'expired'" (click)="openRenew(a)">Renew</button>
                  <button class="btn btn-secondary btn-sm" *ngIf="a.status === 'terminated' || a.status === 'expired'" (click)="openDepositReturn(a)">Return Deposit</button>
                </td>
              </tr>
              <tr *ngIf="agreements.length === 0"><td colspan="9" class="empty">No rental agreements found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { margin: 0; color: #333; }
    .filters-bar { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 16px; flex-wrap: wrap; }
    .filters-bar .form-group { display: flex; flex-direction: column; }
    .filters-bar .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .filters-bar .form-group input, .filters-bar .form-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
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
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; white-space: nowrap; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-expired { background: #efebe9; color: #795548; }
    .actions-cell { white-space: nowrap; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-approve { background: #4caf50; color: #fff; }
    .btn-renew { background: #2196f3; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class RentalAgreementComponent implements OnInit {
  loading = false;
  saving = false;
  formError = '';

  agreements: any[] = [];

  // Filters
  filterStatus = '';
  filterSearch = '';

  // Add/Edit form
  showForm = false;
  editingId = '';
  form: any = { unitId: '', tenantName: '', tenantPhone: '', tenantEmail: '', ownerName: '', startDate: '', endDate: '', rentAmount: null, securityDeposit: null, terms: '' };

  // Renew
  showRenewForm = false;
  renewingId = '';
  renewForm = { newEndDate: '', newRentAmount: null as number | null };

  // Terminate
  showTerminateForm = false;
  terminatingId = '';
  terminateReason = '';

  // Deposit return
  showDepositForm = false;
  depositId = '';
  depositForm = { amountReturned: null as number | null, deductions: null as number | null };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAgreements();
  }

  loadAgreements(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterSearch) params.search = this.filterSearch;
    this.api.get<any>('/rental-agreements', params).subscribe({
      next: (res) => { this.agreements = res.data?.agreements || res.data || []; this.loading = false; },
      error: () => { this.agreements = []; this.loading = false; }
    });
  }

  openAddForm(): void {
    this.editingId = '';
    this.form = { unitId: '', tenantName: '', tenantPhone: '', tenantEmail: '', ownerName: '', startDate: '', endDate: '', rentAmount: null, securityDeposit: null, terms: '' };
    this.formError = '';
    this.showForm = true;
  }

  editAgreement(a: any): void {
    this.editingId = a.id || a._id;
    this.form = {
      unitId: a.unitId || '',
      tenantName: a.tenantName || '',
      tenantPhone: a.tenantPhone || '',
      tenantEmail: a.tenantEmail || '',
      ownerName: a.ownerName || '',
      startDate: a.startDate ? a.startDate.substring(0, 10) : '',
      endDate: a.endDate ? a.endDate.substring(0, 10) : '',
      rentAmount: a.rentAmount || null,
      securityDeposit: a.securityDeposit || null,
      terms: a.terms || ''
    };
    this.formError = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = '';
    this.formError = '';
  }

  saveAgreement(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingId
      ? this.api.put<any>(`/rental-agreements/${this.editingId}`, this.form)
      : this.api.post<any>('/rental-agreements', this.form);
    req$.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.editingId = ''; this.loadAgreements(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save agreement'; }
    });
  }

  approveAgreement(a: any): void {
    if (confirm(`Approve agreement for tenant "${a.tenantName}"?`)) {
      this.api.put<any>(`/rental-agreements/${a.id || a._id}/approve`, {}).subscribe({
        next: () => this.loadAgreements(),
        error: () => {}
      });
    }
  }

  openTerminate(a: any): void {
    this.terminatingId = a.id || a._id;
    this.terminateReason = '';
    this.showTerminateForm = true;
  }

  submitTerminate(): void {
    this.saving = true;
    this.api.put<any>(`/rental-agreements/${this.terminatingId}/terminate`, { reason: this.terminateReason }).subscribe({
      next: () => { this.saving = false; this.showTerminateForm = false; this.terminatingId = ''; this.loadAgreements(); },
      error: () => { this.saving = false; }
    });
  }

  openRenew(a: any): void {
    this.renewingId = a.id || a._id;
    this.renewForm = { newEndDate: '', newRentAmount: null };
    this.showRenewForm = true;
  }

  submitRenew(): void {
    this.saving = true;
    this.api.post<any>(`/rental-agreements/${this.renewingId}/renew`, this.renewForm).subscribe({
      next: () => { this.saving = false; this.showRenewForm = false; this.renewingId = ''; this.loadAgreements(); },
      error: () => { this.saving = false; }
    });
  }

  openDepositReturn(a: any): void {
    this.depositId = a.id || a._id;
    this.depositForm = { amountReturned: null, deductions: null };
    this.showDepositForm = true;
  }

  submitDepositReturn(): void {
    this.saving = true;
    this.api.put<any>(`/rental-agreements/${this.depositId}/deposit-return`, this.depositForm).subscribe({
      next: () => { this.saving = false; this.showDepositForm = false; this.depositId = ''; this.loadAgreements(); },
      error: () => { this.saving = false; }
    });
  }
}
