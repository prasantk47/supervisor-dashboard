import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-sla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>SLA Management</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'dashboard'" (click)="activeTab = 'dashboard'; loadDashboard()">Dashboard</button>
        <button class="tab" [class.active]="activeTab === 'configurations'" (click)="activeTab = 'configurations'; loadConfigs()">Configurations</button>
        <button class="tab" [class.active]="activeTab === 'tracking'" (click)="activeTab = 'tracking'; loadTracking()">Tracking</button>
        <button class="tab" [class.active]="activeTab === 'escalations'" (click)="activeTab = 'escalations'; loadEscalations()">Escalations</button>
      </div>

      <!-- DASHBOARD TAB -->
      <div *ngIf="activeTab === 'dashboard'">
        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-label">Total Tickets</div>
            <div class="stat-value">{{ dashboardStats.totalTickets || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">On Track</div>
            <div class="stat-value stat-green">{{ dashboardStats.onTrack || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">At Risk</div>
            <div class="stat-value stat-orange">{{ dashboardStats.atRisk || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Breached</div>
            <div class="stat-value stat-red">{{ dashboardStats.breached || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Avg Resolution Time</div>
            <div class="stat-value">{{ dashboardStats.avgResolutionTime || '-' }}</div>
          </div>
        </div>

        <!-- At Risk Table -->
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-header"><span>At Risk Tickets</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Ticket</th><th>Category</th><th>Priority</th><th>SLA Deadline</th><th>Time Remaining</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let t of atRiskTickets">
                <td class="name-cell">{{ t.ticket || t.ticketId || '-' }}</td>
                <td>{{ t.category || '-' }}</td>
                <td><span class="badge" [ngClass]="getPriorityClass(t.priority)">{{ t.priority || '-' }}</span></td>
                <td>{{ t.slaDeadline ? (t.slaDeadline | date:'medium') : '-' }}</td>
                <td><span class="badge badge-pending">{{ t.timeRemaining || '-' }}</span></td>
                <td><span class="badge badge-pending">{{ t.status || 'At Risk' }}</span></td>
              </tr>
              <tr *ngIf="atRiskTickets.length === 0"><td colspan="6" class="empty">No at-risk tickets</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Breached Table -->
        <div class="card">
          <div class="card-header"><span>Breached Tickets</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Ticket</th><th>Category</th><th>Priority</th><th>Breached At</th><th>Overdue By</th></tr></thead>
            <tbody>
              <tr *ngFor="let t of breachedTickets">
                <td class="name-cell">{{ t.ticket || t.ticketId || '-' }}</td>
                <td>{{ t.category || '-' }}</td>
                <td><span class="badge" [ngClass]="getPriorityClass(t.priority)">{{ t.priority || '-' }}</span></td>
                <td>{{ t.breachedAt ? (t.breachedAt | date:'medium') : '-' }}</td>
                <td><span class="badge badge-inactive">{{ t.overdueBy || '-' }}</span></td>
              </tr>
              <tr *ngIf="breachedTickets.length === 0"><td colspan="5" class="empty">No breached tickets</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CONFIGURATIONS TAB -->
      <div *ngIf="activeTab === 'configurations'">
        <div class="card form-card" *ngIf="showConfigForm">
          <h3>{{ editingConfigId ? 'Edit SLA Configuration' : 'Add SLA Configuration' }}</h3>
          <form (ngSubmit)="saveConfig()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="configForm.name" name="cfgname" required placeholder="e.g. Critical Response SLA"></div>
              <div class="form-group"><label>Category *</label><input type="text" [(ngModel)]="configForm.category" name="cfgcat" required placeholder="e.g. Technical Support"></div>
              <div class="form-group"><label>Priority *</label>
                <select [(ngModel)]="configForm.priority" name="cfgpri" required>
                  <option value="">Select Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div class="form-group"><label>Response Time (Hours) *</label><input type="number" [(ngModel)]="configForm.responseTimeHours" name="cfgresp" required placeholder="e.g. 4" min="0"></div>
              <div class="form-group"><label>Resolution Time (Hours) *</label><input type="number" [(ngModel)]="configForm.resolutionTimeHours" name="cfgres" required placeholder="e.g. 24" min="0"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelConfigForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>SLA Configurations</span><button class="btn btn-primary btn-sm" (click)="openAddConfig()" *ngIf="!showConfigForm">+ Add Configuration</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Category</th><th>Priority</th><th>Response Time</th><th>Resolution Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of configs">
                <td class="name-cell">{{ c.name }}</td>
                <td>{{ c.category || '-' }}</td>
                <td><span class="badge" [ngClass]="getPriorityClass(c.priority)">{{ c.priority || '-' }}</span></td>
                <td>{{ c.responseTimeHours || c.responseTime || '-' }} hrs</td>
                <td>{{ c.resolutionTimeHours || c.resolutionTime || '-' }} hrs</td>
                <td><span class="badge" [class.badge-active]="c.active !== false && !c.disabled" [class.badge-inactive]="c.active === false || c.disabled">{{ (c.active !== false && !c.disabled) ? 'Active' : 'Inactive' }}</span></td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editConfig(c)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteConfig(c)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="configs.length === 0"><td colspan="7" class="empty">No SLA configurations found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TRACKING TAB -->
      <div *ngIf="activeTab === 'tracking'">
        <div class="card">
          <div class="card-header"><span>SLA Tracking</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Ticket</th><th>SLA Config</th><th>Status</th><th>Started At</th><th>Deadline</th><th>Paused</th><th>Time Elapsed</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let t of trackingRecords">
                <td class="name-cell">{{ t.ticket || t.ticketId || '-' }}</td>
                <td>{{ t.slaConfig || t.slaConfigName || '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="t.status === 'within_sla'"
                    [class.badge-pending]="t.status === 'at_risk'"
                    [class.badge-inactive]="t.status === 'breached'">
                    {{ t.status || '-' }}
                  </span>
                </td>
                <td>{{ t.startedAt ? (t.startedAt | date:'medium') : '-' }}</td>
                <td>{{ t.deadline ? (t.deadline | date:'medium') : '-' }}</td>
                <td><span class="badge" [class.badge-pending]="t.paused" [class.badge-active]="!t.paused">{{ t.paused ? 'Yes' : 'No' }}</span></td>
                <td>{{ t.timeElapsed || '-' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" *ngIf="!t.paused" (click)="pauseTracking(t)">Pause</button>
                  <button class="btn btn-primary btn-sm" *ngIf="t.paused" (click)="resumeTracking(t)">Resume</button>
                </td>
              </tr>
              <tr *ngIf="trackingRecords.length === 0"><td colspan="8" class="empty">No tracking records found</td></tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="pagination" *ngIf="trackingTotal > trackingLimit">
            <button class="btn btn-secondary btn-sm" [disabled]="trackingPage <= 1" (click)="trackingPage = trackingPage - 1; loadTracking()">Previous</button>
            <span class="page-info">Page {{ trackingPage }} of {{ trackingTotalPages }}</span>
            <button class="btn btn-secondary btn-sm" [disabled]="trackingPage >= trackingTotalPages" (click)="trackingPage = trackingPage + 1; loadTracking()">Next</button>
          </div>
        </div>
      </div>

      <!-- ESCALATIONS TAB -->
      <div *ngIf="activeTab === 'escalations'">
        <div class="card">
          <div class="card-header"><span>SLA Escalations</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Ticket</th><th>SLA</th><th>Level</th><th>Escalated To</th><th>Escalated At</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of escalations">
                <td class="name-cell">{{ e.ticket || e.ticketId || '-' }}</td>
                <td>{{ e.sla || e.slaName || '-' }}</td>
                <td>{{ e.level || '-' }}</td>
                <td>{{ e.escalatedTo || '-' }}</td>
                <td>{{ e.escalatedAt ? (e.escalatedAt | date:'medium') : '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-pending]="e.status === 'pending'"
                    [class.badge-active]="e.status === 'acknowledged'">
                    {{ e.status || '-' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm" *ngIf="e.status === 'pending'" (click)="acknowledgeEscalation(e)">Acknowledge</button>
                  <span *ngIf="e.status !== 'pending'" class="badge badge-active">Done</span>
                </td>
              </tr>
              <tr *ngIf="escalations.length === 0"><td colspan="7" class="empty">No escalations found</td></tr>
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
    .stat-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-label { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 8px; }
    .stat-value { font-size: 28px; font-weight: 700; color: #333; }
    .stat-green { color: #2e7d32; }
    .stat-orange { color: #e65100; }
    .stat-red { color: #c62828; }
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
    .badge-low { background: #e3f2fd; color: #1565c0; }
    .badge-medium { background: #fff3e0; color: #e65100; }
    .badge-high { background: #fce4ec; color: #c62828; }
    .badge-critical { background: #f3e5f5; color: #6a1b9a; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
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
export class SlaComponent implements OnInit {
  activeTab = 'dashboard';
  loading = false;
  saving = false;
  formError = '';

  // Dashboard
  dashboardStats: any = {};
  atRiskTickets: any[] = [];
  breachedTickets: any[] = [];

  // Configurations
  configs: any[] = [];
  showConfigForm = false;
  editingConfigId = '';
  configForm = { name: '', category: '', priority: '', responseTimeHours: null as number | null, resolutionTimeHours: null as number | null };

  // Tracking
  trackingRecords: any[] = [];
  trackingPage = 1;
  trackingLimit = 20;
  trackingTotal = 0;
  trackingTotalPages = 1;

  // Escalations
  escalations: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadDashboard(); }

  // --- Dashboard ---
  loadDashboard(): void {
    this.loading = true;
    this.api.get<any>('/sla/dashboard').subscribe({
      next: (res) => { this.dashboardStats = res.data || {}; this.loading = false; },
      error: () => { this.dashboardStats = {}; this.loading = false; }
    });
    this.api.get<any>('/sla/at-risk').subscribe({
      next: (res) => { this.atRiskTickets = res.data?.tickets || res.data || []; },
      error: () => { this.atRiskTickets = []; }
    });
    this.api.get<any>('/sla/breached').subscribe({
      next: (res) => { this.breachedTickets = res.data?.tickets || res.data || []; },
      error: () => { this.breachedTickets = []; }
    });
  }

  getPriorityClass(priority: string): string {
    if (!priority) return '';
    const p = priority.toLowerCase();
    if (p === 'low') return 'badge-low';
    if (p === 'medium') return 'badge-medium';
    if (p === 'high') return 'badge-high';
    if (p === 'critical') return 'badge-critical';
    return '';
  }

  // --- Configurations ---
  loadConfigs(): void {
    this.loading = true;
    this.api.get<any>('/sla/configs').subscribe({
      next: (res) => { this.configs = res.data?.configs || res.data || []; this.loading = false; },
      error: () => { this.configs = []; this.loading = false; }
    });
  }

  openAddConfig(): void {
    this.editingConfigId = '';
    this.configForm = { name: '', category: '', priority: '', responseTimeHours: null, resolutionTimeHours: null };
    this.formError = '';
    this.showConfigForm = true;
  }

  editConfig(c: any): void {
    this.editingConfigId = c.id;
    this.configForm = {
      name: c.name || '',
      category: c.category || '',
      priority: c.priority || '',
      responseTimeHours: c.responseTimeHours || c.responseTime || null,
      resolutionTimeHours: c.resolutionTimeHours || c.resolutionTime || null
    };
    this.formError = '';
    this.showConfigForm = true;
  }

  cancelConfigForm(): void {
    this.showConfigForm = false;
    this.editingConfigId = '';
    this.formError = '';
  }

  saveConfig(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingConfigId
      ? this.api.put<any>(`/sla/configs/${this.editingConfigId}`, this.configForm)
      : this.api.post<any>('/sla/configs', this.configForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showConfigForm = false; this.editingConfigId = ''; this.loadConfigs(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save configuration'; }
    });
  }

  deleteConfig(c: any): void {
    if (confirm(`Delete SLA configuration "${c.name}"?`)) {
      this.api.delete<any>(`/sla/configs/${c.id}`).subscribe({
        next: () => this.loadConfigs(),
        error: (err) => { alert(err.error?.message || 'Failed to delete'); }
      });
    }
  }

  // --- Tracking ---
  loadTracking(): void {
    this.loading = true;
    this.api.get<any>('/sla/tracking', { page: this.trackingPage, limit: this.trackingLimit }).subscribe({
      next: (res) => {
        this.trackingRecords = res.data?.records || res.data?.trackings || res.data || [];
        this.trackingTotal = res.data?.total || this.trackingRecords.length;
        this.trackingTotalPages = Math.ceil(this.trackingTotal / this.trackingLimit) || 1;
        this.loading = false;
      },
      error: () => { this.trackingRecords = []; this.loading = false; }
    });
  }

  pauseTracking(t: any): void {
    this.api.post<any>(`/sla/tracking/${t.id}/pause`, {}).subscribe({
      next: () => this.loadTracking(),
      error: (err) => { alert(err.error?.message || 'Failed to pause'); }
    });
  }

  resumeTracking(t: any): void {
    this.api.post<any>(`/sla/tracking/${t.id}/resume`, {}).subscribe({
      next: () => this.loadTracking(),
      error: (err) => { alert(err.error?.message || 'Failed to resume'); }
    });
  }

  // --- Escalations ---
  loadEscalations(): void {
    this.loading = true;
    this.api.get<any>('/sla/escalations').subscribe({
      next: (res) => { this.escalations = res.data?.escalations || res.data || []; this.loading = false; },
      error: () => { this.escalations = []; this.loading = false; }
    });
  }

  acknowledgeEscalation(e: any): void {
    this.api.post<any>(`/sla/escalations/${e.id}/acknowledge`, {}).subscribe({
      next: () => this.loadEscalations(),
      error: (err) => { alert(err.error?.message || 'Failed to acknowledge'); }
    });
  }
}
