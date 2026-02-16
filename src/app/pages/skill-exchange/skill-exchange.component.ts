import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-skill-exchange',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Skill Exchange</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'skills'" (click)="activeTab = 'skills'; loadSkills()">Skills</button>
        <button class="tab" [class.active]="activeTab === 'sessions'" (click)="activeTab = 'sessions'; loadMySessions()">My Sessions</button>
      </div>

      <!-- SKILLS TAB -->
      <div *ngIf="activeTab === 'skills'">
        <!-- Add Skill Form -->
        <div class="card form-card" *ngIf="showForm">
          <h3>Add Skill</h3>
          <form (ngSubmit)="addSkill()">
            <div class="form-grid">
              <div class="form-group"><label>Skill Name *</label><input type="text" [(ngModel)]="skillForm.name" name="name" required placeholder="e.g. Yoga, Guitar, Coding"></div>
              <div class="form-group"><label>Category *</label>
                <select [(ngModel)]="skillForm.categoryId" name="categoryId" required>
                  <option value="">Select Category</option>
                  <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>Description</label><input type="text" [(ngModel)]="skillForm.description" name="description" placeholder="Brief description of your skill"></div>
              <div class="form-group"><label>Experience (Years)</label><input type="number" [(ngModel)]="skillForm.experienceYears" name="experienceYears" min="0" placeholder="e.g. 3"></div>
              <div class="form-group"><label>Hourly Rate</label><input type="number" [(ngModel)]="skillForm.hourlyRate" name="hourlyRate" min="0" placeholder="e.g. 500"></div>
              <div class="form-group"><label>Availability</label><input type="text" [(ngModel)]="skillForm.availability" name="availability" placeholder="e.g. Weekends, Evenings"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Skills List -->
        <div class="card">
          <div class="card-header"><span>Skills</span><button class="btn btn-primary btn-sm" (click)="openForm()" *ngIf="!showForm">+ Add Skill</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Skill Name</th><th>Category</th><th>Provider</th><th>Experience</th><th>Rate</th><th>Availability</th><th>Sessions Completed</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of skills">
                <td class="name-cell">{{ s.name || '-' }}</td>
                <td>{{ s.categoryName || s.category || '-' }}</td>
                <td>{{ s.providerName || s.provider || '-' }}</td>
                <td>{{ s.experienceYears != null ? s.experienceYears + ' yrs' : '-' }}</td>
                <td>{{ s.hourlyRate != null ? ('₹' + s.hourlyRate + '/hr') : '-' }}</td>
                <td>{{ s.availability || '-' }}</td>
                <td>{{ s.sessionsCompleted ?? 0 }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="openBookSession(s)">Book Session</button>
                </td>
              </tr>
              <tr *ngIf="skills.length === 0"><td colspan="8" class="empty">No skills found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MY SESSIONS TAB -->
      <div *ngIf="activeTab === 'sessions'">
        <div class="card">
          <div class="card-header"><span>My Sessions</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Skill</th><th>Provider</th><th>Date</th><th>Time</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of sessions">
                <td class="name-cell">{{ s.skillName || '-' }}</td>
                <td>{{ s.providerName || '-' }}</td>
                <td>{{ s.date ? (s.date | date:'mediumDate') : '-' }}</td>
                <td>{{ s.time || '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="s.status === 'upcoming' || s.status === 'confirmed'"
                    [class.badge-pending]="s.status === 'pending'"
                    [class.badge-completed]="s.status === 'completed'"
                    [class.badge-inactive]="s.status === 'cancelled'">
                    {{ s.status || '-' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="sessions.length === 0"><td colspan="5" class="empty">No sessions found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Book Session Modal -->
      <div class="modal-overlay" *ngIf="showBookModal" (click)="showBookModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Book Session — {{ selectedSkill?.name }}</h3>
          <form (ngSubmit)="bookSession()">
            <div class="form-grid-2">
              <div class="form-group"><label>Date *</label><input type="date" [(ngModel)]="bookForm.date" name="bookDate" required></div>
              <div class="form-group"><label>Time *</label><input type="time" [(ngModel)]="bookForm.time" name="bookTime" required></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Book</button>
              <button type="button" class="btn btn-secondary" (click)="showBookModal = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="bookError">{{ bookError }}</div>
          </form>
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
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
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
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 10px; padding: 24px; width: 420px; max-width: 90vw; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    .modal h3 { margin: 0 0 16px; color: #333; }
  `]
})
export class SkillExchangeComponent implements OnInit {
  activeTab = 'skills';
  loading = false;
  saving = false;
  showForm = false;
  formError = '';

  skills: any[] = [];
  categories: any[] = [];
  sessions: any[] = [];

  skillForm = {
    name: '',
    categoryId: '',
    description: '',
    experienceYears: null as number | null,
    hourlyRate: null as number | null,
    availability: ''
  };

  showBookModal = false;
  selectedSkill: any = null;
  bookForm = { date: '', time: '' };
  bookError = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadSkills();
    this.loadCategories();
  }

  loadSkills(): void {
    this.loading = true;
    this.api.get<any>('/community/skills').subscribe({
      next: (res) => { this.skills = res.data?.skills || res.data || []; this.loading = false; },
      error: () => { this.skills = []; this.loading = false; }
    });
  }

  loadCategories(): void {
    this.api.get<any>('/community/skills/categories').subscribe({
      next: (res) => { this.categories = res.data?.categories || res.data || []; },
      error: () => { this.categories = []; }
    });
  }

  loadMySessions(): void {
    this.loading = true;
    this.api.get<any>('/community/skills/my-sessions').subscribe({
      next: (res) => { this.sessions = res.data?.sessions || res.data || []; this.loading = false; },
      error: () => { this.sessions = []; this.loading = false; }
    });
  }

  openForm(): void {
    this.skillForm = { name: '', categoryId: '', description: '', experienceYears: null, hourlyRate: null, availability: '' };
    this.formError = '';
    this.showForm = true;
  }

  addSkill(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/community/skills', this.skillForm).subscribe({
      next: () => { this.saving = false; this.showForm = false; this.loadSkills(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to add skill'; }
    });
  }

  openBookSession(s: any): void {
    this.selectedSkill = s;
    this.bookForm = { date: '', time: '' };
    this.bookError = '';
    this.showBookModal = true;
  }

  bookSession(): void {
    if (!this.selectedSkill) return;
    this.saving = true;
    this.bookError = '';
    this.api.post<any>(`/community/skills/${this.selectedSkill.id}/book`, this.bookForm).subscribe({
      next: () => { this.saving = false; this.showBookModal = false; this.loadSkills(); },
      error: (err) => { this.saving = false; this.bookError = err.error?.message || 'Failed to book session'; }
    });
  }
}
