import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Vendor Management</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'vendors'" (click)="activeTab = 'vendors'; loadVendors()">Vendors</button>
        <button class="tab" [class.active]="activeTab === 'contracts'" (click)="activeTab = 'contracts'; loadContracts()">Contracts</button>
        <button class="tab" [class.active]="activeTab === 'work-orders'" (click)="activeTab = 'work-orders'; loadWorkOrders()">Work Orders</button>
        <button class="tab" [class.active]="activeTab === 'payments'" (click)="activeTab = 'payments'; loadPayments()">Payments</button>
      </div>

      <!-- VENDORS TAB -->
      <div *ngIf="activeTab === 'vendors'">
        <div class="card form-card" *ngIf="showVendorForm">
          <h3>{{ editingVendorId ? 'Edit Vendor' : 'Add Vendor' }}</h3>
          <form (ngSubmit)="saveVendor()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="vendorForm.name" name="vname" required placeholder="Vendor name"></div>
              <div class="form-group"><label>Type *</label>
                <select [(ngModel)]="vendorForm.vendorType" name="vtype" required>
                  <option value="">Select Type</option>
                  <option *ngFor="let t of vendorTypes" [value]="t">{{ t }}</option>
                </select>
              </div>
              <div class="form-group"><label>Contact Person</label><input type="text" [(ngModel)]="vendorForm.contactPerson" name="vcontact" placeholder="Contact person name"></div>
              <div class="form-group"><label>Phone</label><input type="text" [(ngModel)]="vendorForm.phone" name="vphone" placeholder="Phone number"></div>
              <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="vendorForm.email" name="vemail" placeholder="Email address"></div>
              <div class="form-group"><label>Address</label><input type="text" [(ngModel)]="vendorForm.address" name="vaddress" placeholder="Address"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelVendorForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Vendors</span><button class="btn btn-primary btn-sm" (click)="openVendorForm()" *ngIf="!showVendorForm">+ Add Vendor</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Type</th><th>Contact</th><th>Email</th><th>Verified</th><th>Blacklisted</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let v of vendors">
                <td class="name-cell">{{ v.name }}</td>
                <td>{{ v.vendorType || '-' }}</td>
                <td>{{ v.contactPerson || '-' }}</td>
                <td>{{ v.email || '-' }}</td>
                <td><span class="badge" [class.badge-active]="v.verified" [class.badge-inactive]="!v.verified">{{ v.verified ? 'Verified' : 'Unverified' }}</span></td>
                <td><span class="badge" [class.badge-inactive]="v.blacklisted" [class.badge-active]="!v.blacklisted">{{ v.blacklisted ? 'Yes' : 'No' }}</span></td>
                <td><span class="badge" [class.badge-active]="v.status === 'active'" [class.badge-inactive]="v.status === 'inactive'" [class.badge-pending]="v.status === 'pending'">{{ v.status || 'active' }}</span></td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editVendor(v)">Edit</button>
                  <button class="btn btn-sm" style="background:#4caf50;color:#fff;" (click)="verifyVendor(v)" *ngIf="!v.verified">Verify</button>
                  <button class="btn btn-danger btn-sm" (click)="blacklistVendor(v)" *ngIf="!v.blacklisted">Blacklist</button>
                </td>
              </tr>
              <tr *ngIf="vendors.length === 0"><td colspan="8" class="empty">No vendors found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CONTRACTS TAB -->
      <div *ngIf="activeTab === 'contracts'">
        <div class="card form-card" *ngIf="showContractForm">
          <h3>Add Contract</h3>
          <form (ngSubmit)="saveContract()">
            <div class="form-grid">
              <div class="form-group"><label>Vendor *</label>
                <select [(ngModel)]="contractForm.vendorId" name="cvendor" required>
                  <option value="">Select Vendor</option>
                  <option *ngFor="let v of vendors" [value]="v.id">{{ v.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>Title *</label><input type="text" [(ngModel)]="contractForm.title" name="ctitle" required placeholder="Contract title"></div>
              <div class="form-group"><label>Start Date *</label><input type="date" [(ngModel)]="contractForm.startDate" name="cstart" required></div>
              <div class="form-group"><label>End Date *</label><input type="date" [(ngModel)]="contractForm.endDate" name="cend" required></div>
              <div class="form-group"><label>Value</label><input type="number" [(ngModel)]="contractForm.value" name="cvalue" placeholder="Contract value"></div>
              <div class="form-group"><label>Description</label><input type="text" [(ngModel)]="contractForm.description" name="cdesc" placeholder="Description"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showContractForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Contracts</span><button class="btn btn-primary btn-sm" (click)="showContractForm = true; resetContractForm()" *ngIf="!showContractForm">+ Add Contract</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Vendor</th><th>Title</th><th>Start Date</th><th>End Date</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of contracts">
                <td class="name-cell">{{ c.vendorName || c.vendor?.name || '-' }}</td>
                <td>{{ c.title }}</td>
                <td>{{ c.startDate | date:'mediumDate' }}</td>
                <td>{{ c.endDate | date:'mediumDate' }}</td>
                <td>{{ c.value ? ('₹' + c.value) : '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="c.status === 'active'"
                    [class.badge-pending]="c.status === 'pending'"
                    [class.badge-inactive]="c.status === 'expired'">
                    {{ c.status || 'pending' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm" style="background:#4caf50;color:#fff;" (click)="approveContract(c)" *ngIf="c.status === 'pending'">Approve</button>
                </td>
              </tr>
              <tr *ngIf="contracts.length === 0"><td colspan="7" class="empty">No contracts found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- WORK ORDERS TAB -->
      <div *ngIf="activeTab === 'work-orders'">
        <div class="card form-card" *ngIf="showWorkOrderForm">
          <h3>Create Work Order</h3>
          <form (ngSubmit)="saveWorkOrder()">
            <div class="form-grid">
              <div class="form-group"><label>Vendor *</label>
                <select [(ngModel)]="workOrderForm.vendorId" name="wovendor" required>
                  <option value="">Select Vendor</option>
                  <option *ngFor="let v of vendors" [value]="v.id">{{ v.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>Title *</label><input type="text" [(ngModel)]="workOrderForm.title" name="wotitle" required placeholder="Work order title"></div>
              <div class="form-group"><label>Priority *</label>
                <select [(ngModel)]="workOrderForm.priority" name="wopriority" required>
                  <option value="">Select Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div class="form-group"><label>Due Date</label><input type="date" [(ngModel)]="workOrderForm.dueDate" name="wodue"></div>
              <div class="form-group full-width"><label>Description</label><input type="text" [(ngModel)]="workOrderForm.description" name="wodesc" placeholder="Work order description"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showWorkOrderForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Work Orders</span><button class="btn btn-primary btn-sm" (click)="showWorkOrderForm = true; resetWorkOrderForm()" *ngIf="!showWorkOrderForm">+ Create Work Order</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Title</th><th>Vendor</th><th>Priority</th><th>Assigned Date</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let wo of workOrders">
                <td class="name-cell">{{ wo.title }}</td>
                <td>{{ wo.vendorName || wo.vendor?.name || '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="wo.priority === 'low'"
                    [class.badge-pending]="wo.priority === 'medium' || wo.priority === 'high'"
                    [class.badge-inactive]="wo.priority === 'urgent'">
                    {{ wo.priority }}
                  </span>
                </td>
                <td>{{ wo.assignedDate ? (wo.assignedDate | date:'mediumDate') : (wo.createdAt | date:'mediumDate') }}</td>
                <td>{{ wo.dueDate | date:'mediumDate' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="wo.status === 'completed'"
                    [class.badge-pending]="wo.status === 'pending' || wo.status === 'in_progress'"
                    [class.badge-inactive]="wo.status === 'cancelled'">
                    {{ wo.status }}
                  </span>
                </td>
                <td>
                  <select class="status-select" [ngModel]="wo.status" (ngModelChange)="updateWorkOrderStatus(wo, $event)" name="wos_{{wo.id}}">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
              <tr *ngIf="workOrders.length === 0"><td colspan="7" class="empty">No work orders found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAYMENTS TAB -->
      <div *ngIf="activeTab === 'payments'">
        <div class="card form-card" *ngIf="showPaymentForm">
          <h3>Record Payment</h3>
          <form (ngSubmit)="savePayment()">
            <div class="form-grid">
              <div class="form-group"><label>Vendor *</label>
                <select [(ngModel)]="paymentForm.vendorId" name="pvendor" required>
                  <option value="">Select Vendor</option>
                  <option *ngFor="let v of vendors" [value]="v.id">{{ v.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>Amount *</label><input type="number" [(ngModel)]="paymentForm.amount" name="pamount" required placeholder="Amount"></div>
              <div class="form-group"><label>Invoice Number</label><input type="text" [(ngModel)]="paymentForm.invoiceNumber" name="pinvoice" placeholder="Invoice #"></div>
              <div class="form-group full-width"><label>Description</label><input type="text" [(ngModel)]="paymentForm.description" name="pdesc" placeholder="Payment description"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showPaymentForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Payments</span><button class="btn btn-primary btn-sm" (click)="showPaymentForm = true; resetPaymentForm()" *ngIf="!showPaymentForm">+ Record Payment</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Vendor</th><th>Amount</th><th>Invoice #</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of payments">
                <td class="name-cell">{{ p.vendorName || p.vendor?.name || '-' }}</td>
                <td>{{ '₹' + p.amount }}</td>
                <td>{{ p.invoiceNumber || '-' }}</td>
                <td>{{ p.createdAt ? (p.createdAt | date:'mediumDate') : (p.date | date:'mediumDate') }}</td>
                <td>
                  <span class="badge"
                    [class.badge-pending]="p.status === 'pending'"
                    [class.badge-active]="p.status === 'approved' || p.status === 'paid'"
                    [class.badge-inactive]="p.status === 'rejected'">
                    {{ p.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm" style="background:#4caf50;color:#fff;" (click)="approvePayment(p)" *ngIf="p.status === 'pending'">Approve</button>
                </td>
              </tr>
              <tr *ngIf="payments.length === 0"><td colspan="6" class="empty">No payments found</td></tr>
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
    .form-group.full-width { grid-column: 1 / -1; }
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
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .status-select { padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; cursor: pointer; }
  `]
})
export class VendorComponent implements OnInit {
  activeTab = 'vendors';
  loading = false;
  saving = false;
  formError = '';

  vendors: any[] = [];
  vendorTypes: any[] = [];
  contracts: any[] = [];
  workOrders: any[] = [];
  payments: any[] = [];

  showVendorForm = false;
  editingVendorId = '';
  vendorForm = { name: '', vendorType: '', contactPerson: '', phone: '', email: '', address: '' };

  showContractForm = false;
  contractForm = { vendorId: '', title: '', startDate: '', endDate: '', value: null as number | null, description: '' };

  showWorkOrderForm = false;
  workOrderForm = { vendorId: '', title: '', description: '', priority: '', dueDate: '' };

  showPaymentForm = false;
  paymentForm = { vendorId: '', amount: null as number | null, invoiceNumber: '', description: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadVendors();
    this.loadVendorTypes();
  }

  // --- Vendors ---

  loadVendors(): void {
    this.loading = true;
    this.api.get<any>('/vendors').subscribe({
      next: (res) => { this.vendors = res.data?.vendors || res.data || []; this.loading = false; },
      error: () => { this.vendors = []; this.loading = false; }
    });
  }

  loadVendorTypes(): void {
    this.api.get<any>('/vendors/types').subscribe({
      next: (res) => { this.vendorTypes = res.data?.types || res.data || []; },
      error: () => { this.vendorTypes = []; }
    });
  }

  openVendorForm(): void {
    this.editingVendorId = '';
    this.vendorForm = { name: '', vendorType: '', contactPerson: '', phone: '', email: '', address: '' };
    this.formError = '';
    this.showVendorForm = true;
  }

  cancelVendorForm(): void {
    this.showVendorForm = false;
    this.editingVendorId = '';
    this.formError = '';
  }

  saveVendor(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingVendorId
      ? this.api.put<any>(`/vendors/${this.editingVendorId}`, this.vendorForm)
      : this.api.post<any>('/vendors', this.vendorForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showVendorForm = false; this.editingVendorId = ''; this.loadVendors(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save vendor'; }
    });
  }

  editVendor(v: any): void {
    this.editingVendorId = v.id;
    this.vendorForm = {
      name: v.name || '',
      vendorType: v.vendorType || '',
      contactPerson: v.contactPerson || '',
      phone: v.phone || '',
      email: v.email || '',
      address: v.address || ''
    };
    this.formError = '';
    this.showVendorForm = true;
  }

  verifyVendor(v: any): void {
    this.api.put<any>(`/vendors/${v.id}/verify`, {}).subscribe({
      next: () => this.loadVendors()
    });
  }

  blacklistVendor(v: any): void {
    if (confirm(`Are you sure you want to blacklist vendor "${v.name}"?`)) {
      this.api.put<any>(`/vendors/${v.id}/blacklist`, {}).subscribe({
        next: () => this.loadVendors()
      });
    }
  }

  // --- Contracts ---

  loadContracts(): void {
    this.loading = true;
    this.api.get<any>('/vendors/contracts').subscribe({
      next: (res) => { this.contracts = res.data?.contracts || res.data || []; this.loading = false; },
      error: () => { this.contracts = []; this.loading = false; }
    });
  }

  resetContractForm(): void {
    this.contractForm = { vendorId: '', title: '', startDate: '', endDate: '', value: null, description: '' };
    this.formError = '';
  }

  saveContract(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/vendors/contracts', this.contractForm).subscribe({
      next: () => { this.saving = false; this.showContractForm = false; this.loadContracts(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save contract'; }
    });
  }

  approveContract(c: any): void {
    this.api.put<any>(`/vendors/contracts/${c.id}/approve`, {}).subscribe({
      next: () => this.loadContracts()
    });
  }

  // --- Work Orders ---

  loadWorkOrders(): void {
    this.loading = true;
    this.api.get<any>('/vendors/work-orders').subscribe({
      next: (res) => { this.workOrders = res.data?.workOrders || res.data || []; this.loading = false; },
      error: () => { this.workOrders = []; this.loading = false; }
    });
  }

  resetWorkOrderForm(): void {
    this.workOrderForm = { vendorId: '', title: '', description: '', priority: '', dueDate: '' };
    this.formError = '';
  }

  saveWorkOrder(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/vendors/work-orders', this.workOrderForm).subscribe({
      next: () => { this.saving = false; this.showWorkOrderForm = false; this.loadWorkOrders(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save work order'; }
    });
  }

  updateWorkOrderStatus(wo: any, newStatus: string): void {
    this.api.put<any>(`/vendors/work-orders/${wo.id}/status`, { status: newStatus }).subscribe({
      next: () => this.loadWorkOrders()
    });
  }

  // --- Payments ---

  loadPayments(): void {
    this.loading = true;
    this.api.get<any>('/vendors/payments').subscribe({
      next: (res) => { this.payments = res.data?.payments || res.data || []; this.loading = false; },
      error: () => { this.payments = []; this.loading = false; }
    });
  }

  resetPaymentForm(): void {
    this.paymentForm = { vendorId: '', amount: null, invoiceNumber: '', description: '' };
    this.formError = '';
  }

  savePayment(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/vendors/payments', this.paymentForm).subscribe({
      next: () => { this.saving = false; this.showPaymentForm = false; this.loadPayments(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to record payment'; }
    });
  }

  approvePayment(p: any): void {
    this.api.put<any>(`/vendors/payments/${p.id}/approve`, {}).subscribe({
      next: () => this.loadPayments()
    });
  }
}
