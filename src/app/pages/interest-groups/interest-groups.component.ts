import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-interest-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Interest Groups / Neighbor Connect</h2>
        <div class="header-actions">
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search groups..." class="search-input">
        </div>
      </div>

      <!-- Category Filter -->
      <div class="categories-bar">
        <span class="cat-chip" [class.active]="!categoryFilter" (click)="categoryFilter = ''; applyFilters()">All</span>
        <span class="cat-chip" *ngFor="let cat of categoryOptions" [class.active]="categoryFilter === cat.value" (click)="categoryFilter = cat.value; applyFilters()">{{ cat.label }}</span>
      </div>

      <!-- Create / Edit Group Form -->
      <div class="card form-card" *ngIf="showForm">
        <h3>{{ editingGroupId ? 'Edit Group' : 'Create Group' }}</h3>
        <form (ngSubmit)="saveGroup()">
          <div class="form-grid">
            <div class="form-group">
              <label>Group Name *</label>
              <input type="text" [(ngModel)]="groupForm.name" name="gname" required placeholder="e.g. Morning Joggers Club">
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select [(ngModel)]="groupForm.category" name="gcategory" required>
                <option value="">Select Category</option>
                <option *ngFor="let cat of categoryOptions" [value]="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Description</label>
              <input type="text" [(ngModel)]="groupForm.description" name="gdesc" placeholder="Brief description of the group">
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">{{ editingGroupId ? 'Update' : 'Create' }}</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
          <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        </form>
      </div>

      <!-- Groups Table -->
      <div class="card">
        <div class="card-header">
          <span>Interest Groups</span>
          <button class="btn btn-primary btn-sm" (click)="openCreateForm()" *ngIf="!showForm">+ Create Group</button>
        </div>
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Members</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let g of filteredGroups">
              <td class="name-cell">{{ g.name || '-' }}</td>
              <td>
                <span class="badge badge-category">{{ g.category || '-' }}</span>
              </td>
              <td class="desc-cell">{{ g.description || '-' }}</td>
              <td>{{ g.membersCount ?? g.members?.length ?? 0 }}</td>
              <td>{{ g.createdByName || g.createdBy || '-' }}</td>
              <td>
                <span class="badge"
                  [class.badge-active]="g.status === 'active'"
                  [class.badge-pending]="g.status === 'pending'"
                  [class.badge-inactive]="g.status === 'inactive' || g.status === 'closed'">
                  {{ g.status || 'active' }}
                </span>
              </td>
              <td>
                <button class="btn btn-secondary btn-sm" (click)="viewMembers(g)">Members</button>
                <button class="btn btn-primary btn-sm" (click)="editGroup(g)">Edit</button>
                <button class="btn btn-danger btn-sm" (click)="deleteGroup(g)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="filteredGroups.length === 0">
              <td colspan="7" class="empty">No interest groups found</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" *ngIf="totalPages > 1">
          <button (click)="changePage(page - 1)" [disabled]="page <= 1">Prev</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button (click)="changePage(page + 1)" [disabled]="page >= totalPages">Next</button>
        </div>
      </div>

      <!-- View Members Modal -->
      <div class="modal-overlay" *ngIf="showMembersModal" (click)="showMembersModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Members &mdash; {{ selectedGroup?.name }}</h3>
            <button class="btn btn-secondary btn-sm" (click)="showMembersModal = false">Close</button>
          </div>
          <div class="loading" *ngIf="loadingMembers">Loading members...</div>
          <table *ngIf="!loadingMembers && members.length > 0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit</th>
                <th>Joined</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of members">
                <td class="name-cell">{{ m.name || m.residentName || '-' }}</td>
                <td>{{ m.unit || m.unitNumber || '-' }}</td>
                <td>{{ m.joinedAt ? (m.joinedAt | date:'mediumDate') : (m.createdAt ? (m.createdAt | date:'mediumDate') : '-') }}</td>
                <td>
                  <span class="badge badge-active">{{ m.role || 'member' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty" *ngIf="!loadingMembers && members.length === 0">No members yet</div>
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
    .form-group input, .form-group select, .form-group textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #4fc3f7; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
    .error-msg { color: #f44336; font-size: 13px; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .desc-cell { max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-completed { background: #e3f2fd; color: #1565c0; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-category { background: #e3f2fd; color: #1565c0; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 10px; padding: 24px; width: 560px; max-width: 90vw; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .modal-header h3 { margin: 0; color: #333; }
  `]
})
export class InterestGroupsComponent implements OnInit {
  loading = false;
  saving = false;
  showForm = false;
  formError = '';
  search = '';
  categoryFilter = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;

  groups: any[] = [];
  filteredGroups: any[] = [];

  editingGroupId = '';
  groupForm = {
    name: '',
    category: '',
    description: ''
  };

  showMembersModal = false;
  loadingMembers = false;
  selectedGroup: any = null;
  members: any[] = [];

  categoryOptions = [
    { value: 'sports', label: 'Sports' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'reading', label: 'Reading' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'cooking', label: 'Cooking' },
    { value: 'tech', label: 'Tech' },
    { value: 'art', label: 'Art' },
    { value: 'music', label: 'Music' },
    { value: 'other', label: 'Other' }
  ];

  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;
    if (this.categoryFilter) params.category = this.categoryFilter;

    this.api.get<any>('/interest-groups', params).subscribe({
      next: (res) => {
        this.groups = res.data?.groups || res.data?.interestGroups || res.data || [];
        this.total = res.data?.total || res.total || this.groups.length;
        this.totalPages = Math.ceil(this.total / this.limit);
        this.applyLocalFilters();
        this.loading = false;
      },
      error: (err) => {
        this.groups = [];
        this.filteredGroups = [];
        this.total = 0;
        this.totalPages = 0;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadGroups();
  }

  applyLocalFilters(): void {
    let result = [...this.groups];

    if (this.search) {
      const term = this.search.toLowerCase();
      result = result.filter((g: any) =>
        (g.name || '').toLowerCase().includes(term) ||
        (g.description || '').toLowerCase().includes(term) ||
        (g.category || '').toLowerCase().includes(term) ||
        (g.createdByName || '').toLowerCase().includes(term)
      );
    }

    if (this.categoryFilter) {
      result = result.filter((g: any) => (g.category || '').toLowerCase() === this.categoryFilter.toLowerCase());
    }

    this.filteredGroups = result;
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadGroups();
    }, 400);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadGroups();
    }
  }

  openCreateForm(): void {
    this.editingGroupId = '';
    this.groupForm = { name: '', category: '', description: '' };
    this.formError = '';
    this.showForm = true;
  }

  editGroup(g: any): void {
    this.editingGroupId = g.id || g._id;
    this.groupForm = {
      name: g.name || '',
      category: g.category || '',
      description: g.description || ''
    };
    this.formError = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingGroupId = '';
    this.formError = '';
  }

  saveGroup(): void {
    if (!this.groupForm.name || !this.groupForm.category) {
      this.formError = 'Name and Category are required.';
      return;
    }
    this.saving = true;
    this.formError = '';
    const payload = { ...this.groupForm };

    const req$ = this.editingGroupId
      ? this.api.put<any>(`/interest-groups/${this.editingGroupId}`, payload)
      : this.api.post<any>('/interest-groups', payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.editingGroupId = '';
        this.loadGroups();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err.error?.message || 'Failed to save group';
      }
    });
  }

  deleteGroup(g: any): void {
    const groupId = g.id || g._id;
    if (confirm(`Delete group "${g.name}"? This action cannot be undone.`)) {
      this.api.delete<any>(`/interest-groups/${groupId}`).subscribe({
        next: () => this.loadGroups(),
        error: (err) => {
          alert(err.error?.message || 'Failed to delete group');
        }
      });
    }
  }

  viewMembers(g: any): void {
    const groupId = g.id || g._id;
    this.selectedGroup = g;
    this.members = [];
    this.loadingMembers = true;
    this.showMembersModal = true;

    this.api.get<any>(`/interest-groups/${groupId}/members`).subscribe({
      next: (res) => {
        this.members = res.data?.members || res.data || [];
        this.loadingMembers = false;
      },
      error: () => {
        this.members = [];
        this.loadingMembers = false;
      }
    });
  }
}
