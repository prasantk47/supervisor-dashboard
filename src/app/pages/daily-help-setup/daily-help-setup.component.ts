import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface DailyHelpProvider {
  id: string;
  name: string;
  mobileNumber: string;
  localServiceProviderCode: string;
  localServiceId: string;
  categoryName?: string;
  isInside: boolean;
  disabled: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-daily-help-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Daily Help Setup</h2>
        <div class="header-actions">
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search providers..." class="search-input">
          <button class="btn btn-primary" (click)="showForm = true" *ngIf="!showForm">+ Add Provider</button>
        </div>
      </div>

      <!-- Categories Overview -->
      <div class="categories-bar" *ngIf="categories.length > 0">
        <span class="cat-chip" *ngFor="let cat of categories"
              [class.active]="selectedCategory === cat.id"
              (click)="filterByCategory(cat.id)">
          {{ cat.name }}
        </span>
        <span class="cat-chip" [class.active]="!selectedCategory" (click)="filterByCategory('')">All</span>
      </div>

      <!-- Create Form -->
      <div class="card form-card" *ngIf="showForm">
        <h3>{{ editingId ? 'Edit Provider' : 'Add Daily Help Provider' }}</h3>
        <form (ngSubmit)="saveProvider()">
          <div class="form-grid">
            <div class="form-group">
              <label>Provider Name *</label>
              <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Enter name">
            </div>
            <div class="form-group">
              <label>Mobile Number</label>
              <input type="text" [(ngModel)]="form.mobileNumber" name="mobileNumber" placeholder="10-digit mobile" maxlength="10">
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select [(ngModel)]="form.dailyHelpCategory" name="dailyHelpCategory" required>
                <option value="">Select Category</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : (editingId ? 'Update' : 'Add Provider') }}</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
          <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        </form>
      </div>

      <!-- Providers Table -->
      <div class="card">
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Category</th>
              <th>Inside</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td><span class="code-badge">{{ item.localServiceProviderCode }}</span></td>
              <td class="name-cell">{{ item.name }}</td>
              <td>{{ item.mobileNumber || '-' }}</td>
              <td>{{ item.categoryName || '-' }}</td>
              <td>
                <span class="badge" [class.badge-active]="item.isInside" [class.badge-inactive]="!item.isInside">
                  {{ item.isInside ? 'Inside' : 'Outside' }}
                </span>
              </td>
              <td>
                <span class="badge" [class.badge-active]="!item.disabled" [class.badge-inactive]="item.disabled">
                  {{ item.disabled ? 'Disabled' : 'Active' }}
                </span>
              </td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="editProvider(item)">Edit</button>
                <button class="btn btn-danger btn-sm" *ngIf="!item.disabled" (click)="disableProvider(item)">Disable</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="7" class="empty">No daily help providers found</td>
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
    .categories-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .cat-chip {
      padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;
      background: #f0f0f0; color: #555; cursor: pointer; transition: all 0.2s;
    }
    .cat-chip:hover { background: #e0e0e0; }
    .cat-chip.active { background: #1a1a2e; color: #fff; }
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
export class DailyHelpSetupComponent implements OnInit {
  items: DailyHelpProvider[] = [];
  categories: Category[] = [];
  loading = false;
  search = '';
  selectedCategory = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;
  showForm = false;
  editingId = '';
  saving = false;
  formError = '';

  form = { name: '', mobileNumber: '', dailyHelpCategory: '' };

  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadData();
  }

  loadCategories(): void {
    this.api.get<any>('/daily-help/categories').subscribe({
      next: (res) => {
        this.categories = res.data || [];
      }
    });
  }

  loadData(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;
    if (this.selectedCategory) params.categoryId = this.selectedCategory;

    this.api.get<any>('/daily-help', params).subscribe({
      next: (res) => {
        this.items = res.data?.providers || res.data || [];
        this.total = res.data?.total || this.items.length;
        this.totalPages = Math.ceil(this.total / this.limit);
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

  filterByCategory(catId: string): void {
    this.selectedCategory = catId;
    this.page = 1;
    this.loadData();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadData();
    }
  }

  saveProvider(): void {
    this.saving = true;
    this.formError = '';

    const req$ = this.editingId
      ? this.api.put<any>(`/daily-help/${this.editingId}`, this.form)
      : this.api.post<any>('/daily-help', this.form);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.cancelForm();
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err.error?.message || 'Failed to save provider';
      }
    });
  }

  editProvider(item: DailyHelpProvider): void {
    this.editingId = item.id;
    this.form = {
      name: item.name,
      mobileNumber: item.mobileNumber || '',
      dailyHelpCategory: item.localServiceId || ''
    };
    this.showForm = true;
  }

  disableProvider(item: DailyHelpProvider): void {
    if (confirm(`Disable provider "${item.name}"?`)) {
      this.api.delete<any>(`/daily-help/${item.id}`).subscribe({
        next: () => this.loadData()
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = '';
    this.form = { name: '', mobileNumber: '', dailyHelpCategory: '' };
    this.formError = '';
  }
}
