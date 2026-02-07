import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface Society {
  id: string;
  name: string;
  code: string;
  type: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
  totalUnits: number;
  totalBlocks: number;
  createdAt: string;
}

@Component({
  selector: 'app-societies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Societies</h2>
        <div class="header-actions">
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search societies..." class="search-input">
          <button class="btn btn-primary" (click)="showForm = true" *ngIf="!showForm">+ Add Society</button>
        </div>
      </div>

      <!-- Create/Edit Form -->
      <div class="card form-card" *ngIf="showForm">
        <h3>{{ editingId ? 'Edit Society' : 'Register New Society' }}</h3>
        <form (ngSubmit)="saveSociety()">
          <div class="form-grid">
            <div class="form-group">
              <label>Society Name *</label>
              <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Enter society name">
            </div>
            <div class="form-group">
              <label>Code *</label>
              <input type="text" [(ngModel)]="form.code" name="code" required placeholder="e.g. SUNRISE" maxlength="20">
            </div>
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="form.type" name="type">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="mixed">Mixed</option>
                <option value="gated_community">Gated Community</option>
                <option value="township">Township</option>
              </select>
            </div>
            <div class="form-group">
              <label>Address *</label>
              <input type="text" [(ngModel)]="form.address" name="address" required placeholder="Full address">
            </div>
            <div class="form-group">
              <label>City *</label>
              <input type="text" [(ngModel)]="form.city" name="city" required placeholder="City">
            </div>
            <div class="form-group">
              <label>State *</label>
              <input type="text" [(ngModel)]="form.state" name="state" required placeholder="State">
            </div>
            <div class="form-group">
              <label>Pincode *</label>
              <input type="text" [(ngModel)]="form.pincode" name="pincode" required placeholder="Pincode" maxlength="6">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="form.email" name="email" placeholder="Society email">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="text" [(ngModel)]="form.phone" name="phone" placeholder="Contact phone">
            </div>
            <div class="form-group">
              <label>Total Blocks</label>
              <input type="number" [(ngModel)]="form.totalBlocks" name="totalBlocks" placeholder="0">
            </div>
            <div class="form-group">
              <label>Total Units</label>
              <input type="number" [(ngModel)]="form.totalUnits" name="totalUnits" placeholder="0">
            </div>
            <div class="form-group">
              <label>Registration Number</label>
              <input type="text" [(ngModel)]="form.registrationNumber" name="registrationNumber" placeholder="Optional">
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : (editingId ? 'Update' : 'Create Society') }}</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
          <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        </form>
      </div>

      <!-- Societies Table -->
      <div class="card">
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Type</th>
              <th>City</th>
              <th>Blocks</th>
              <th>Units</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td class="name-cell">{{ item.name }}</td>
              <td><span class="code-badge">{{ item.code }}</span></td>
              <td>{{ item.type | titlecase }}</td>
              <td>{{ item.city }}</td>
              <td>{{ item.totalBlocks || 0 }}</td>
              <td>{{ item.totalUnits || 0 }}</td>
              <td>
                <span class="badge" [class.badge-active]="item.isActive" [class.badge-inactive]="!item.isActive">
                  {{ item.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ item.createdAt | date:'mediumDate' }}</td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="editSociety(item)">Edit</button>
                <button class="btn btn-danger btn-sm" *ngIf="item.isActive" (click)="deactivate(item)">Deactivate</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="9" class="empty">No societies found</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" *ngIf="totalPages > 1">
          <button (click)="changePage(page - 1)" [disabled]="page <= 1">Prev</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button (click)="changePage(page + 1)" [disabled]="page >= totalPages">Next</button>
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
    .form-group input, .form-group select {
      padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;
    }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #4fc3f7; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
    .error-msg { color: #f44336; font-size: 13px; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .code-badge { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class SocietiesComponent implements OnInit {
  items: Society[] = [];
  loading = false;
  search = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;
  showForm = false;
  editingId = '';
  saving = false;
  formError = '';

  form: any = this.resetForm();

  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  resetForm() {
    return {
      name: '', code: '', type: 'residential', address: '', city: '', state: '',
      pincode: '', email: '', phone: '', totalBlocks: null, totalUnits: null, registrationNumber: ''
    };
  }

  loadData(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;

    this.api.get<any>('/societies', params).subscribe({
      next: (res) => {
        this.items = res.data?.societies || res.data || [];
        const pagination = res.data?.pagination;
        this.total = pagination?.total || this.items.length;
        this.totalPages = pagination?.pages || Math.ceil(this.total / this.limit);
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 400);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadData();
    }
  }

  saveSociety(): void {
    this.saving = true;
    this.formError = '';
    const payload = { ...this.form };
    if (payload.code) payload.code = payload.code.toUpperCase();

    const req$ = this.editingId
      ? this.api.put<any>(`/societies/${this.editingId}`, payload)
      : this.api.post<any>('/societies', payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.cancelForm();
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err.error?.message || 'Failed to save society';
      }
    });
  }

  editSociety(item: Society): void {
    this.editingId = item.id;
    this.form = {
      name: item.name, code: item.code, type: item.type || 'residential',
      address: '', city: item.city, state: item.state, pincode: item.pincode || '',
      email: '', phone: '', totalBlocks: item.totalBlocks, totalUnits: item.totalUnits,
      registrationNumber: ''
    };
    this.showForm = true;
  }

  deactivate(item: Society): void {
    if (confirm(`Deactivate society "${item.name}"?`)) {
      this.api.delete<any>(`/societies/${item.id}`).subscribe({
        next: () => this.loadData()
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = '';
    this.form = this.resetForm();
    this.formError = '';
  }
}
