import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Reports</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'generate'" (click)="activeTab = 'generate'; loadGenerateTab()">Generate</button>
        <button class="tab" [class.active]="activeTab === 'history'" (click)="activeTab = 'history'; loadHistory()">History</button>
      </div>

      <!-- GENERATE TAB -->
      <div *ngIf="activeTab === 'generate'">
        <!-- Report Types -->
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-header"><span>Available Report Types</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <div class="report-types" *ngIf="!loading">
            <div class="report-type-card" *ngFor="let rt of reportTypes" (click)="selectReportType(rt)" [class.selected]="selectedReportType?.id === rt.id || selectedReportType?.name === rt.name">
              <div class="rt-name">{{ rt.name || '-' }}</div>
              <div class="rt-desc">{{ rt.description || '' }}</div>
            </div>
            <div *ngIf="reportTypes.length === 0 && !loading" class="empty-inline">No report types available</div>
          </div>
        </div>

        <!-- Generate Report Form -->
        <div class="card form-card" style="margin-bottom: 16px;">
          <h3>Generate Report</h3>
          <form (ngSubmit)="generateReport()">
            <div class="form-grid">
              <div class="form-group"><label>Template *</label>
                <select [(ngModel)]="generateForm.templateId" name="gtpl" required>
                  <option value="">Select Template</option>
                  <option *ngFor="let tpl of templates" [value]="tpl.id">{{ tpl.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>From Date *</label><input type="date" [(ngModel)]="generateForm.fromDate" name="gfrom" required></div>
              <div class="form-group"><label>To Date *</label><input type="date" [(ngModel)]="generateForm.toDate" name="gto" required></div>
              <div class="form-group"><label>Format *</label>
                <select [(ngModel)]="generateForm.format" name="gfmt" required>
                  <option value="">Select Format</option>
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Generate</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
            <div class="success-msg" *ngIf="generateSuccess">Report generated successfully!</div>
          </form>
        </div>

        <!-- Templates Management -->
        <div class="card form-card" *ngIf="showTemplateForm" style="margin-bottom: 16px;">
          <h3>{{ editingTemplateId ? 'Edit Template' : 'Add Template' }}</h3>
          <form (ngSubmit)="saveTemplate()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="templateForm.name" name="tplname" required placeholder="Template name"></div>
              <div class="form-group"><label>Type *</label>
                <select [(ngModel)]="templateForm.type" name="tpltype" required>
                  <option value="">Select Type</option>
                  <option *ngFor="let rt of reportTypes" [value]="rt.name || rt.id">{{ rt.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>Description</label><input type="text" [(ngModel)]="templateForm.description" name="tpldesc" placeholder="Optional description"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelTemplateForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="templateFormError">{{ templateFormError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Report Templates</span><button class="btn btn-primary btn-sm" (click)="openAddTemplate()" *ngIf="!showTemplateForm">+ Add Template</button></div>
          <div class="loading" *ngIf="loadingTemplates">Loading...</div>
          <table *ngIf="!loadingTemplates">
            <thead><tr><th>Name</th><th>Type</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let tpl of templates">
                <td class="name-cell">{{ tpl.name }}</td>
                <td>{{ tpl.type || '-' }}</td>
                <td>{{ tpl.description || '-' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editTemplate(tpl)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteTemplate(tpl)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="templates.length === 0"><td colspan="4" class="empty">No templates found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- HISTORY TAB -->
      <div *ngIf="activeTab === 'history'">
        <div class="card">
          <div class="card-header"><span>Report History</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Report Name</th><th>Type</th><th>Generated By</th><th>Date</th><th>Format</th><th>Size</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of historyRecords">
                <td class="name-cell">{{ r.name || r.reportName || '-' }}</td>
                <td>{{ r.type || '-' }}</td>
                <td>{{ r.generatedBy || '-' }}</td>
                <td>{{ r.date ? (r.date | date:'medium') : (r.createdAt ? (r.createdAt | date:'medium') : '-') }}</td>
                <td><span class="badge badge-format">{{ r.format || '-' }}</span></td>
                <td>{{ r.size || '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="r.status === 'completed' || r.status === 'ready'"
                    [class.badge-pending]="r.status === 'processing' || r.status === 'pending'"
                    [class.badge-inactive]="r.status === 'failed'">
                    {{ r.status || '-' }}
                  </span>
                </td>
                <td>
                  <a class="btn btn-primary btn-sm" *ngIf="r.status === 'completed' || r.status === 'ready'" (click)="downloadReport(r)">Download</a>
                  <button class="btn btn-danger btn-sm" (click)="deleteReport(r)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="historyRecords.length === 0"><td colspan="8" class="empty">No report history found</td></tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="pagination" *ngIf="historyTotal > historyLimit">
            <button class="btn btn-secondary btn-sm" [disabled]="historyPage <= 1" (click)="historyPage = historyPage - 1; loadHistory()">Previous</button>
            <span class="page-info">Page {{ historyPage }} of {{ historyTotalPages }}</span>
            <button class="btn btn-secondary btn-sm" [disabled]="historyPage >= historyTotalPages" (click)="historyPage = historyPage + 1; loadHistory()">Next</button>
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
    .report-types { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .report-type-card { background: #f9f9f9; border: 2px solid #eee; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s; }
    .report-type-card:hover { border-color: #1a1a2e; background: #f0f4ff; }
    .report-type-card.selected { border-color: #1a1a2e; background: #e8eaf6; }
    .rt-name { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px; }
    .rt-desc { font-size: 12px; color: #888; }
    .empty-inline { color: #999; font-size: 13px; padding: 12px 0; }
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
    .success-msg { color: #2e7d32; font-size: 13px; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active, .badge-completed { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-format { background: #e3f2fd; color: #1565c0; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; text-decoration: none; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #eee; }
    .page-info { font-size: 13px; color: #666; }
  `]
})
export class ReportsComponent implements OnInit {
  activeTab = 'generate';
  loading = false;
  loadingTemplates = false;
  saving = false;
  formError = '';
  templateFormError = '';
  generateSuccess = false;

  // Report Types
  reportTypes: any[] = [];
  selectedReportType: any = null;

  // Templates
  templates: any[] = [];
  showTemplateForm = false;
  editingTemplateId = '';
  templateForm = { name: '', type: '', description: '' };

  // Generate Form
  generateForm = { templateId: '', fromDate: '', toDate: '', format: '' };

  // History
  historyRecords: any[] = [];
  historyPage = 1;
  historyLimit = 20;
  historyTotal = 0;
  historyTotalPages = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadGenerateTab(); }

  // --- Generate Tab ---
  loadGenerateTab(): void {
    this.loadReportTypes();
    this.loadTemplates();
  }

  loadReportTypes(): void {
    this.loading = true;
    this.api.get<any>('/reports/types').subscribe({
      next: (res) => { this.reportTypes = res.data?.types || res.data || []; this.loading = false; },
      error: () => { this.reportTypes = []; this.loading = false; }
    });
  }

  selectReportType(rt: any): void {
    this.selectedReportType = rt;
  }

  loadTemplates(): void {
    this.loadingTemplates = true;
    this.api.get<any>('/reports/templates').subscribe({
      next: (res) => { this.templates = res.data?.templates || res.data || []; this.loadingTemplates = false; },
      error: () => { this.templates = []; this.loadingTemplates = false; }
    });
  }

  openAddTemplate(): void {
    this.editingTemplateId = '';
    this.templateForm = { name: '', type: '', description: '' };
    this.templateFormError = '';
    this.showTemplateForm = true;
  }

  editTemplate(tpl: any): void {
    this.editingTemplateId = tpl.id;
    this.templateForm = {
      name: tpl.name || '',
      type: tpl.type || '',
      description: tpl.description || ''
    };
    this.templateFormError = '';
    this.showTemplateForm = true;
  }

  cancelTemplateForm(): void {
    this.showTemplateForm = false;
    this.editingTemplateId = '';
    this.templateFormError = '';
  }

  saveTemplate(): void {
    this.saving = true;
    this.templateFormError = '';
    const req$ = this.editingTemplateId
      ? this.api.put<any>(`/reports/templates/${this.editingTemplateId}`, this.templateForm)
      : this.api.post<any>('/reports/templates', this.templateForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showTemplateForm = false; this.editingTemplateId = ''; this.loadTemplates(); },
      error: (err) => { this.saving = false; this.templateFormError = err.error?.message || 'Failed to save template'; }
    });
  }

  deleteTemplate(tpl: any): void {
    if (confirm(`Delete template "${tpl.name}"?`)) {
      this.api.delete<any>(`/reports/templates/${tpl.id}`).subscribe({
        next: () => this.loadTemplates(),
        error: (err) => { alert(err.error?.message || 'Failed to delete template'); }
      });
    }
  }

  generateReport(): void {
    this.saving = true;
    this.formError = '';
    this.generateSuccess = false;
    this.api.post<any>('/reports/generate', this.generateForm).subscribe({
      next: () => {
        this.saving = false;
        this.generateSuccess = true;
        this.generateForm = { templateId: '', fromDate: '', toDate: '', format: '' };
        setTimeout(() => { this.generateSuccess = false; }, 3000);
      },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to generate report'; }
    });
  }

  // --- History Tab ---
  loadHistory(): void {
    this.loading = true;
    this.api.get<any>('/reports/history', { page: this.historyPage, limit: this.historyLimit }).subscribe({
      next: (res) => {
        this.historyRecords = res.data?.reports || res.data?.records || res.data || [];
        this.historyTotal = res.data?.total || this.historyRecords.length;
        this.historyTotalPages = Math.ceil(this.historyTotal / this.historyLimit) || 1;
        this.loading = false;
      },
      error: () => { this.historyRecords = []; this.loading = false; }
    });
  }

  downloadReport(r: any): void {
    this.api.get<any>(`/reports/${r.id}/download`).subscribe({
      next: (res) => {
        const url = res.data?.url || res.data?.downloadUrl;
        if (url) {
          window.open(url, '_blank');
        }
      },
      error: (err) => { alert(err.error?.message || 'Failed to download report'); }
    });
  }

  deleteReport(r: any): void {
    if (confirm(`Delete report "${r.name || r.reportName}"?`)) {
      this.api.delete<any>(`/reports/${r.id}`).subscribe({
        next: () => this.loadHistory(),
        error: (err) => { alert(err.error?.message || 'Failed to delete report'); }
      });
    }
  }
}
