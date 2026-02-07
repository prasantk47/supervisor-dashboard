import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface EmergencyCategory {
  id: string;
  name: string;
  icon: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  alternatePhone: string;
  categoryId: string;
  categoryName: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-emergency-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Emergency Contacts</h2>
        <div class="header-actions">
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search contacts..." class="search-input">
          <button class="btn btn-secondary" (click)="showCatForm = true" *ngIf="!showCatForm && !showForm">+ Category</button>
          <button class="btn btn-primary" (click)="showForm = true" *ngIf="!showForm && !showCatForm">+ Add Contact</button>
        </div>
      </div>

      <!-- Category Form -->
      <div class="card form-card" *ngIf="showCatForm">
        <h3>{{ editingCatId ? 'Edit Category' : 'Add Category' }}</h3>
        <form (ngSubmit)="saveCategory()">
          <div class="form-grid">
            <div class="form-group">
              <label>Category Name *</label>
              <input type="text" [(ngModel)]="catForm.name" name="catName" required placeholder="e.g. Hospital, Fire Station">
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
            <button type="button" class="btn btn-secondary" (click)="cancelCatForm()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Categories Bar -->
      <div class="categories-bar" *ngIf="categories.length > 0">
        <span class="cat-chip" [class.active]="!selectedCategory" (click)="filterByCategory('')">All</span>
        <span class="cat-chip" *ngFor="let cat of categories"
              [class.active]="selectedCategory === cat.id"
              (click)="filterByCategory(cat.id)">
          {{ cat.name }}
          <button class="cat-edit" (click)="editCategory(cat); $event.stopPropagation()">&#9998;</button>
        </span>
      </div>

      <!-- Contact Form -->
      <div class="card form-card" *ngIf="showForm">
        <h3>{{ editingId ? 'Edit Contact' : 'Add Emergency Contact' }}</h3>
        <form (ngSubmit)="saveContact()">
          <div class="form-grid">
            <div class="form-group">
              <label>Name *</label>
              <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Contact name">
            </div>
            <div class="form-group">
              <label>Phone *</label>
              <input type="text" [(ngModel)]="form.phone" name="phone" required placeholder="Phone number" maxlength="10">
            </div>
            <div class="form-group">
              <label>Alternate Phone</label>
              <input type="text" [(ngModel)]="form.alternatePhone" name="altPhone" placeholder="Optional" maxlength="10">
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select [(ngModel)]="form.categoryId" name="categoryId" required>
                <option value="">Select Category</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Address</label>
              <input type="text" [(ngModel)]="form.address" name="address" placeholder="Full address">
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : (editingId ? 'Update' : 'Add Contact') }}</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
          <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        </form>
      </div>

      <!-- Contacts Table -->
      <div class="card">
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Alt. Phone</th>
              <th>Category</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td class="name-cell">{{ item.name }}</td>
              <td>{{ item.phone }}</td>
              <td>{{ item.alternatePhone || '-' }}</td>
              <td><span class="type-badge">{{ item.categoryName || '-' }}</span></td>
              <td>{{ item.address || '-' }}</td>
              <td>
                <span class="badge" [class.badge-active]="item.isActive" [class.badge-inactive]="!item.isActive">
                  {{ item.isActive !== false ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="editContact(item)">Edit</button>
                <button class="btn btn-danger btn-sm" (click)="deleteContact(item)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="7" class="empty">No emergency contacts found</td>
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
    .cat-chip { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #f0f0f0; color: #555; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
    .cat-chip:hover { background: #e0e0e0; }
    .cat-chip.active { background: #1a1a2e; color: #fff; }
    .cat-edit { background: none; border: none; cursor: pointer; font-size: 12px; color: inherit; padding: 0; }
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
    .type-badge { background: #fce4ec; color: #c62828; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
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
export class EmergencyContactsComponent implements OnInit {
  items: EmergencyContact[] = [];
  categories: EmergencyCategory[] = [];
  loading = false;
  search = '';
  selectedCategory = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;
  showForm = false;
  showCatForm = false;
  editingId = '';
  editingCatId = '';
  saving = false;
  formError = '';

  form = { name: '', phone: '', alternatePhone: '', categoryId: '', address: '' };
  catForm = { name: '' };
  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadCategories(); this.loadData(); }

  loadCategories(): void {
    this.api.get<any>('/emergency-contact/category').subscribe({
      next: (res) => { this.categories = res.data || []; }
    });
  }

  loadData(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;
    if (this.selectedCategory) params.categoryId = this.selectedCategory;
    this.api.get<any>('/emergency-contact', params).subscribe({
      next: (res) => {
        this.items = res.data?.contacts || res.data || [];
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

  filterByCategory(id: string): void { this.selectedCategory = id; this.page = 1; this.loadData(); }

  changePage(p: number): void { if (p >= 1 && p <= this.totalPages) { this.page = p; this.loadData(); } }

  saveCategory(): void {
    this.saving = true;
    const req$ = this.editingCatId
      ? this.api.put<any>(`/emergency-contact/category`, { id: this.editingCatId, ...this.catForm })
      : this.api.post<any>('/emergency-contact/category', this.catForm);
    req$.subscribe({
      next: () => { this.saving = false; this.cancelCatForm(); this.loadCategories(); },
      error: () => { this.saving = false; }
    });
  }

  editCategory(cat: EmergencyCategory): void {
    this.editingCatId = cat.id;
    this.catForm = { name: cat.name };
    this.showCatForm = true;
  }

  cancelCatForm(): void { this.showCatForm = false; this.editingCatId = ''; this.catForm = { name: '' }; }

  saveContact(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingId
      ? this.api.put<any>(`/emergency-contact`, { id: this.editingId, ...this.form })
      : this.api.post<any>('/emergency-contact', this.form);
    req$.subscribe({
      next: () => { this.saving = false; this.cancelForm(); this.loadData(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save contact'; }
    });
  }

  editContact(item: EmergencyContact): void {
    this.editingId = item.id;
    this.form = { name: item.name, phone: item.phone, alternatePhone: item.alternatePhone || '', categoryId: item.categoryId || '', address: item.address || '' };
    this.showForm = true;
  }

  deleteContact(item: EmergencyContact): void {
    if (confirm(`Delete contact "${item.name}"?`)) {
      this.api.delete<any>(`/emergency-contact/${item.id}`).subscribe({ next: () => this.loadData() });
    }
  }

  cancelForm(): void { this.showForm = false; this.editingId = ''; this.form = { name: '', phone: '', alternatePhone: '', categoryId: '', address: '' }; this.formError = ''; }
}
