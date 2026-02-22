import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-polls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Polls</h2>
        <div class="header-actions">
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search polls..." class="search-input">
          <button class="btn btn-primary" (click)="showCreateForm = true">+ Create Poll</button>
        </div>
      </div>

      <!-- Create Poll Modal -->
      <div class="modal-overlay" *ngIf="showCreateForm" (click)="showCreateForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Create New Poll</h3>
            <button class="close-btn" (click)="showCreateForm = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Title *</label>
              <input type="text" [(ngModel)]="newPoll.title" placeholder="Poll title" class="form-control">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="newPoll.description" placeholder="Poll description (optional)" class="form-control" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>Options *</label>
              <div class="options-list">
                <div class="option-row" *ngFor="let opt of newPoll.options; let i = index">
                  <input type="text" [(ngModel)]="newPoll.options[i]" [placeholder]="'Option ' + (i+1)" class="form-control">
                  <button class="btn-icon" (click)="removeOption(i)" *ngIf="newPoll.options.length > 2">&times;</button>
                </div>
              </div>
              <button class="btn btn-sm" (click)="addOption()">+ Add Option</button>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>End Date *</label>
                <input type="datetime-local" [(ngModel)]="newPoll.endDate" class="form-control">
              </div>
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="newPoll.type" class="form-control">
                  <option value="poll">Poll</option>
                  <option value="survey">Survey</option>
                  <option value="vote">Vote</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="newPoll.allowMultipleChoice"> Allow multiple choices
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="newPoll.isAnonymous"> Anonymous voting
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="newPoll.showResultsBeforeEnd"> Show results before end
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn" (click)="showCreateForm = false">Cancel</button>
            <button class="btn btn-primary" (click)="createPoll()" [disabled]="creating">
              {{ creating ? 'Creating...' : 'Create Poll' }}
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Total Votes</th>
              <th>End Date</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>{{ item.title }}</td>
              <td>{{ item.type || 'poll' }}</td>
              <td><span class="badge" [ngClass]="'badge-' + item.status">{{ item.status }}</span></td>
              <td>{{ item.totalVotes || 0 }}</td>
              <td>{{ item.endDate | date:'mediumDate' }}</td>
              <td>{{ item.createdAt | date:'mediumDate' }}</td>
              <td>
                <button class="btn btn-sm btn-danger" (click)="closePoll(item)" *ngIf="item.status === 'active'">Close</button>
                <button class="btn btn-sm btn-danger" (click)="deletePoll(item)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="7" class="empty">No polls found</td>
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
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-closed { background: #ffebee; color: #c62828; }
    .badge-draft { background: #fff3e0; color: #e65100; }
    .btn { padding: 6px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 500; background: #fff; }
    .btn-primary { background: #1a1a2e; color: #fff; border: none; }
    .btn-sm { padding: 4px 10px; font-size: 12px; }
    .btn-danger { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .btn-icon { background: none; border: none; font-size: 18px; cursor: pointer; color: #999; padding: 2px 6px; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 12px; width: 560px; max-width: 90vw; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #eee; }
    .modal-header h3 { margin: 0; }
    .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
    .modal-body { padding: 20px; }
    .modal-footer { padding: 12px 20px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-control { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
    .form-control:focus { outline: none; border-color: #4fc3f7; }
    textarea.form-control { resize: vertical; }
    .form-row { display: flex; gap: 12px; margin-bottom: 14px; }
    .form-row .form-group { flex: 1; margin-bottom: 0; }
    .options-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
    .option-row { display: flex; gap: 6px; align-items: center; }
    .option-row .form-control { flex: 1; }
    .checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; cursor: pointer; }
  `]
})
export class PollsComponent implements OnInit {
  items: any[] = [];
  loading = false;
  search = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;
  showCreateForm = false;
  creating = false;

  newPoll: any = {
    title: '',
    description: '',
    options: ['', ''],
    endDate: '',
    type: 'poll',
    allowMultipleChoice: false,
    isAnonymous: false,
    showResultsBeforeEnd: false,
  };

  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;

    this.api.get<any>('/polls', params).subscribe({
      next: (res) => {
        this.items = res.data?.polls || res.data || [];
        this.total = res.count || res.data?.total || this.items.length;
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

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadData();
    }
  }

  addOption(): void {
    this.newPoll.options.push('');
  }

  removeOption(index: number): void {
    this.newPoll.options.splice(index, 1);
  }

  createPoll(): void {
    if (!this.newPoll.title.trim()) { alert('Title is required'); return; }
    const validOptions = this.newPoll.options.filter((o: string) => o.trim());
    if (validOptions.length < 2) { alert('At least 2 options are required'); return; }
    if (!this.newPoll.endDate) { alert('End date is required'); return; }

    this.creating = true;
    const payload = {
      title: this.newPoll.title,
      description: this.newPoll.description,
      type: this.newPoll.type,
      options: validOptions,
      endDate: new Date(this.newPoll.endDate).toISOString(),
      allowMultipleChoice: this.newPoll.allowMultipleChoice,
      isAnonymous: this.newPoll.isAnonymous,
      showResultsBeforeEnd: this.newPoll.showResultsBeforeEnd,
    };

    this.api.post<any>('/polls', payload).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.creating = false;
        this.newPoll = { title: '', description: '', options: ['', ''], endDate: '', type: 'poll', allowMultipleChoice: false, isAnonymous: false, showResultsBeforeEnd: false };
        this.loadData();
      },
      error: (err) => {
        this.creating = false;
        alert(err.error?.message || 'Failed to create poll');
      }
    });
  }

  closePoll(item: any): void {
    if (!confirm('Close this poll?')) return;
    this.api.put<any>(`/polls/${item.id}/close`, {}).subscribe({
      next: () => this.loadData(),
      error: (err) => alert(err.error?.message || 'Failed to close poll')
    });
  }

  deletePoll(item: any): void {
    if (!confirm('Delete this poll?')) return;
    this.api.delete<any>(`/polls/${item.id}`).subscribe({
      next: () => this.loadData(),
      error: (err) => alert(err.error?.message || 'Failed to delete poll')
    });
  }
}
