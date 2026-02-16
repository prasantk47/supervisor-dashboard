import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-group-discussion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Group Discussions</h2>
      </div>

      <!-- Statistics -->
      <div class="stats-row" *ngIf="statistics">
        <div class="stat-card">
          <div class="stat-value">{{ statistics.totalDiscussions || 0 }}</div>
          <div class="stat-label">Total Discussions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statistics.activeDiscussions || 0 }}</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statistics.totalComments || 0 }}</div>
          <div class="stat-label">Total Comments</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statistics.totalViews || 0 }}</div>
          <div class="stat-label">Total Views</div>
        </div>
      </div>

      <!-- Create / Edit Discussion Form -->
      <div class="card form-card" *ngIf="showForm">
        <h3>{{ editingId ? 'Edit Discussion' : 'Create Discussion' }}</h3>
        <form (ngSubmit)="saveDiscussion()">
          <div class="form-grid">
            <div class="form-group">
              <label>Title *</label>
              <input type="text" [(ngModel)]="form.title" name="title" required placeholder="Discussion title">
            </div>
            <div class="form-group">
              <label>Category *</label>
              <input type="text" [(ngModel)]="form.category" name="category" required placeholder="e.g. General, Maintenance, Events">
            </div>
          </div>
          <div class="form-group" style="margin-top: 12px;">
            <label>Content *</label>
            <textarea [(ngModel)]="form.content" name="content" required placeholder="Write your discussion content here..." rows="4"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
          <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        </form>
      </div>

      <!-- Filters -->
      <div class="card filter-card">
        <div class="form-grid">
          <div class="form-group">
            <label>Search</label>
            <input type="text" [(ngModel)]="filters.search" name="fsearch" placeholder="Search by title or author" (keyup.enter)="loadDiscussions()">
          </div>
          <div class="form-group">
            <label>Category</label>
            <input type="text" [(ngModel)]="filters.category" name="fcategory" placeholder="Filter by category" (keyup.enter)="loadDiscussions()">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="filters.status" name="fstatus" (change)="loadDiscussions()">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary btn-sm" (click)="loadDiscussions()">Search</button>
          <button class="btn btn-secondary btn-sm" (click)="resetFilters()">Reset</button>
        </div>
      </div>

      <!-- Discussions Table -->
      <div class="card">
        <div class="card-header">
          <span>Discussions</span>
          <button class="btn btn-primary btn-sm" (click)="openCreateForm()" *ngIf="!showForm">+ New Discussion</button>
        </div>
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Comments</th>
              <th>Views</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of discussions">
              <td class="name-cell">{{ d.title }}</td>
              <td>{{ d.authorName || d.author || '-' }}</td>
              <td>{{ d.category || '-' }}</td>
              <td>{{ d.commentCount || d.comments || 0 }}</td>
              <td>{{ d.viewCount || d.views || 0 }}</td>
              <td>
                <span class="badge"
                  [class.badge-active]="d.status === 'active'"
                  [class.badge-inactive]="d.status === 'closed'"
                  [class.badge-flagged]="d.status === 'flagged'">
                  {{ d.status || 'active' }}
                </span>
              </td>
              <td>{{ d.createdAt ? (d.createdAt | date:'mediumDate') : '-' }}</td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="editDiscussion(d)">Edit</button>
                <button class="btn btn-secondary btn-sm" (click)="toggleComments(d)">{{ d._showComments ? 'Hide' : 'Comments' }}</button>
                <button class="btn btn-danger btn-sm" (click)="deleteDiscussion(d)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="discussions.length === 0">
              <td colspan="8" class="empty">No discussions found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Comments Modal/Inline -->
      <div class="card comments-card" *ngIf="selectedDiscussion">
        <div class="card-header">
          <span>Comments for "{{ selectedDiscussion.title }}"</span>
          <button class="btn btn-secondary btn-sm" (click)="selectedDiscussion = null; comments = []">Close</button>
        </div>
        <div class="loading" *ngIf="loadingComments">Loading comments...</div>
        <div *ngIf="!loadingComments">
          <div class="comment-item" *ngFor="let c of comments">
            <div class="comment-header">
              <span class="comment-author">{{ c.authorName || c.author || 'Anonymous' }}</span>
              <span class="comment-date">{{ c.createdAt ? (c.createdAt | date:'medium') : '' }}</span>
            </div>
            <div class="comment-body">{{ c.content }}</div>
          </div>
          <div class="empty" *ngIf="comments.length === 0" style="padding: 20px;">No comments yet</div>
        </div>

        <!-- Add Comment -->
        <div class="add-comment">
          <h4>Add Comment</h4>
          <div class="form-group">
            <textarea [(ngModel)]="commentContent" name="commentContent" placeholder="Write your comment..." rows="3"></textarea>
          </div>
          <button class="btn btn-primary btn-sm" (click)="addComment()" [disabled]="savingComment || !commentContent.trim()">
            {{ savingComment ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { margin: 0; color: #333; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1a1a2e; }
    .stat-label { font-size: 12px; color: #888; margin-top: 4px; text-transform: uppercase; font-weight: 600; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #333; }
    .form-card { margin-bottom: 16px; }
    .form-card h3 { margin: 0 0 16px; color: #333; }
    .filter-card { margin-bottom: 16px; }
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
    .badge-flagged { background: #fff3e0; color: #e65100; }
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
    .comments-card { margin-top: 16px; }
    .comment-item { padding: 12px; border-bottom: 1px solid #f0f0f0; }
    .comment-item:last-child { border-bottom: none; }
    .comment-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .comment-author { font-weight: 600; font-size: 13px; color: #333; }
    .comment-date { font-size: 11px; color: #999; }
    .comment-body { font-size: 13px; color: #555; line-height: 1.5; }
    .add-comment { border-top: 1px solid #eee; padding-top: 16px; margin-top: 12px; }
    .add-comment h4 { margin: 0 0 8px; font-size: 14px; color: #333; }
  `]
})
export class GroupDiscussionComponent implements OnInit {
  loading = false;
  saving = false;
  savingComment = false;
  loadingComments = false;
  formError = '';
  showForm = false;
  editingId = '';

  discussions: any[] = [];
  comments: any[] = [];
  statistics: any = null;
  selectedDiscussion: any = null;
  commentContent = '';

  filters = { search: '', category: '', status: '' };
  form = { title: '', content: '', category: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDiscussions();
    this.loadStatistics();
  }

  loadDiscussions(): void {
    this.loading = true;
    const params: any = {};
    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.category) params.category = this.filters.category;
    if (this.filters.status) params.status = this.filters.status;
    this.api.get<any>('/group-discussions', params).subscribe({
      next: (res) => { this.discussions = res.data?.discussions || res.data || []; this.loading = false; },
      error: () => { this.discussions = []; this.loading = false; }
    });
  }

  loadStatistics(): void {
    this.api.get<any>('/group-discussions/statistics').subscribe({
      next: (res) => { this.statistics = res.data || {}; },
      error: () => { this.statistics = null; }
    });
  }

  openCreateForm(): void {
    this.editingId = '';
    this.form = { title: '', content: '', category: '' };
    this.formError = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = '';
    this.formError = '';
  }

  saveDiscussion(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingId
      ? this.api.put<any>(`/group-discussions/${this.editingId}`, this.form)
      : this.api.post<any>('/group-discussions', this.form);
    req$.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.editingId = ''; this.loadDiscussions(); this.loadStatistics(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save discussion'; }
    });
  }

  editDiscussion(d: any): void {
    this.editingId = d.id || d._id;
    this.form = { title: d.title, content: d.content || '', category: d.category || '' };
    this.formError = '';
    this.showForm = true;
  }

  deleteDiscussion(d: any): void {
    if (confirm(`Delete discussion "${d.title}"?`)) {
      this.api.delete<any>(`/group-discussions/${d.id || d._id}`).subscribe({
        next: () => { this.loadDiscussions(); this.loadStatistics(); },
        error: () => {}
      });
    }
  }

  toggleComments(d: any): void {
    if (this.selectedDiscussion && (this.selectedDiscussion.id || this.selectedDiscussion._id) === (d.id || d._id)) {
      this.selectedDiscussion = null;
      this.comments = [];
      d._showComments = false;
      return;
    }
    this.discussions.forEach(disc => disc._showComments = false);
    d._showComments = true;
    this.selectedDiscussion = d;
    this.commentContent = '';
    this.loadComments(d.id || d._id);
  }

  loadComments(discussionId: string): void {
    this.loadingComments = true;
    this.api.get<any>(`/group-discussions/${discussionId}/comments`).subscribe({
      next: (res) => { this.comments = res.data?.comments || res.data || []; this.loadingComments = false; },
      error: () => { this.comments = []; this.loadingComments = false; }
    });
  }

  addComment(): void {
    if (!this.commentContent.trim() || !this.selectedDiscussion) return;
    this.savingComment = true;
    const discussionId = this.selectedDiscussion.id || this.selectedDiscussion._id;
    this.api.post<any>(`/group-discussions/${discussionId}/comments`, { content: this.commentContent }).subscribe({
      next: () => {
        this.savingComment = false;
        this.commentContent = '';
        this.loadComments(discussionId);
        this.loadDiscussions();
      },
      error: () => { this.savingComment = false; }
    });
  }

  resetFilters(): void {
    this.filters = { search: '', category: '', status: '' };
    this.loadDiscussions();
  }
}
