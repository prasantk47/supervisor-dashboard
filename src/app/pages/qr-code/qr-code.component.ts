import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface QrCode {
  id: string;
  name: string;
  location: string;
  type: string;
  code: string;
  isActive: boolean;
  scannedCount: number;
  lastScannedAt: string;
  createdAt: string;
}

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>QR Code Management</h2>
        <div class="header-actions">
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search QR codes..." class="search-input">
          <button class="btn btn-primary" (click)="showForm = true" *ngIf="!showForm">+ Generate QR</button>
        </div>
      </div>

      <!-- Generate QR Form -->
      <div class="card form-card" *ngIf="showForm">
        <h3>Generate New QR Code</h3>
        <form (ngSubmit)="generateQr()">
          <div class="form-grid">
            <div class="form-group">
              <label>Name / Label *</label>
              <input type="text" [(ngModel)]="form.name" name="name" required placeholder="e.g. Main Gate Entry">
            </div>
            <div class="form-group">
              <label>Location *</label>
              <input type="text" [(ngModel)]="form.location" name="location" required placeholder="e.g. Block A Entrance">
            </div>
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="form.type" name="type">
                <option value="patrol">Patrol Checkpoint</option>
                <option value="entry">Entry Gate</option>
                <option value="exit">Exit Gate</option>
                <option value="common_area">Common Area</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Generating...' : 'Generate QR Code' }}</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
          <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        </form>
      </div>

      <!-- QR Codes Grid -->
      <div class="card">
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Type</th>
              <th>Scans</th>
              <th>Last Scanned</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td class="name-cell">{{ item.name }}</td>
              <td>{{ item.location }}</td>
              <td><span class="type-badge">{{ item.type }}</span></td>
              <td>{{ item.scannedCount || 0 }}</td>
              <td>{{ item.lastScannedAt ? (item.lastScannedAt | date:'medium') : 'Never' }}</td>
              <td>
                <span class="badge" [class.badge-active]="item.isActive" [class.badge-inactive]="!item.isActive">
                  {{ item.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ item.createdAt | date:'mediumDate' }}</td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="viewScans(item)">Scans</button>
                <button class="btn btn-secondary btn-sm" (click)="updateLocation(item)">Edit</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="8" class="empty">No QR codes found</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" *ngIf="totalPages > 1">
          <button (click)="changePage(page - 1)" [disabled]="page <= 1">Prev</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button (click)="changePage(page + 1)" [disabled]="page >= totalPages">Next</button>
        </div>
      </div>

      <!-- Scan Records Modal -->
      <div class="modal-overlay" *ngIf="showScans" (click)="showScans = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Scan Records - {{ selectedQr?.name }}</h3>
            <button class="close-btn" (click)="showScans = false">&times;</button>
          </div>
          <table>
            <thead>
              <tr><th>Scanned By</th><th>Time</th><th>Location</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let scan of scanRecords">
                <td>{{ scan.scannedBy }}</td>
                <td>{{ scan.scannedAt | date:'medium' }}</td>
                <td>{{ scan.location || '-' }}</td>
              </tr>
              <tr *ngIf="scanRecords.length === 0">
                <td colspan="3" class="empty">No scan records</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { margin: 0; color: #333; }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .search-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; width: 240px; }
    .search-input:focus { outline: none; border-color: #4fc3f7; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
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
    .type-badge { background: #e8eaf6; color: #283593; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 10px; padding: 24px; width: 600px; max-height: 80vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .modal-header h3 { margin: 0; }
    .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }
  `]
})
export class QrCodeComponent implements OnInit {
  items: QrCode[] = [];
  loading = false;
  search = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;
  showForm = false;
  saving = false;
  formError = '';
  showScans = false;
  selectedQr: QrCode | null = null;
  scanRecords: any[] = [];

  form = { name: '', location: '', type: 'patrol' };

  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;
    this.api.get<any>('/qrcode/all', params).subscribe({
      next: (res) => {
        this.items = res.data?.qrcodes || res.data || [];
        this.total = res.data?.total || this.items.length;
        this.totalPages = Math.ceil(this.total / this.limit);
        this.loading = false;
      },
      error: () => { this.items = []; this.loading = false; }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.page = 1; this.loadData(); }, 400);
  }

  changePage(p: number): void {
    if (p >= 1 && p <= this.totalPages) { this.page = p; this.loadData(); }
  }

  generateQr(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/qrcode/generate', this.form).subscribe({
      next: () => { this.saving = false; this.cancelForm(); this.loadData(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to generate QR code'; }
    });
  }

  viewScans(item: QrCode): void {
    this.selectedQr = item;
    this.api.get<any>(`/qrcode/scanned-record`, { qrcodeId: item.id }).subscribe({
      next: (res) => { this.scanRecords = res.data || []; this.showScans = true; },
      error: () => { this.scanRecords = []; this.showScans = true; }
    });
  }

  updateLocation(item: QrCode): void {
    const newLocation = prompt('Update location:', item.location);
    if (newLocation !== null) {
      this.api.put<any>(`/qrcode/updateLocation`, { id: item.id, location: newLocation }).subscribe({
        next: () => this.loadData()
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.form = { name: '', location: '', type: 'patrol' };
    this.formError = '';
  }
}
