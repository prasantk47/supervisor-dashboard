import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-advertisements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Advertisements</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'all'" (click)="activeTab = 'all'; loadAds()">All Ads</button>
        <button class="tab" [class.active]="activeTab === 'statistics'" (click)="activeTab = 'statistics'; loadStatistics()">Statistics</button>
      </div>

      <!-- ALL ADS TAB -->
      <div *ngIf="activeTab === 'all'">
        <div class="card form-card" *ngIf="showForm">
          <h3>{{ editingId ? 'Edit Advertisement' : 'Add Advertisement' }}</h3>
          <form (ngSubmit)="saveAd()">
            <div class="form-grid">
              <div class="form-group"><label>Title *</label><input type="text" [(ngModel)]="adForm.title" name="title" required placeholder="Ad title"></div>
              <div class="form-group"><label>Advertiser Name *</label><input type="text" [(ngModel)]="adForm.advertiserName" name="advertiserName" required placeholder="Advertiser name"></div>
              <div class="form-group"><label>Placement *</label>
                <select [(ngModel)]="adForm.placement" name="placement" required>
                  <option value="">Select Placement</option>
                  <option value="banner">Banner</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="popup">Popup</option>
                  <option value="feed">Feed</option>
                </select>
              </div>
              <div class="form-group"><label>Start Date *</label><input type="date" [(ngModel)]="adForm.startDate" name="startDate" required></div>
              <div class="form-group"><label>End Date *</label><input type="date" [(ngModel)]="adForm.endDate" name="endDate" required></div>
              <div class="form-group"><label>Target URL</label><input type="url" [(ngModel)]="adForm.targetUrl" name="targetUrl" placeholder="https://example.com"></div>
            </div>
            <div class="form-group" style="margin-top: 12px;">
              <label>Description</label>
              <textarea [(ngModel)]="adForm.description" name="description" rows="3" placeholder="Ad description (optional)"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>All Advertisements</span><button class="btn btn-primary btn-sm" (click)="openAddForm()" *ngIf="!showForm">+ Add Advertisement</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Title</th>
                <th>Advertiser</th>
                <th>Type</th>
                <th>Placement</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Views</th>
                <th>Clicks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ad of advertisements">
                <td class="name-cell">{{ ad.title }}</td>
                <td>{{ ad.advertiserName || '-' }}</td>
                <td>{{ ad.type || '-' }}</td>
                <td><span class="code-badge">{{ ad.placement || '-' }}</span></td>
                <td>{{ ad.startDate ? (ad.startDate | date:'mediumDate') : '-' }}</td>
                <td>{{ ad.endDate ? (ad.endDate | date:'mediumDate') : '-' }}</td>
                <td>{{ ad.views || 0 }}</td>
                <td>{{ ad.clicks || 0 }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="ad.status === 'active'"
                    [class.badge-inactive]="ad.status === 'expired'"
                    [class.badge-pending]="ad.status === 'draft'">
                    {{ ad.status | titlecase }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn btn-primary btn-sm" (click)="editAd(ad)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteAd(ad)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="advertisements.length === 0"><td colspan="10" class="empty">No advertisements found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- STATISTICS TAB -->
      <div *ngIf="activeTab === 'statistics'">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalAds || 0 }}</div>
            <div class="stat-label">Total Ads</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.activeAds || 0 }}</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalViews || 0 }}</div>
            <div class="stat-label">Total Views</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalClicks || 0 }}</div>
            <div class="stat-label">Total Clicks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.ctr || '0.00' }}%</div>
            <div class="stat-label">CTR</div>
          </div>
        </div>
        <div class="loading" *ngIf="loading">Loading statistics...</div>
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
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .actions-cell { white-space: nowrap; }
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
    .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
    .stat-label { font-size: 13px; color: #888; font-weight: 500; }
  `]
})
export class AdvertisementsComponent implements OnInit {
  activeTab = 'all';
  loading = false;
  saving = false;
  formError = '';

  advertisements: any[] = [];
  stats: any = {};

  showForm = false;
  editingId = '';
  adForm = { title: '', advertiserName: '', description: '', placement: '', startDate: '', endDate: '', targetUrl: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadAds(); }

  loadAds(): void {
    this.loading = true;
    this.api.get<any>('/advertisements').subscribe({
      next: (res) => { this.advertisements = res.data?.advertisements || res.data || []; this.loading = false; },
      error: () => { this.advertisements = []; this.loading = false; }
    });
  }

  loadActiveAds(): void {
    this.loading = true;
    this.api.get<any>('/advertisements/active').subscribe({
      next: (res) => { this.advertisements = res.data?.advertisements || res.data || []; this.loading = false; },
      error: () => { this.advertisements = []; this.loading = false; }
    });
  }

  loadStatistics(): void {
    this.loading = true;
    this.api.get<any>('/advertisements/statistics').subscribe({
      next: (res) => {
        const d = res.data || {};
        this.stats = {
          totalAds: d.totalAds || d.total || 0,
          activeAds: d.activeAds || d.active || 0,
          totalViews: d.totalViews || d.views || 0,
          totalClicks: d.totalClicks || d.clicks || 0,
          ctr: d.ctr || (d.totalViews > 0 ? ((d.totalClicks || 0) / d.totalViews * 100).toFixed(2) : '0.00')
        };
        this.loading = false;
      },
      error: () => { this.stats = {}; this.loading = false; }
    });
  }

  openAddForm(): void {
    this.editingId = '';
    this.adForm = { title: '', advertiserName: '', description: '', placement: '', startDate: '', endDate: '', targetUrl: '' };
    this.formError = '';
    this.showForm = true;
  }

  editAd(ad: any): void {
    this.editingId = ad.id;
    this.adForm = {
      title: ad.title || '',
      advertiserName: ad.advertiserName || '',
      description: ad.description || '',
      placement: ad.placement || '',
      startDate: ad.startDate ? ad.startDate.substring(0, 10) : '',
      endDate: ad.endDate ? ad.endDate.substring(0, 10) : '',
      targetUrl: ad.targetUrl || ''
    };
    this.formError = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = '';
    this.formError = '';
  }

  saveAd(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingId
      ? this.api.put<any>(`/advertisements/${this.editingId}`, this.adForm)
      : this.api.post<any>('/advertisements', this.adForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.editingId = ''; this.loadAds(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save advertisement'; }
    });
  }

  deleteAd(ad: any): void {
    if (confirm(`Delete advertisement "${ad.title}"?`)) {
      this.api.delete<any>(`/advertisements/${ad.id}`).subscribe({
        next: () => { this.loadAds(); },
        error: () => { alert('Failed to delete advertisement'); }
      });
    }
  }
}
