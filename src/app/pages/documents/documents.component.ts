import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Document Management</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'; loadDocuments()">Documents</button>
        <button class="tab" [class.active]="activeTab === 'categories'" (click)="activeTab = 'categories'; loadCategories()">Categories</button>
      </div>

      <!-- DOCUMENTS TAB -->
      <div *ngIf="activeTab === 'documents'">
        <div class="card form-card" *ngIf="showUploadForm">
          <h3>Upload Document</h3>
          <form (ngSubmit)="uploadDocument()">
            <div class="form-grid">
              <div class="form-group"><label>Title *</label><input type="text" [(ngModel)]="docForm.title" name="dtitle" required placeholder="Document title"></div>
              <div class="form-group"><label>Category *</label>
                <select [(ngModel)]="docForm.categoryId" name="dcategory" required>
                  <option value="">Select Category</option>
                  <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>Description</label><input type="text" [(ngModel)]="docForm.description" name="ddesc" placeholder="Optional description"></div>
              <div class="form-group"><label>File *</label>
                <input type="file" (change)="onFileSelected($event)" name="dfile" class="file-input">
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Upload</button>
              <button type="button" class="btn btn-secondary" (click)="cancelUploadForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Filter by category -->
        <div class="categories-bar" *ngIf="categories.length > 0">
          <span class="cat-chip" [class.active]="!selectedCategory" (click)="selectedCategory = ''; loadDocuments()">All</span>
          <span class="cat-chip" *ngFor="let c of categories" [class.active]="selectedCategory === c.id" (click)="selectedCategory = c.id; loadDocuments()">{{ c.name }}</span>
        </div>

        <div class="card">
          <div class="card-header"><span>Documents</span><button class="btn btn-primary btn-sm" (click)="openUploadForm()" *ngIf="!showUploadForm">+ Upload Document</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Category</th><th>Folder</th><th>Size</th><th>Uploaded By</th><th>Shared</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let d of documents">
                <td class="name-cell">{{ d.title || d.name || '-' }}</td>
                <td>{{ d.categoryName || d.category || '-' }}</td>
                <td>{{ d.folderName || d.folder || '-' }}</td>
                <td>{{ formatFileSize(d.size) }}</td>
                <td>{{ d.uploadedBy || d.createdByName || '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="d.isShared" [class.badge-pending]="!d.isShared">
                    {{ d.isShared ? 'Shared' : 'Private' }}
                  </span>
                </td>
                <td>{{ d.createdAt ? (d.createdAt | date:'mediumDate') : '-' }}</td>
                <td class="actions-cell">
                  <button class="btn btn-primary btn-sm" (click)="downloadDocument(d)">Download</button>
                  <button class="btn btn-sm btn-success" *ngIf="!d.isShared" (click)="shareDocument(d)">Share</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteDocument(d)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="documents.length === 0"><td colspan="8" class="empty">No documents found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CATEGORIES TAB -->
      <div *ngIf="activeTab === 'categories'">
        <div class="card">
          <div class="card-header"><span>Document Categories</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Document Count</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of categories">
                <td class="name-cell">{{ c.name }}</td>
                <td>{{ c.documentCount || 0 }}</td>
              </tr>
              <tr *ngIf="categories.length === 0"><td colspan="2" class="empty">No categories found</td></tr>
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
    .file-input { padding: 6px 0; border: none; }
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
    .actions-cell { white-space: nowrap; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-success { background: #4caf50; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class DocumentsComponent implements OnInit {
  activeTab = 'documents';
  loading = false;
  saving = false;
  formError = '';
  selectedCategory = '';

  documents: any[] = [];
  categories: any[] = [];
  selectedFile: File | null = null;

  showUploadForm = false;
  docForm = { title: '', categoryId: '', description: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.loadCategories();
  }

  loadDocuments(): void {
    this.loading = true;
    const params: any = {};
    if (this.selectedCategory) params.categoryId = this.selectedCategory;
    this.api.get<any>('/documents', params).subscribe({
      next: (res) => { this.documents = res.data?.documents || res.data || []; this.loading = false; },
      error: () => { this.documents = []; this.loading = false; }
    });
  }

  loadCategories(): void {
    this.api.get<any>('/documents/categories').subscribe({
      next: (res) => { this.categories = res.data?.categories || res.data || []; if (this.activeTab === 'categories') this.loading = false; },
      error: () => { this.categories = []; if (this.activeTab === 'categories') this.loading = false; }
    });
  }

  openUploadForm(): void {
    this.docForm = { title: '', categoryId: '', description: '' };
    this.selectedFile = null;
    this.formError = '';
    this.showUploadForm = true;
  }

  cancelUploadForm(): void {
    this.showUploadForm = false;
    this.formError = '';
  }

  onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadDocument(): void {
    this.saving = true;
    this.formError = '';

    const formData = new FormData();
    formData.append('title', this.docForm.title);
    formData.append('categoryId', this.docForm.categoryId);
    if (this.docForm.description) formData.append('description', this.docForm.description);
    if (this.selectedFile) formData.append('file', this.selectedFile);

    this.api.post<any>('/documents', formData).subscribe({
      next: () => { this.saving = false; this.showUploadForm = false; this.loadDocuments(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to upload document'; }
    });
  }

  downloadDocument(d: any): void {
    this.api.get<any>(`/documents/${d.id}/download`).subscribe({
      next: (res) => {
        const url = res.data?.url || res.data;
        if (url) window.open(url, '_blank');
      }
    });
  }

  shareDocument(d: any): void {
    this.api.post<any>(`/documents/${d.id}/share`, {}).subscribe({
      next: () => this.loadDocuments()
    });
  }

  deleteDocument(d: any): void {
    if (confirm(`Are you sure you want to delete "${d.title || d.name}"? This action cannot be undone.`)) {
      this.api.delete<any>(`/documents/${d.id}`).subscribe({
        next: () => this.loadDocuments()
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
