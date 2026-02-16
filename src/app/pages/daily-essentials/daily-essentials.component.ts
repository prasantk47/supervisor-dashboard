import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-daily-essentials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Daily Essentials</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'providers'" (click)="activeTab = 'providers'; loadProviders()">Providers</button>
        <button class="tab" [class.active]="activeTab === 'subscriptions'" (click)="activeTab = 'subscriptions'; loadSubscriptions()">Subscriptions</button>
        <button class="tab" [class.active]="activeTab === 'deliveries'" (click)="activeTab = 'deliveries'; loadDeliveries()">Deliveries</button>
      </div>

      <!-- ==================== PROVIDERS TAB ==================== -->
      <div *ngIf="activeTab === 'providers'">
        <div class="card form-card" *ngIf="showProviderForm">
          <h3>Add Provider</h3>
          <form (ngSubmit)="saveProvider()">
            <div class="form-grid">
              <div class="form-group">
                <label>Name *</label>
                <input type="text" [(ngModel)]="providerForm.name" name="pname" required placeholder="Provider name">
              </div>
              <div class="form-group">
                <label>Service Type *</label>
                <select [(ngModel)]="providerForm.serviceType" name="pserviceType" required>
                  <option value="">Select Service Type</option>
                  <option *ngFor="let st of serviceTypes" [value]="st.id || st.name || st">{{ st.name || st }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Contact Person *</label>
                <input type="text" [(ngModel)]="providerForm.contactPerson" name="pcontact" required placeholder="Contact person name">
              </div>
              <div class="form-group">
                <label>Phone *</label>
                <input type="text" [(ngModel)]="providerForm.phone" name="pphone" required placeholder="Phone number" maxlength="15">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="providerForm.email" name="pemail" placeholder="Email address">
              </div>
              <div class="form-group">
                <label>Address</label>
                <input type="text" [(ngModel)]="providerForm.address" name="paddress" placeholder="Address">
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
              <button type="button" class="btn btn-secondary" (click)="showProviderForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <span>Providers</span>
            <button class="btn btn-primary btn-sm" (click)="openProviderForm()" *ngIf="!showProviderForm">+ Add Provider</button>
          </div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Verified</th>
                <th>Active</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of providers">
                <td class="name-cell">{{ p.name }}</td>
                <td>{{ p.serviceType || p.type || '-' }}</td>
                <td>{{ p.contactPerson || '-' }}<br *ngIf="p.phone"><small *ngIf="p.phone">{{ p.phone }}</small></td>
                <td>
                  <span class="badge" [class.badge-active]="p.verified || p.isVerified" [class.badge-pending]="!(p.verified || p.isVerified)">
                    {{ (p.verified || p.isVerified) ? 'Verified' : 'Unverified' }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class.badge-active]="p.active !== false && p.isActive !== false" [class.badge-inactive]="p.active === false || p.isActive === false">
                    {{ (p.active === false || p.isActive === false) ? 'Inactive' : 'Active' }}
                  </span>
                </td>
                <td>{{ p.rating || '-' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="verifyProvider(p)" *ngIf="!(p.verified || p.isVerified)">Verify</button>
                </td>
              </tr>
              <tr *ngIf="providers.length === 0"><td colspan="7" class="empty">No providers found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== SUBSCRIPTIONS TAB ==================== -->
      <div *ngIf="activeTab === 'subscriptions'">
        <div class="card form-card" *ngIf="showSubForm">
          <h3>Create Subscription</h3>
          <form (ngSubmit)="saveSubscription()">
            <div class="form-grid">
              <div class="form-group">
                <label>Provider *</label>
                <select [(ngModel)]="subForm.providerId" name="sprovider" required>
                  <option value="">Select Provider</option>
                  <option *ngFor="let p of providers" [value]="p.id || p._id">{{ p.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Service Type *</label>
                <select [(ngModel)]="subForm.serviceType" name="sservice" required>
                  <option value="">Select Service Type</option>
                  <option *ngFor="let st of serviceTypes" [value]="st.id || st.name || st">{{ st.name || st }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Quantity *</label>
                <input type="number" [(ngModel)]="subForm.quantity" name="sqty" required placeholder="Quantity" min="1">
              </div>
              <div class="form-group">
                <label>Frequency *</label>
                <select [(ngModel)]="subForm.frequency" name="sfreq" required>
                  <option value="">Select Frequency</option>
                  <option value="daily">Daily</option>
                  <option value="alternate">Alternate Days</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div class="form-group">
                <label>Start Date *</label>
                <input type="date" [(ngModel)]="subForm.startDate" name="sstart" required>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Create' }}</button>
              <button type="button" class="btn btn-secondary" (click)="showSubForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <span>Subscriptions</span>
            <button class="btn btn-primary btn-sm" (click)="openSubForm()" *ngIf="!showSubForm">+ New Subscription</button>
          </div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Provider</th>
                <th>Service</th>
                <th>Quantity</th>
                <th>Frequency</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of subscriptions">
                <td class="name-cell">{{ s.subscriberName || s.subscriber || '-' }}</td>
                <td>{{ s.providerName || s.provider || '-' }}</td>
                <td>{{ s.serviceType || s.service || '-' }}</td>
                <td>{{ s.quantity || '-' }}</td>
                <td>{{ s.frequency || '-' }}</td>
                <td>{{ s.startDate ? (s.startDate | date:'mediumDate') : '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="s.status === 'active'"
                    [class.badge-paused]="s.status === 'paused'"
                    [class.badge-inactive]="s.status === 'cancelled'">
                    {{ s.status || 'active' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" (click)="pauseSubscription(s)" *ngIf="s.status === 'active'">Pause</button>
                  <button class="btn btn-primary btn-sm" (click)="resumeSubscription(s)" *ngIf="s.status === 'paused'">Resume</button>
                  <button class="btn btn-danger btn-sm" (click)="cancelSubscription(s)" *ngIf="s.status !== 'cancelled'">Cancel</button>
                </td>
              </tr>
              <tr *ngIf="subscriptions.length === 0"><td colspan="8" class="empty">No subscriptions found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== DELIVERIES TAB ==================== -->
      <div *ngIf="activeTab === 'deliveries'">
        <!-- Report Issue Modal -->
        <div class="card form-card" *ngIf="showIssueForm">
          <h3>Report Issue for Delivery</h3>
          <form (ngSubmit)="submitIssue()">
            <div class="form-group">
              <label>Description *</label>
              <textarea [(ngModel)]="issueDescription" name="idesc" required placeholder="Describe the issue..." rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving || !issueDescription.trim()">{{ saving ? 'Submitting...' : 'Submit Issue' }}</button>
              <button type="button" class="btn btn-secondary" (click)="showIssueForm = false; issueDeliveryId = ''">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <span>Today's Deliveries</span>
            <button class="btn btn-secondary btn-sm" (click)="loadDeliveries()">Refresh</button>
          </div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Provider</th>
                <th>Service</th>
                <th>Quantity</th>
                <th>Scheduled Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of deliveries">
                <td class="name-cell">{{ d.subscriberName || d.subscriber || '-' }}</td>
                <td>{{ d.providerName || d.provider || '-' }}</td>
                <td>{{ d.serviceType || d.service || '-' }}</td>
                <td>{{ d.quantity || '-' }}</td>
                <td>{{ d.scheduledTime ? (d.scheduledTime | date:'shortTime') : '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-pending]="d.status === 'pending'"
                    [class.badge-active]="d.status === 'delivered'"
                    [class.badge-inactive]="d.status === 'missed'">
                    {{ d.status || 'pending' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="markDelivered(d)" *ngIf="d.status === 'pending'">Mark Delivered</button>
                  <button class="btn btn-secondary btn-sm" (click)="openIssueForm(d)" *ngIf="d.status !== 'missed'">Report Issue</button>
                </td>
              </tr>
              <tr *ngIf="deliveries.length === 0"><td colspan="7" class="empty">No deliveries found for today</td></tr>
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
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; }
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
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-paused { background: #e3f2fd; color: #1565c0; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    small { color: #999; font-size: 11px; }
  `]
})
export class DailyEssentialsComponent implements OnInit {
  activeTab = 'providers';
  loading = false;
  saving = false;
  formError = '';

  // Providers
  providers: any[] = [];
  serviceTypes: any[] = [];
  showProviderForm = false;
  providerForm = { name: '', serviceType: '', contactPerson: '', phone: '', email: '', address: '' };

  // Subscriptions
  subscriptions: any[] = [];
  showSubForm = false;
  subForm = { providerId: '', serviceType: '', quantity: 1, frequency: '', startDate: '' };

  // Deliveries
  deliveries: any[] = [];
  showIssueForm = false;
  issueDeliveryId = '';
  issueDescription = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadProviders();
    this.loadServiceTypes();
  }

  // ==================== PROVIDERS ====================

  loadServiceTypes(): void {
    this.api.get<any>('/daily-essentials/service-types').subscribe({
      next: (res) => { this.serviceTypes = res.data?.serviceTypes || res.data || []; },
      error: () => { this.serviceTypes = []; }
    });
  }

  loadProviders(): void {
    this.loading = true;
    this.api.get<any>('/daily-essentials/providers').subscribe({
      next: (res) => { this.providers = res.data?.providers || res.data || []; this.loading = false; },
      error: () => { this.providers = []; this.loading = false; }
    });
  }

  openProviderForm(): void {
    this.providerForm = { name: '', serviceType: '', contactPerson: '', phone: '', email: '', address: '' };
    this.formError = '';
    this.showProviderForm = true;
  }

  saveProvider(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/daily-essentials/providers', this.providerForm).subscribe({
      next: () => { this.saving = false; this.showProviderForm = false; this.loadProviders(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save provider'; }
    });
  }

  verifyProvider(p: any): void {
    if (confirm(`Verify provider "${p.name}"?`)) {
      this.api.put<any>(`/daily-essentials/providers/${p.id || p._id}/verify`, {}).subscribe({
        next: () => this.loadProviders(),
        error: () => {}
      });
    }
  }

  // ==================== SUBSCRIPTIONS ====================

  loadSubscriptions(): void {
    this.loading = true;
    this.api.get<any>('/daily-essentials/subscriptions').subscribe({
      next: (res) => { this.subscriptions = res.data?.subscriptions || res.data || []; this.loading = false; },
      error: () => { this.subscriptions = []; this.loading = false; }
    });
  }

  openSubForm(): void {
    this.subForm = { providerId: '', serviceType: '', quantity: 1, frequency: '', startDate: '' };
    this.formError = '';
    this.showSubForm = true;
    if (this.providers.length === 0) this.loadProviders();
  }

  saveSubscription(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/daily-essentials/subscriptions', this.subForm).subscribe({
      next: () => { this.saving = false; this.showSubForm = false; this.loadSubscriptions(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to create subscription'; }
    });
  }

  pauseSubscription(s: any): void {
    if (confirm('Pause this subscription?')) {
      this.api.put<any>(`/daily-essentials/subscriptions/${s.id || s._id}/pause`, {}).subscribe({
        next: () => this.loadSubscriptions(),
        error: () => {}
      });
    }
  }

  resumeSubscription(s: any): void {
    this.api.put<any>(`/daily-essentials/subscriptions/${s.id || s._id}/pause`, { resume: true }).subscribe({
      next: () => this.loadSubscriptions(),
      error: () => {}
    });
  }

  cancelSubscription(s: any): void {
    if (confirm('Cancel this subscription? This action cannot be undone.')) {
      this.api.put<any>(`/daily-essentials/subscriptions/${s.id || s._id}/cancel`, {}).subscribe({
        next: () => this.loadSubscriptions(),
        error: () => {}
      });
    }
  }

  // ==================== DELIVERIES ====================

  loadDeliveries(): void {
    this.loading = true;
    this.api.get<any>('/daily-essentials/deliveries/today').subscribe({
      next: (res) => { this.deliveries = res.data?.deliveries || res.data || []; this.loading = false; },
      error: () => { this.deliveries = []; this.loading = false; }
    });
  }

  markDelivered(d: any): void {
    this.api.put<any>(`/daily-essentials/deliveries/${d.id || d._id}/delivered`, {}).subscribe({
      next: () => this.loadDeliveries(),
      error: () => {}
    });
  }

  openIssueForm(d: any): void {
    this.issueDeliveryId = d.id || d._id;
    this.issueDescription = '';
    this.formError = '';
    this.showIssueForm = true;
  }

  submitIssue(): void {
    if (!this.issueDescription.trim()) return;
    this.saving = true;
    this.formError = '';
    this.api.post<any>(`/daily-essentials/deliveries/${this.issueDeliveryId}/issue`, { description: this.issueDescription }).subscribe({
      next: () => { this.saving = false; this.showIssueForm = false; this.issueDeliveryId = ''; this.issueDescription = ''; this.loadDeliveries(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to report issue'; }
    });
  }
}
