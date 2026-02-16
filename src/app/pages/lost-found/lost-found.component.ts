import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-lost-found',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Lost &amp; Found</h2>
      </div>

      <!-- Post Item Form -->
      <div class="card form-card" *ngIf="showForm">
        <h3>Post Item</h3>
        <form (ngSubmit)="postItem()">
          <div class="form-grid">
            <div class="form-group"><label>Title *</label><input type="text" [(ngModel)]="itemForm.title" name="title" required placeholder="Item title"></div>
            <div class="form-group"><label>Type *</label>
              <select [(ngModel)]="itemForm.itemType" name="itemType" required>
                <option value="">Select Type</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
            <div class="form-group"><label>Category *</label><input type="text" [(ngModel)]="itemForm.category" name="category" required placeholder="e.g. Electronics, Keys, Documents"></div>
            <div class="form-group"><label>Description</label><input type="text" [(ngModel)]="itemForm.description" name="description" placeholder="Describe the item"></div>
            <div class="form-group"><label>Location</label><input type="text" [(ngModel)]="itemForm.location" name="location" placeholder="Where was it lost/found?"></div>
            <div class="form-group"><label>Contact Info</label><input type="text" [(ngModel)]="itemForm.contactInfo" name="contactInfo" placeholder="Phone or email"></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
            <button type="button" class="btn btn-secondary" (click)="showForm = false">Cancel</button>
          </div>
          <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        </form>
      </div>

      <!-- Items List -->
      <div class="card">
        <div class="card-header"><span>Items</span><button class="btn btn-primary btn-sm" (click)="openForm()" *ngIf="!showForm">+ Post Item</button></div>
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Title</th><th>Type</th><th>Category</th><th>Description</th><th>Location</th><th>Posted By</th><th>Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td class="name-cell">{{ item.title || '-' }}</td>
              <td>
                <span class="badge"
                  [class.badge-lost]="item.itemType === 'lost'"
                  [class.badge-found]="item.itemType === 'found'">
                  {{ item.itemType || '-' }}
                </span>
              </td>
              <td>{{ item.category || '-' }}</td>
              <td>{{ item.description || '-' }}</td>
              <td>{{ item.location || '-' }}</td>
              <td>{{ item.postedBy || item.postedByName || '-' }}</td>
              <td>{{ item.createdAt ? (item.createdAt | date:'mediumDate') : '-' }}</td>
              <td>
                <span class="badge"
                  [class.badge-active]="item.status === 'active'"
                  [class.badge-pending]="item.status === 'claimed'"
                  [class.badge-completed]="item.status === 'resolved'">
                  {{ item.status || 'active' }}
                </span>
              </td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="claimItem(item)" *ngIf="item.status === 'active'">Claim</button>
                <button class="btn btn-secondary btn-sm" (click)="resolveItem(item)" *ngIf="item.status === 'active' || item.status === 'claimed'">Resolve</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0"><td colspan="9" class="empty">No items found</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { margin: 0; color: #333; }
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
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-completed { background: #e3f2fd; color: #1565c0; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-lost { background: #ffebee; color: #c62828; }
    .badge-found { background: #e8f5e9; color: #2e7d32; }
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
export class LostFoundComponent implements OnInit {
  loading = false;
  saving = false;
  showForm = false;
  formError = '';

  items: any[] = [];

  itemForm = {
    title: '',
    itemType: '',
    category: '',
    description: '',
    location: '',
    contactInfo: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.api.get<any>('/community/lost-found').subscribe({
      next: (res) => { this.items = res.data?.items || res.data || []; this.loading = false; },
      error: () => { this.items = []; this.loading = false; }
    });
  }

  openForm(): void {
    this.itemForm = { title: '', itemType: '', category: '', description: '', location: '', contactInfo: '' };
    this.formError = '';
    this.showForm = true;
  }

  postItem(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/community/lost-found', this.itemForm).subscribe({
      next: () => { this.saving = false; this.showForm = false; this.loadItems(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to post item'; }
    });
  }

  claimItem(item: any): void {
    this.api.post<any>(`/community/lost-found/${item.id}/claim`, {}).subscribe({
      next: () => this.loadItems(),
      error: (err) => { alert(err.error?.message || 'Failed to claim item'); }
    });
  }

  resolveItem(item: any): void {
    if (confirm(`Mark "${item.title}" as resolved?`)) {
      this.api.put<any>(`/community/lost-found/${item.id}/resolve`, {}).subscribe({
        next: () => this.loadItems(),
        error: (err) => { alert(err.error?.message || 'Failed to resolve item'); }
      });
    }
  }
}
