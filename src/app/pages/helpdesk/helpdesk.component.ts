import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-helpdesk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Helpdesk</h2>
        <div class="header-actions">
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search tickets..." class="search-input">
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'tickets'" (click)="activeTab = 'tickets'; loadData()">Tickets</button>
        <button class="tab" [class.active]="activeTab === 'faq'" (click)="activeTab = 'faq'; loadFAQs()">FAQ</button>
      </div>

      <!-- TICKETS TAB -->
      <div *ngIf="activeTab === 'tickets'">
        <div class="card">
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Submitted By</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items">
                <td>{{ item.title || item.subject || item.message?.slice(0, 50) || '-' }}</td>
                <td><span class="badge" [ngClass]="'badge-' + item.status">{{ item.status }}</span></td>
                <td><span class="badge" [ngClass]="'badge-priority-' + item.priority">{{ item.priority || 'medium' }}</span></td>
                <td>{{ item.user?.firstName || '' }} {{ item.user?.lastName || '' }}</td>
                <td>{{ item.createdAt | date:'mediumDate' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" *ngIf="item.status === 'open' || item.status === 'pending'" (click)="assign(item)">Assign</button>
                  <button class="btn btn-success btn-sm" *ngIf="item.status !== 'resolved' && item.status !== 'closed'" (click)="resolve(item)">Resolve</button>
                </td>
              </tr>
              <tr *ngIf="items.length === 0">
                <td colspan="6" class="empty">No tickets found</td>
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

      <!-- FAQ TAB -->
      <div *ngIf="activeTab === 'faq'">
        <!-- Add FAQ Form -->
        <div class="card form-card" *ngIf="showFAQForm">
          <h3>{{ editingFAQId ? 'Edit FAQ' : 'Add FAQ' }}</h3>
          <form (ngSubmit)="saveFAQ()">
            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="faqForm.category" name="faqcat">
                <option value="">Select Category</option>
                <option value="general">General</option>
                <option value="billing">Billing</option>
                <option value="maintenance">Maintenance</option>
                <option value="amenities">Amenities</option>
                <option value="parking">Parking</option>
                <option value="security">Security</option>
                <option value="visitors">Visitors</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Question *</label>
              <input type="text" [(ngModel)]="faqForm.question" name="faqq" required placeholder="Enter the question">
            </div>
            <div class="form-group">
              <label>Answer *</label>
              <textarea [(ngModel)]="faqForm.answer" name="faqa" required rows="3" placeholder="Enter the answer"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">{{ editingFAQId ? 'Update' : 'Save' }}</button>
              <button type="button" class="btn btn-secondary" (click)="cancelFAQForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <span>Frequently Asked Questions</span>
            <button class="btn btn-primary btn-sm" (click)="openFAQForm()" *ngIf="!showFAQForm">+ Add FAQ</button>
          </div>
          <div class="loading" *ngIf="loadingFAQs">Loading...</div>
          <div class="faq-list" *ngIf="!loadingFAQs">
            <div class="faq-item" *ngFor="let faq of faqs">
              <div class="faq-header" (click)="faq._expanded = !faq._expanded">
                <div class="faq-question">
                  <span class="faq-category" *ngIf="faq.category">{{ faq.category }}</span>
                  {{ faq.question }}
                </div>
                <span class="faq-toggle">{{ faq._expanded ? '-' : '+' }}</span>
              </div>
              <div class="faq-answer" *ngIf="faq._expanded">
                <p>{{ faq.answer }}</p>
                <div class="faq-actions">
                  <button class="btn btn-sm btn-secondary" (click)="editFAQ(faq)">Edit</button>
                  <button class="btn btn-sm btn-danger" (click)="deleteFAQ(faq)">Delete</button>
                </div>
              </div>
            </div>
            <div *ngIf="faqs.length === 0" class="empty">No FAQs found. Add your first FAQ above.</div>
          </div>
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

    .tabs { display: flex; gap: 0; margin-bottom: 16px; border-bottom: 2px solid #eee; }
    .tab { padding: 10px 24px; border: none; background: none; cursor: pointer; font-size: 14px; color: #888; border-bottom: 2px solid transparent; margin-bottom: -2px; }
    .tab.active { color: #1a1a2e; border-bottom-color: #1a1a2e; font-weight: 600; }

    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-weight: 600; color: #333; }
    .form-card { border: 1px solid #e3f2fd; margin-bottom: 16px; }
    .form-card h3 { margin: 0 0 16px; color: #333; font-size: 16px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; margin-bottom: 4px; font-size: 13px; font-weight: 500; color: #555; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; box-sizing: border-box; }
    .form-group textarea { resize: vertical; }
    .form-actions { display: flex; gap: 8px; margin-top: 12px; }
    .error-msg { color: #c62828; font-size: 13px; margin-top: 8px; }

    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active, .badge-approved, .badge-resolved, .badge-closed { background: #e8f5e9; color: #2e7d32; }
    .badge-pending, .badge-open, .badge-waiting { background: #fff3e0; color: #e65100; }
    .badge-rejected, .badge-cancelled { background: #ffebee; color: #c62828; }
    .badge-in_progress, .badge-assigned { background: #e3f2fd; color: #1565c0; }
    .badge-priority-high, .badge-priority-critical { background: #ffebee; color: #c62828; }
    .badge-priority-medium { background: #fff3e0; color: #e65100; }
    .badge-priority-low { background: #e8f5e9; color: #2e7d32; }

    .btn { padding: 5px 12px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-success { background: #4caf50; color: #fff; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }

    .faq-list { }
    .faq-item { border: 1px solid #eee; border-radius: 8px; margin-bottom: 8px; overflow: hidden; }
    .faq-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; cursor: pointer; background: #fafafa; }
    .faq-header:hover { background: #f0f0f0; }
    .faq-question { font-size: 14px; font-weight: 500; color: #333; }
    .faq-category { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #e3f2fd; color: #1565c0; text-transform: uppercase; margin-right: 8px; }
    .faq-toggle { font-size: 20px; color: #888; font-weight: bold; }
    .faq-answer { padding: 12px 16px; border-top: 1px solid #eee; }
    .faq-answer p { margin: 0 0 8px; font-size: 14px; color: #555; line-height: 1.5; }
    .faq-actions { display: flex; gap: 4px; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class HelpdeskComponent implements OnInit {
  items: any[] = [];
  faqs: any[] = [];
  loading = false;
  loadingFAQs = false;
  saving = false;
  search = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;
  activeTab = 'tickets';
  showFAQForm = false;
  editingFAQId: string | null = null;
  faqForm: any = { question: '', answer: '', category: '' };
  formError = '';

  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;

    this.api.get<any>('/helpdesk', params).subscribe({
      next: (res) => {
        this.items = res.data?.tickets || res.data || [];
        this.total = res.data?.pagination?.total || res.data?.total || this.items.length;
        this.totalPages = Math.ceil(this.total / this.limit);
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      }
    });
  }

  loadFAQs(): void {
    this.loadingFAQs = true;
    this.api.get<any>('/helpdesk/faq').subscribe({
      next: (res) => {
        this.faqs = (res.data?.faqs || res.data || []).map((f: any) => ({ ...f, _expanded: false }));
        this.loadingFAQs = false;
      },
      error: () => {
        this.faqs = [];
        this.loadingFAQs = false;
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

  assign(item: any): void {
    this.api.put<any>(`/helpdesk/${item.id}/assign`).subscribe({
      next: () => this.loadData()
    });
  }

  resolve(item: any): void {
    this.api.put<any>(`/helpdesk/${item.id}/resolve`).subscribe({
      next: () => this.loadData()
    });
  }

  openFAQForm(): void {
    this.showFAQForm = true;
    this.editingFAQId = null;
    this.faqForm = { question: '', answer: '', category: '' };
    this.formError = '';
  }

  editFAQ(faq: any): void {
    this.showFAQForm = true;
    this.editingFAQId = faq.id;
    this.faqForm = { question: faq.question, answer: faq.answer, category: faq.category || '' };
    this.formError = '';
  }

  cancelFAQForm(): void {
    this.showFAQForm = false;
    this.editingFAQId = null;
    this.formError = '';
  }

  saveFAQ(): void {
    if (!this.faqForm.question || !this.faqForm.answer) {
      this.formError = 'Question and answer are required';
      return;
    }
    this.saving = true;
    this.formError = '';

    const req = this.editingFAQId
      ? this.api.put<any>(`/helpdesk/faq/${this.editingFAQId}`, this.faqForm)
      : this.api.post<any>('/helpdesk/faq', this.faqForm);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.showFAQForm = false;
        this.editingFAQId = null;
        this.loadFAQs();
      },
      error: (err: any) => {
        this.saving = false;
        this.formError = err.error?.message || 'Failed to save FAQ';
      }
    });
  }

  deleteFAQ(faq: any): void {
    if (!confirm('Delete this FAQ?')) return;
    this.api.delete<any>(`/helpdesk/faq/${faq.id}`).subscribe({
      next: () => this.loadFAQs()
    });
  }
}
