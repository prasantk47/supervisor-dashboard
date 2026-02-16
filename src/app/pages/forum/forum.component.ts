import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Forum</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'posts'" (click)="activeTab = 'posts'; loadPosts()">Posts</button>
        <button class="tab" [class.active]="activeTab === 'categories'" (click)="activeTab = 'categories'; loadCategories()">Categories</button>
      </div>

      <!-- POSTS TAB -->
      <div *ngIf="activeTab === 'posts'">
        <div class="card form-card" *ngIf="showPostForm">
          <h3>{{ editingPostId ? 'Edit Post' : 'Create Post' }}</h3>
          <form (ngSubmit)="savePost()">
            <div class="form-grid">
              <div class="form-group"><label>Title *</label><input type="text" [(ngModel)]="postForm.title" name="ptitle" required placeholder="Post title"></div>
              <div class="form-group"><label>Category *</label>
                <select [(ngModel)]="postForm.categoryId" name="pcategory" required>
                  <option value="">Select Category</option>
                  <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>Tags</label><input type="text" [(ngModel)]="postForm.tags" name="ptags" placeholder="Comma-separated tags"></div>
            </div>
            <div class="form-group" style="margin-top: 12px;">
              <label>Content *</label>
              <textarea [(ngModel)]="postForm.content" name="pcontent" required placeholder="Write post content..." rows="5" class="textarea"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelPostForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Filters -->
        <div class="filter-bar">
          <div class="filter-group">
            <label>Category</label>
            <select [(ngModel)]="filterCategory" name="fcat" (change)="loadPosts()">
              <option value="">All Categories</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Status</label>
            <select [(ngModel)]="filterStatus" name="fstatus" (change)="loadPosts()">
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Forum Posts</span><button class="btn btn-primary btn-sm" (click)="openPostForm()" *ngIf="!showPostForm">+ Create Post</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Title</th><th>Author</th><th>Category</th><th>Views</th><th>Likes</th><th>Comments</th><th>Status</th><th>Pinned</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of posts">
                <td class="name-cell">{{ p.title }}</td>
                <td>{{ p.authorName || p.author?.name || '-' }}</td>
                <td>{{ p.categoryName || p.category?.name || '-' }}</td>
                <td>{{ p.views || 0 }}</td>
                <td>{{ p.likes || 0 }}</td>
                <td>{{ p.commentsCount || p.comments?.length || 0 }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="p.status === 'published'"
                    [class.badge-inactive]="p.status === 'hidden'"
                    [class.badge-flagged]="p.status === 'flagged'">
                    {{ p.status || 'published' }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class.badge-active]="p.pinned" [class.badge-inactive]="!p.pinned">{{ p.pinned ? 'Yes' : 'No' }}</span>
                </td>
                <td>{{ p.createdAt ? (p.createdAt | date:'mediumDate') : '-' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="viewPost(p)">View</button>
                  <button class="btn btn-secondary btn-sm" (click)="editPost(p)">Edit</button>
                  <button class="btn btn-secondary btn-sm" (click)="togglePin(p)">{{ p.pinned ? 'Unpin' : 'Pin' }}</button>
                  <button class="btn btn-secondary btn-sm" (click)="toggleLock(p)">{{ p.locked ? 'Unlock' : 'Lock' }}</button>
                  <button class="btn btn-danger btn-sm" (click)="deletePost(p)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="posts.length === 0"><td colspan="10" class="empty">No posts found</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Post Detail Modal -->
        <div class="modal-overlay" *ngIf="selectedPost" (click)="selectedPost = null">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ selectedPost.title }}</h3>
              <button class="btn btn-secondary btn-sm" (click)="selectedPost = null">Close</button>
            </div>
            <div class="modal-body">
              <div class="detail-row"><strong>Author:</strong> {{ selectedPost.authorName || selectedPost.author?.name || '-' }}</div>
              <div class="detail-row"><strong>Category:</strong> {{ selectedPost.categoryName || selectedPost.category?.name || '-' }}</div>
              <div class="detail-row"><strong>Status:</strong> {{ selectedPost.status || 'published' }}</div>
              <div class="detail-row"><strong>Views:</strong> {{ selectedPost.views || 0 }} | <strong>Likes:</strong> {{ selectedPost.likes || 0 }} | <strong>Comments:</strong> {{ selectedPost.commentsCount || 0 }}</div>
              <div class="detail-row"><strong>Pinned:</strong> {{ selectedPost.pinned ? 'Yes' : 'No' }} | <strong>Locked:</strong> {{ selectedPost.locked ? 'Yes' : 'No' }}</div>
              <div class="detail-row"><strong>Tags:</strong> {{ selectedPost.tags || '-' }}</div>
              <div class="detail-row" style="margin-top: 12px;"><strong>Content:</strong></div>
              <div class="content-block">{{ selectedPost.content || '-' }}</div>
              <div class="detail-row"><strong>Created:</strong> {{ selectedPost.createdAt ? (selectedPost.createdAt | date:'medium') : '-' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CATEGORIES TAB -->
      <div *ngIf="activeTab === 'categories'">
        <div class="card">
          <div class="card-header"><span>Forum Categories</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr><th>Name</th><th>Description</th><th>Icon</th><th>Posts Count</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of categories">
                <td class="name-cell">{{ c.name }}</td>
                <td>{{ c.description || '-' }}</td>
                <td>{{ c.icon || '-' }}</td>
                <td>{{ c.postsCount || c.postCount || 0 }}</td>
                <td>
                  <span class="badge" [class.badge-active]="!c.disabled && c.status !== 'inactive'" [class.badge-inactive]="c.disabled || c.status === 'inactive'">
                    {{ c.disabled || c.status === 'inactive' ? 'Inactive' : 'Active' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="categories.length === 0"><td colspan="5" class="empty">No categories found</td></tr>
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
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #333; }
    .form-card { margin-bottom: 16px; }
    .form-card h3 { margin: 0 0 16px; color: #333; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-group input, .form-group select, .form-group textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #4fc3f7; }
    .textarea { resize: vertical; font-family: inherit; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
    .error-msg { color: #f44336; font-size: 13px; margin-top: 8px; }
    .filter-bar { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; }
    .filter-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .filter-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .filter-group select:focus { outline: none; border-color: #4fc3f7; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active, .badge-completed { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-flagged { background: #fce4ec; color: #c62828; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-card { background: #fff; border-radius: 10px; padding: 24px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .modal-header h3 { margin: 0; color: #333; }
    .modal-body { font-size: 13px; color: #555; }
    .detail-row { margin-bottom: 8px; }
    .detail-row strong { color: #333; }
    .content-block { background: #f9f9f9; padding: 12px; border-radius: 6px; margin-top: 4px; white-space: pre-wrap; line-height: 1.6; }
  `]
})
export class ForumComponent implements OnInit {
  activeTab = 'posts';
  loading = false;
  saving = false;
  formError = '';

  posts: any[] = [];
  categories: any[] = [];

  filterCategory = '';
  filterStatus = '';

  showPostForm = false;
  editingPostId = '';
  postForm = { title: '', content: '', categoryId: '', tags: '' };

  selectedPost: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterCategory) params.categoryId = this.filterCategory;
    if (this.filterStatus) params.status = this.filterStatus;
    this.api.get<any>('/forum', params).subscribe({
      next: (res) => { this.posts = res.data?.posts || res.data || []; this.loading = false; },
      error: () => { this.posts = []; this.loading = false; }
    });
  }

  loadCategories(): void {
    this.api.get<any>('/forum/categories').subscribe({
      next: (res) => { this.categories = res.data?.categories || res.data || []; },
      error: () => { this.categories = []; }
    });
  }

  openPostForm(): void {
    this.editingPostId = '';
    this.postForm = { title: '', content: '', categoryId: '', tags: '' };
    this.formError = '';
    this.showPostForm = true;
  }

  cancelPostForm(): void {
    this.showPostForm = false;
    this.editingPostId = '';
    this.formError = '';
  }

  savePost(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingPostId
      ? this.api.put<any>(`/forum/${this.editingPostId}`, this.postForm)
      : this.api.post<any>('/forum', this.postForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showPostForm = false; this.editingPostId = ''; this.loadPosts(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save post'; }
    });
  }

  editPost(p: any): void {
    this.editingPostId = p.id;
    this.postForm = { title: p.title || '', content: p.content || '', categoryId: p.categoryId || '', tags: p.tags || '' };
    this.formError = '';
    this.showPostForm = true;
  }

  viewPost(p: any): void {
    this.api.get<any>(`/forum/${p.id}`).subscribe({
      next: (res) => { this.selectedPost = res.data || p; },
      error: () => { this.selectedPost = p; }
    });
  }

  deletePost(p: any): void {
    if (confirm(`Delete post "${p.title}"?`)) {
      this.api.delete<any>(`/forum/${p.id}`).subscribe({
        next: () => this.loadPosts(),
        error: () => {}
      });
    }
  }

  togglePin(p: any): void {
    this.api.put<any>(`/forum/${p.id}/pin`, {}).subscribe({
      next: () => this.loadPosts(),
      error: () => {}
    });
  }

  toggleLock(p: any): void {
    this.api.put<any>(`/forum/${p.id}/lock`, {}).subscribe({
      next: () => this.loadPosts(),
      error: () => {}
    });
  }
}
