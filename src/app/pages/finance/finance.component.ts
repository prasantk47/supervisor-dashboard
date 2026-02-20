import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Finance</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'fiscal-years'" (click)="activeTab = 'fiscal-years'; loadFiscalYears()">Fiscal Years</button>
        <button class="tab" [class.active]="activeTab === 'bills'" (click)="activeTab = 'bills'; loadBillTypes()">Bill Generation</button>
        <button class="tab" [class.active]="activeTab === 'approvals'" (click)="activeTab = 'approvals'; loadApprovals()">Approvals</button>
        <button class="tab" [class.active]="activeTab === 'reconciliation'" (click)="activeTab = 'reconciliation'; loadReconciliation()">Bank Reconciliation</button>
        <button class="tab" [class.active]="activeTab === 'reports'" (click)="activeTab = 'reports'; loadScheduledReports()">Scheduled Reports</button>
      </div>

      <!-- FISCAL YEARS TAB -->
      <div *ngIf="activeTab === 'fiscal-years'">
        <div class="card form-card" *ngIf="showFYForm">
          <h3>Create Fiscal Year</h3>
          <form (ngSubmit)="saveFiscalYear()">
            <div class="form-grid">
              <div class="form-group"><label>Year Name *</label><input type="text" [(ngModel)]="fyForm.name" name="fyname" required placeholder="e.g. 2025-2026"></div>
              <div class="form-group"><label>Start Date *</label><input type="date" [(ngModel)]="fyForm.startDate" name="fystart" required></div>
              <div class="form-group"><label>End Date *</label><input type="date" [(ngModel)]="fyForm.endDate" name="fyend" required></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showFYForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Year-End Status Card -->
        <div class="card" style="margin-bottom: 16px;" *ngIf="yearEndStatus">
          <div class="card-header"><span>Year-End Status</span></div>
          <div class="status-grid">
            <div class="status-item"><span class="detail-label">Current Year:</span> {{ yearEndStatus.currentYear || '-' }}</div>
            <div class="status-item"><span class="detail-label">Status:</span>
              <span class="badge" [class.badge-active]="yearEndStatus.status === 'open'" [class.badge-inactive]="yearEndStatus.status === 'closed'">{{ yearEndStatus.status || '-' }}</span>
            </div>
            <div class="status-item"><span class="detail-label">Pending Bills:</span> {{ yearEndStatus.pendingBills || 0 }}</div>
            <div class="status-item"><span class="detail-label">Outstanding Amount:</span> {{ yearEndStatus.outstandingAmount || 0 }}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Fiscal Years</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" (click)="loadYearEndStatus()">Year-End Status</button>
              <button class="btn btn-primary btn-sm" (click)="openFYForm()" *ngIf="!showFYForm">+ Create Fiscal Year</button>
            </div>
          </div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Year Name</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let fy of fiscalYears">
                <td class="name-cell">{{ fy.name }}</td>
                <td>{{ fy.startDate | date:'mediumDate' }}</td>
                <td>{{ fy.endDate | date:'mediumDate' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="fy.status === 'open'" [class.badge-inactive]="fy.status === 'closed'">{{ fy.status || 'open' }}</span>
                </td>
                <td>
                  <button class="btn btn-danger btn-sm" *ngIf="fy.status === 'open'" (click)="closeYear(fy)">Close Year</button>
                  <span *ngIf="fy.status === 'closed'" style="color: #999; font-size: 12px;">Closed</span>
                </td>
              </tr>
              <tr *ngIf="fiscalYears.length === 0"><td colspan="5" class="empty">No fiscal years found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BILL GENERATION TAB -->
      <div *ngIf="activeTab === 'bills'">
        <div class="card form-card" *ngIf="showBillTypeForm">
          <h3>Create Bill Type</h3>
          <form (ngSubmit)="saveBillType()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="billTypeForm.name" name="btname" required placeholder="e.g. Maintenance"></div>
              <div class="form-group"><label>Calculation Method *</label>
                <select [(ngModel)]="billTypeForm.calculationMethod" name="btmethod" required>
                  <option value="">Select Method</option>
                  <option value="fixed">Fixed</option>
                  <option value="per_sqft">Per Sq. Ft.</option>
                  <option value="per_bhk">Per BHK</option>
                </select>
              </div>
              <div class="form-group"><label>Amount *</label><input type="number" [(ngModel)]="billTypeForm.amount" name="btamt" required placeholder="0.00" step="0.01"></div>
            </div>
            <div class="form-group" style="margin-top: 12px;">
              <label>Description</label>
              <textarea [(ngModel)]="billTypeForm.description" name="btdesc" rows="2" placeholder="Bill type description"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showBillTypeForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card" style="margin-bottom: 16px;">
          <div class="card-header"><span>Bill Types</span><button class="btn btn-primary btn-sm" (click)="openBillTypeForm()" *ngIf="!showBillTypeForm">+ Create Bill Type</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Method</th><th>Amount</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let bt of billTypes">
                <td class="name-cell">{{ bt.name }}</td>
                <td><span class="code-badge">{{ bt.calculationMethod }}</span></td>
                <td>{{ bt.amount }}</td>
                <td>{{ bt.description || '-' }}</td>
                <td><button class="btn btn-primary btn-sm" (click)="selectBillTypeForGenerate(bt)">Generate</button></td>
              </tr>
              <tr *ngIf="billTypes.length === 0"><td colspan="5" class="empty">No bill types found</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Generate Monthly Bills Form -->
        <div class="card form-card" *ngIf="showGenerateForm">
          <h3>Generate Monthly Bills</h3>
          <form (ngSubmit)="generateMonthlyBills()">
            <div class="form-grid">
              <div class="form-group"><label>Bill Type</label><input type="text" [value]="selectedBillTypeName" disabled></div>
              <div class="form-group"><label>Month *</label>
                <select [(ngModel)]="generateForm.month" name="gmonth" required>
                  <option value="">Select Month</option>
                  <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
                </select>
              </div>
              <div class="form-group"><label>Year *</label><input type="number" [(ngModel)]="generateForm.year" name="gyear" required placeholder="e.g. 2025"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Generate Bills</button>
              <button type="button" class="btn btn-secondary" (click)="showGenerateForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
            <div class="success-msg" *ngIf="generateSuccess">{{ generateSuccess }}</div>
          </form>
        </div>

        <!-- Bill Calculation Breakdown -->
        <div class="card" *ngIf="showBreakdown" style="margin-top: 16px;">
          <div class="card-header"><span>Calculation Breakdown</span><button class="btn btn-secondary btn-sm" (click)="showBreakdown = false">Close</button></div>
          <div class="loading" *ngIf="loadingBreakdown">Loading breakdown...</div>
          <div *ngIf="!loadingBreakdown && breakdown">
            <div class="status-grid" style="margin-bottom: 12px;">
              <div class="status-item"><span class="detail-label">Bill Type:</span> {{ breakdown.billTypeName || '-' }}</div>
              <div class="status-item"><span class="detail-label">Method:</span> {{ breakdown.calculationMethod || '-' }}</div>
              <div class="status-item"><span class="detail-label">Base Amount:</span> {{ breakdown.baseAmount || '-' }}</div>
              <div class="status-item"><span class="detail-label">Total:</span> {{ breakdown.totalAmount || '-' }}</div>
            </div>
            <table *ngIf="breakdown.items?.length > 0">
              <thead><tr><th>Unit</th><th>Resident</th><th>Area/BHK</th><th>Calculated Amount</th></tr></thead>
              <tbody>
                <tr *ngFor="let item of breakdown.items">
                  <td>{{ item.unit || '-' }}</td>
                  <td>{{ item.residentName || '-' }}</td>
                  <td>{{ item.area || item.bhk || '-' }}</td>
                  <td>{{ item.amount || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- APPROVALS TAB -->
      <div *ngIf="activeTab === 'approvals'">
        <!-- Reject Reason Modal -->
        <div class="card form-card" *ngIf="showRejectForm">
          <h3>Reject Approval</h3>
          <form (ngSubmit)="submitReject()">
            <div class="form-group">
              <label>Reason for Rejection *</label>
              <textarea [(ngModel)]="rejectReason" name="rjreason" rows="3" required placeholder="Enter reason for rejection"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-danger" [disabled]="saving || !rejectReason.trim()">Reject</button>
              <button type="button" class="btn btn-secondary" (click)="showRejectForm = false; rejectingId = ''">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Pending Approvals</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Bill</th><th>Amount</th><th>Submitted By</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of approvals">
                <td class="name-cell">{{ a.billName || a.billType || '-' }}</td>
                <td>{{ a.amount || 0 }}</td>
                <td>{{ a.submittedBy || a.submittedByName || '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-pending]="a.status === 'pending'"
                    [class.badge-active]="a.status === 'approved'"
                    [class.badge-inactive]="a.status === 'rejected'">
                    {{ a.status || 'pending' }}
                  </span>
                </td>
                <td>{{ a.createdAt ? (a.createdAt | date:'mediumDate') : '-' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" *ngIf="a.status === 'pending'" (click)="approveApproval(a)">Approve</button>
                  <button class="btn btn-danger btn-sm" *ngIf="a.status === 'pending'" (click)="openRejectForm(a)">Reject</button>
                  <button class="btn btn-secondary btn-sm" (click)="toggleHistory(a)">History</button>
                </td>
              </tr>
              <tr *ngIf="approvals.length === 0"><td colspan="6" class="empty">No pending approvals</td></tr>
            </tbody>
          </table>

          <!-- Approval History Expansion -->
          <div *ngIf="showHistoryForId">
            <div class="card" style="margin-top: 12px; background: #fafafa;">
              <div class="card-header"><span>Approval History</span><button class="btn btn-secondary btn-sm" (click)="showHistoryForId = ''">Close</button></div>
              <div class="loading" *ngIf="loadingHistory">Loading history...</div>
              <table *ngIf="!loadingHistory && approvalHistory.length > 0">
                <thead><tr><th>Action</th><th>By</th><th>Date</th><th>Reason</th></tr></thead>
                <tbody>
                  <tr *ngFor="let h of approvalHistory">
                    <td>
                      <span class="badge"
                        [class.badge-pending]="h.action === 'submitted'"
                        [class.badge-active]="h.action === 'approved'"
                        [class.badge-inactive]="h.action === 'rejected'">
                        {{ h.action }}
                      </span>
                    </td>
                    <td>{{ h.by || h.userName || '-' }}</td>
                    <td>{{ h.date ? (h.date | date:'medium') : (h.createdAt ? (h.createdAt | date:'medium') : '-') }}</td>
                    <td>{{ h.reason || '-' }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="empty" *ngIf="!loadingHistory && approvalHistory.length === 0">No history available</div>
            </div>
          </div>
        </div>
      </div>

      <!-- BANK RECONCILIATION TAB -->
      <div *ngIf="activeTab === 'reconciliation'">
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-header"><span>Upload Bank Statement</span></div>
          <form (ngSubmit)="uploadBankStatement()">
            <div class="form-grid">
              <div class="form-group"><label>Bank Name</label><input type="text" [(ngModel)]="reconForm.bankName" name="rbname" placeholder="e.g. HDFC Bank"></div>
              <div class="form-group"><label>Statement Period From</label><input type="date" [(ngModel)]="reconForm.periodFrom" name="rpfrom"></div>
              <div class="form-group"><label>Statement Period To</label><input type="date" [(ngModel)]="reconForm.periodTo" name="rpto"></div>
            </div>
            <div class="form-group" style="margin-top: 8px;"><label>Statement File (CSV/Excel)</label><input type="file" (change)="onStatementFileChange($event)" accept=".csv,.xlsx,.xls"></div>
            <div class="form-actions"><button type="submit" class="btn btn-primary" [disabled]="saving">Upload & Reconcile</button></div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Reconciliation Summary</span></div>
          <div class="loading" *ngIf="loadingRecon">Loading...</div>
          <div *ngIf="!loadingRecon && reconSummary">
            <div class="status-grid" style="margin-bottom: 16px;">
              <div class="status-item"><span class="detail-label">Total Collections:</span> {{ reconSummary.totalCollections || 0 }}</div>
              <div class="status-item"><span class="detail-label">Matched:</span> {{ reconSummary.matched || 0 }}</div>
              <div class="status-item"><span class="detail-label">Unmatched:</span> {{ reconSummary.unmatched || 0 }}</div>
              <div class="status-item"><span class="detail-label">Discrepancy:</span> {{ reconSummary.discrepancy || 0 }}</div>
            </div>
          </div>
          <table *ngIf="!loadingRecon && reconItems.length > 0">
            <thead><tr><th>Date</th><th>Description</th><th>Bank Amount</th><th>System Amount</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of reconItems">
                <td>{{ r.date | date:'mediumDate' }}</td>
                <td>{{ r.description || '-' }}</td>
                <td>{{ r.bankAmount || 0 }}</td>
                <td>{{ r.systemAmount || 0 }}</td>
                <td>
                  <span class="badge" [class.badge-active]="r.status === 'matched'" [class.badge-pending]="r.status === 'unmatched'" [class.badge-inactive]="r.status === 'discrepancy'">{{ r.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty" *ngIf="!loadingRecon && reconItems.length === 0">No reconciliation data. Upload a bank statement to begin.</div>
        </div>
      </div>

      <!-- SCHEDULED REPORTS TAB -->
      <div *ngIf="activeTab === 'reports'">
        <div class="card form-card" *ngIf="showReportForm">
          <h3>{{ editingReportId ? 'Edit Report Schedule' : 'Create Report Schedule' }}</h3>
          <form (ngSubmit)="saveReport()">
            <div class="form-grid">
              <div class="form-group"><label>Report Name *</label><input type="text" [(ngModel)]="reportForm.name" name="rpname" required placeholder="e.g. Monthly Collection Report"></div>
              <div class="form-group"><label>Report Type *</label>
                <select [(ngModel)]="reportForm.type" name="rptype" required>
                  <option value="">Select Type</option>
                  <option value="collection">Collection Summary</option>
                  <option value="defaulter">Defaulter Report</option>
                  <option value="expense">Expense Report</option>
                  <option value="maintenance">Maintenance Dues</option>
                  <option value="visitor">Visitor Report</option>
                  <option value="complaint">Complaint Report</option>
                </select>
              </div>
              <div class="form-group"><label>Frequency *</label>
                <select [(ngModel)]="reportForm.frequency" name="rpfreq" required>
                  <option value="">Select Frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>
            <div class="form-grid" style="margin-top: 8px;">
              <div class="form-group"><label>Send To (Email)</label><input type="email" [(ngModel)]="reportForm.email" name="rpemail" placeholder="admin@society.com"></div>
              <div class="form-group"><label>Format</label>
                <select [(ngModel)]="reportForm.format" name="rpfmt">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">{{ editingReportId ? 'Update' : 'Create' }}</button>
              <button type="button" class="btn btn-secondary" (click)="cancelReportForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Scheduled Reports</span><button class="btn btn-primary btn-sm" (click)="openReportForm()" *ngIf="!showReportForm">+ Add Schedule</button></div>
          <div class="loading" *ngIf="loadingReports">Loading...</div>
          <table *ngIf="!loadingReports">
            <thead><tr><th>Name</th><th>Type</th><th>Frequency</th><th>Format</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of scheduledReports">
                <td class="name-cell">{{ r.name }}</td>
                <td><span class="code-badge">{{ r.type }}</span></td>
                <td>{{ r.frequency }}</td>
                <td>{{ r.format || 'pdf' }}</td>
                <td>{{ r.email || '-' }}</td>
                <td><span class="badge" [class.badge-active]="r.isActive !== false" [class.badge-inactive]="r.isActive === false">{{ r.isActive !== false ? 'Active' : 'Paused' }}</span></td>
                <td>
                  <button class="btn btn-sm btn-secondary" (click)="editReport(r)">Edit</button>
                  <button class="btn btn-sm btn-danger" (click)="deleteReport(r)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="scheduledReports.length === 0"><td colspan="7" class="empty">No scheduled reports. Create one above.</td></tr>
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
    .form-group input, .form-group select, .form-group textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #4fc3f7; }
    .form-group textarea { resize: vertical; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
    .error-msg { color: #f44336; font-size: 13px; margin-top: 8px; }
    .success-msg { color: #2e7d32; font-size: 13px; margin-top: 8px; }
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
    .status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .status-item { font-size: 13px; color: #555; padding: 4px 0; }
    .detail-label { font-weight: 600; color: #333; }
  `]
})
export class FinanceComponent implements OnInit {
  activeTab = 'fiscal-years';
  loading = false;
  saving = false;
  formError = '';

  // Fiscal Years
  fiscalYears: any[] = [];
  showFYForm = false;
  fyForm = { name: '', startDate: '', endDate: '' };
  yearEndStatus: any = null;

  // Bill Types & Generation
  billTypes: any[] = [];
  showBillTypeForm = false;
  billTypeForm = { name: '', calculationMethod: '', amount: null as number | null, description: '' };
  showGenerateForm = false;
  generateForm = { billTypeId: '', month: '', year: new Date().getFullYear() };
  selectedBillTypeName = '';
  generateSuccess = '';
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Breakdown
  showBreakdown = false;
  loadingBreakdown = false;
  breakdown: any = null;

  // Approvals
  approvals: any[] = [];
  showRejectForm = false;
  rejectingId = '';
  rejectReason = '';

  // Approval History
  showHistoryForId = '';
  loadingHistory = false;
  approvalHistory: any[] = [];

  // Bank Reconciliation
  loadingRecon = false;
  reconSummary: any = null;
  reconItems: any[] = [];
  reconForm = { bankName: '', periodFrom: '', periodTo: '' };
  statementFile: File | null = null;

  // Scheduled Reports
  loadingReports = false;
  scheduledReports: any[] = [];
  showReportForm = false;
  editingReportId: string | null = null;
  reportForm: any = { name: '', type: '', frequency: '', email: '', format: 'pdf' };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadFiscalYears(); }

  // === FISCAL YEARS ===

  loadFiscalYears(): void {
    this.loading = true;
    this.api.get<any>('/finance/fiscal-years').subscribe({
      next: (res) => { this.fiscalYears = res.data?.fiscalYears || res.data || []; this.loading = false; },
      error: () => { this.fiscalYears = []; this.loading = false; }
    });
  }

  openFYForm(): void {
    this.fyForm = { name: '', startDate: '', endDate: '' };
    this.formError = '';
    this.showFYForm = true;
  }

  saveFiscalYear(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/finance/fiscal-years', this.fyForm).subscribe({
      next: () => { this.saving = false; this.showFYForm = false; this.loadFiscalYears(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to create fiscal year'; }
    });
  }

  loadYearEndStatus(): void {
    this.api.get<any>('/finance/year-end/status').subscribe({
      next: (res) => { this.yearEndStatus = res.data || res; },
      error: () => { this.yearEndStatus = null; }
    });
  }

  closeYear(fy: any): void {
    if (confirm(`Close fiscal year "${fy.name}"? This action cannot be undone.`)) {
      this.api.post<any>('/finance/year-end/close', { fiscalYearId: fy.id || fy._id }).subscribe({
        next: () => { this.loadFiscalYears(); this.yearEndStatus = null; },
        error: () => {}
      });
    }
  }

  // === BILL TYPES & GENERATION ===

  loadBillTypes(): void {
    this.loading = true;
    this.api.get<any>('/finance/bills/types').subscribe({
      next: (res) => { this.billTypes = res.data?.billTypes || res.data || []; this.loading = false; },
      error: () => { this.billTypes = []; this.loading = false; }
    });
  }

  openBillTypeForm(): void {
    this.billTypeForm = { name: '', calculationMethod: '', amount: null, description: '' };
    this.formError = '';
    this.showBillTypeForm = true;
  }

  saveBillType(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/finance/bills/types', this.billTypeForm).subscribe({
      next: () => { this.saving = false; this.showBillTypeForm = false; this.loadBillTypes(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to create bill type'; }
    });
  }

  selectBillTypeForGenerate(bt: any): void {
    this.generateForm.billTypeId = bt.id || bt._id;
    this.selectedBillTypeName = bt.name;
    this.generateForm.month = '';
    this.generateForm.year = new Date().getFullYear();
    this.generateSuccess = '';
    this.formError = '';
    this.showGenerateForm = true;
  }

  generateMonthlyBills(): void {
    this.saving = true;
    this.formError = '';
    this.generateSuccess = '';
    this.api.post<any>('/finance/bills/generate-monthly', this.generateForm).subscribe({
      next: (res) => {
        this.saving = false;
        this.generateSuccess = res.data?.message || 'Bills generated successfully';
        if (res.data?.billId) {
          this.loadBreakdown(res.data.billId);
        }
      },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to generate bills'; }
    });
  }

  loadBreakdown(billId: string): void {
    this.showBreakdown = true;
    this.loadingBreakdown = true;
    this.breakdown = null;
    this.api.get<any>(`/finance/bills/${billId}/calculation-breakdown`).subscribe({
      next: (res) => { this.breakdown = res.data || res; this.loadingBreakdown = false; },
      error: () => { this.breakdown = null; this.loadingBreakdown = false; }
    });
  }

  // === APPROVALS ===

  loadApprovals(): void {
    this.loading = true;
    this.api.get<any>('/finance/approvals/pending').subscribe({
      next: (res) => { this.approvals = res.data?.approvals || res.data || []; this.loading = false; },
      error: () => { this.approvals = []; this.loading = false; }
    });
  }

  approveApproval(a: any): void {
    const id = a.id || a._id;
    if (confirm('Approve this item?')) {
      this.api.post<any>(`/finance/approvals/${id}/approve`, {}).subscribe({
        next: () => this.loadApprovals(),
        error: () => {}
      });
    }
  }

  openRejectForm(a: any): void {
    this.rejectingId = a.id || a._id;
    this.rejectReason = '';
    this.showRejectForm = true;
  }

  submitReject(): void {
    this.saving = true;
    this.api.post<any>(`/finance/approvals/${this.rejectingId}/reject`, { reason: this.rejectReason }).subscribe({
      next: () => { this.saving = false; this.showRejectForm = false; this.rejectingId = ''; this.rejectReason = ''; this.loadApprovals(); },
      error: () => { this.saving = false; }
    });
  }

  toggleHistory(a: any): void {
    const id = a.id || a._id;
    if (this.showHistoryForId === id) {
      this.showHistoryForId = '';
      return;
    }
    this.showHistoryForId = id;
    this.loadingHistory = true;
    this.approvalHistory = [];
    this.api.get<any>(`/finance/approvals/${id}/history`).subscribe({
      next: (res) => { this.approvalHistory = res.data?.history || res.data || []; this.loadingHistory = false; },
      error: () => { this.approvalHistory = []; this.loadingHistory = false; }
    });
  }

  // === BANK RECONCILIATION ===

  loadReconciliation(): void {
    this.loadingRecon = true;
    this.api.get<any>('/finance/reconciliation').subscribe({
      next: (res) => {
        this.reconSummary = res.data?.summary || null;
        this.reconItems = res.data?.items || res.data || [];
        this.loadingRecon = false;
      },
      error: () => { this.reconSummary = null; this.reconItems = []; this.loadingRecon = false; }
    });
  }

  onStatementFileChange(event: any): void {
    this.statementFile = event.target?.files?.[0] || null;
  }

  uploadBankStatement(): void {
    this.saving = true;
    this.formError = '';
    const formData = new FormData();
    if (this.statementFile) formData.append('statement', this.statementFile);
    formData.append('bankName', this.reconForm.bankName);
    formData.append('periodFrom', this.reconForm.periodFrom);
    formData.append('periodTo', this.reconForm.periodTo);

    this.api.post<any>('/finance/reconciliation/upload', formData).subscribe({
      next: () => { this.saving = false; this.loadReconciliation(); },
      error: (err: any) => { this.saving = false; this.formError = err.error?.message || 'Failed to upload statement'; }
    });
  }

  // === SCHEDULED REPORTS ===

  loadScheduledReports(): void {
    this.loadingReports = true;
    this.api.get<any>('/finance/scheduled-reports').subscribe({
      next: (res) => { this.scheduledReports = res.data?.reports || res.data || []; this.loadingReports = false; },
      error: () => { this.scheduledReports = []; this.loadingReports = false; }
    });
  }

  openReportForm(): void {
    this.showReportForm = true;
    this.editingReportId = null;
    this.reportForm = { name: '', type: '', frequency: '', email: '', format: 'pdf' };
    this.formError = '';
  }

  editReport(r: any): void {
    this.showReportForm = true;
    this.editingReportId = r.id;
    this.reportForm = { name: r.name, type: r.type, frequency: r.frequency, email: r.email || '', format: r.format || 'pdf' };
    this.formError = '';
  }

  cancelReportForm(): void {
    this.showReportForm = false;
    this.editingReportId = null;
    this.formError = '';
  }

  saveReport(): void {
    if (!this.reportForm.name || !this.reportForm.type || !this.reportForm.frequency) {
      this.formError = 'Name, type and frequency are required';
      return;
    }
    this.saving = true;
    this.formError = '';

    const req = this.editingReportId
      ? this.api.put<any>(`/finance/scheduled-reports/${this.editingReportId}`, this.reportForm)
      : this.api.post<any>('/finance/scheduled-reports', this.reportForm);

    req.subscribe({
      next: () => { this.saving = false; this.showReportForm = false; this.editingReportId = null; this.loadScheduledReports(); },
      error: (err: any) => { this.saving = false; this.formError = err.error?.message || 'Failed to save report schedule'; }
    });
  }

  deleteReport(r: any): void {
    if (!confirm(`Delete report schedule "${r.name}"?`)) return;
    this.api.delete<any>(`/finance/scheduled-reports/${r.id}`).subscribe({
      next: () => this.loadScheduledReports()
    });
  }
}
