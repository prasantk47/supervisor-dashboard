import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-local-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Local Services</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'categories'" (click)="activeTab = 'categories'; loadCategories()">Categories</button>
        <button class="tab" [class.active]="activeTab === 'providers'" (click)="activeTab = 'providers'; loadProviders()">Providers</button>
        <button class="tab" [class.active]="activeTab === 'entry-exit'" (click)="activeTab = 'entry-exit'; loadEntryExit()">Entry / Exit</button>
      </div>

      <!-- CATEGORIES TAB -->
      <div *ngIf="activeTab === 'categories'">
        <div class="card form-card" *ngIf="showCatForm">
          <h3>{{ editingCatId ? 'Edit Category' : 'Add Category' }}</h3>
          <form (ngSubmit)="saveCategory()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="catForm.name" name="cname" required placeholder="e.g. Plumber, Electrician"></div>
              <div class="form-group"><label>Description</label><input type="text" [(ngModel)]="catForm.description" name="cdesc" placeholder="Optional"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showCatForm = false">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Service Categories</span><button class="btn btn-primary btn-sm" (click)="showCatForm = true" *ngIf="!showCatForm">+ Add Category</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Description</th><th>Providers</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of categories">
                <td class="name-cell">{{ c.name }}</td><td>{{ c.description || '-' }}</td>
                <td>{{ c.providerCount || 0 }}</td>
                <td><span class="badge" [class.badge-active]="!c.disabled" [class.badge-inactive]="c.disabled">{{ c.disabled ? 'Disabled' : 'Active' }}</span></td>
                <td><button class="btn btn-primary btn-sm" (click)="editCategory(c)">Edit</button></td>
              </tr>
              <tr *ngIf="categories.length === 0"><td colspan="5" class="empty">No categories found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PROVIDERS TAB -->
      <div *ngIf="activeTab === 'providers'">
        <div class="card form-card" *ngIf="showProvForm">
          <h3>{{ editingProvId ? 'Edit Provider' : 'Add Provider' }}</h3>
          <form (ngSubmit)="saveProvider()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="provForm.name" name="pname" required placeholder="Provider name"></div>
              <div class="form-group"><label>Mobile</label><input type="text" [(ngModel)]="provForm.mobileNumber" name="pmobile" placeholder="10-digit" maxlength="10"></div>
              <div class="form-group"><label>Category *</label>
                <select [(ngModel)]="provForm.localServiceId" name="pcat" required>
                  <option value="">Select Category</option><option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showProvForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Filter by category -->
        <div class="categories-bar" *ngIf="categories.length > 0">
          <span class="cat-chip" [class.active]="!selectedCategory" (click)="selectedCategory = ''; loadProviders()">All</span>
          <span class="cat-chip" *ngFor="let c of categories" [class.active]="selectedCategory === c.id" (click)="selectedCategory = c.id; loadProviders()">{{ c.name }}</span>
        </div>

        <div class="card">
          <div class="card-header"><span>Service Providers</span><button class="btn btn-primary btn-sm" (click)="showProvForm = true" *ngIf="!showProvForm">+ Add Provider</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Code</th><th>Name</th><th>Mobile</th><th>Category</th><th>Inside</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of providers">
                <td><span class="code-badge">{{ p.localServiceProviderCode || '-' }}</span></td>
                <td class="name-cell">{{ p.name }}</td><td>{{ p.mobileNumber || '-' }}</td>
                <td>{{ p.categoryName || '-' }}</td>
                <td><span class="badge" [class.badge-active]="p.isInside" [class.badge-inactive]="!p.isInside">{{ p.isInside ? 'Inside' : 'Outside' }}</span></td>
                <td><span class="badge" [class.badge-active]="!p.disabled" [class.badge-inactive]="p.disabled">{{ p.disabled ? 'Disabled' : 'Active' }}</span></td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editProvider(p)">Edit</button>
                  <button class="btn btn-danger btn-sm" *ngIf="!p.disabled" (click)="disableProvider(p)">Disable</button>
                </td>
              </tr>
              <tr *ngIf="providers.length === 0"><td colspan="7" class="empty">No providers found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ENTRY/EXIT TAB -->
      <div *ngIf="activeTab === 'entry-exit'">
        <div class="card">
          <div class="card-header"><span>Entry / Exit Records</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Provider</th><th>Category</th><th>Entry Time</th><th>Exit Time</th><th>Duration</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of entryExitRecords">
                <td class="name-cell">{{ r.providerName || '-' }}</td>
                <td>{{ r.categoryName || '-' }}</td>
                <td>{{ r.entryTime ? (r.entryTime | date:'medium') : '-' }}</td>
                <td>{{ r.exitTime ? (r.exitTime | date:'medium') : '-' }}</td>
                <td>{{ r.duration || '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="r.exitTime" [class.badge-pending]="!r.exitTime">
                    {{ r.exitTime ? 'Completed' : 'Inside' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="entryExitRecords.length === 0"><td colspan="6" class="empty">No entry/exit records found</td></tr>
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
    .categories-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .cat-chip { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #f0f0f0; color: #555; cursor: pointer; transition: all 0.2s; }
    .cat-chip:hover { background: #e0e0e0; }
    .cat-chip.active { background: #1a1a2e; color: #fff; }
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
    .code-badge { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
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
  `]
})
export class LocalServicesComponent implements OnInit {
  activeTab = 'categories';
  loading = false;
  saving = false;
  formError = '';
  selectedCategory = '';

  categories: any[] = [];
  providers: any[] = [];
  entryExitRecords: any[] = [];

  showCatForm = false; editingCatId = '';
  catForm = { name: '', description: '' };

  showProvForm = false; editingProvId = '';
  provForm = { name: '', mobileNumber: '', localServiceId: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void {
    this.loading = true;
    this.api.get<any>('/local-service').subscribe({
      next: (res) => { this.categories = res.data?.categories || res.data || []; this.loading = false; },
      error: () => { this.categories = []; this.loading = false; }
    });
  }

  saveCategory(): void {
    this.saving = true;
    const req$ = this.editingCatId
      ? this.api.put<any>('/local-service', { id: this.editingCatId, ...this.catForm })
      : this.api.post<any>('/local-service', this.catForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showCatForm = false; this.editingCatId = ''; this.loadCategories(); },
      error: () => { this.saving = false; }
    });
  }

  editCategory(c: any): void {
    this.editingCatId = c.id;
    this.catForm = { name: c.name, description: c.description || '' };
    this.showCatForm = true;
  }

  loadProviders(): void {
    this.loading = true;
    const params: any = {};
    if (this.selectedCategory) params.categoryId = this.selectedCategory;
    this.api.get<any>('/local-service-provider', params).subscribe({
      next: (res) => { this.providers = res.data?.providers || res.data || []; this.loading = false; },
      error: () => { this.providers = []; this.loading = false; }
    });
  }

  saveProvider(): void {
    this.saving = true; this.formError = '';
    const req$ = this.editingProvId
      ? this.api.put<any>('/local-service-provider', { id: this.editingProvId, ...this.provForm })
      : this.api.post<any>('/local-service-provider', this.provForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showProvForm = false; this.editingProvId = ''; this.loadProviders(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save'; }
    });
  }

  editProvider(p: any): void {
    this.editingProvId = p.id;
    this.provForm = { name: p.name, mobileNumber: p.mobileNumber || '', localServiceId: p.localServiceId || '' };
    this.showProvForm = true;
  }

  disableProvider(p: any): void {
    if (confirm(`Disable provider "${p.name}"?`)) {
      this.api.put<any>('/local-service-provider', { id: p.id, disabled: true }).subscribe({ next: () => this.loadProviders() });
    }
  }

  loadEntryExit(): void {
    this.loading = true;
    this.api.get<any>('/local-service-provider/entry-exit-record-3').subscribe({
      next: (res) => { this.entryExitRecords = res.data?.records || res.data || []; this.loading = false; },
      error: () => { this.entryExitRecords = []; this.loading = false; }
    });
  }
}
