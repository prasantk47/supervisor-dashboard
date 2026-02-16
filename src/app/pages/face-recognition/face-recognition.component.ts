import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-face-recognition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Face Recognition</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'registered'" (click)="activeTab = 'registered'; loadRegistered()">Registered Faces</button>
        <button class="tab" [class.active]="activeTab === 'logs'" (click)="activeTab = 'logs'; loadLogs()">Recognition Logs</button>
        <button class="tab" [class.active]="activeTab === 'statistics'" (click)="activeTab = 'statistics'; loadStatistics()">Statistics</button>
      </div>

      <!-- REGISTERED FACES TAB -->
      <div *ngIf="activeTab === 'registered'">
        <!-- Filter by userType -->
        <div class="categories-bar">
          <span class="cat-chip" [class.active]="!selectedUserType" (click)="selectedUserType = ''; loadRegistered()">All</span>
          <span class="cat-chip" [class.active]="selectedUserType === 'Resident'" (click)="selectedUserType = 'Resident'; loadRegistered()">Resident</span>
          <span class="cat-chip" [class.active]="selectedUserType === 'Guard'" (click)="selectedUserType = 'Guard'; loadRegistered()">Guard</span>
          <span class="cat-chip" [class.active]="selectedUserType === 'FamilyMember'" (click)="selectedUserType = 'FamilyMember'; loadRegistered()">Family Member</span>
          <span class="cat-chip" [class.active]="selectedUserType === 'FrequentVisitor'" (click)="selectedUserType = 'FrequentVisitor'; loadRegistered()">Frequent Visitor</span>
        </div>

        <div class="card">
          <div class="card-header"><span>Registered Faces</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>User Type</th>
                <th>User Name</th>
                <th>Photo</th>
                <th>Registered Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of registeredFaces">
                <td><span class="code-badge">{{ r.userType }}</span></td>
                <td class="name-cell">{{ r.userName || '-' }}</td>
                <td>
                  <img *ngIf="r.photoUrl" [src]="r.photoUrl" alt="photo" class="photo-thumb">
                  <span *ngIf="!r.photoUrl">-</span>
                </td>
                <td>{{ r.registeredDate ? (r.registeredDate | date:'medium') : '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="r.status === 'active'" [class.badge-inactive]="r.status !== 'active'">
                    {{ r.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-danger btn-sm" (click)="deleteRegistered(r)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="registeredFaces.length === 0"><td colspan="6" class="empty">No registered faces found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECOGNITION LOGS TAB -->
      <div *ngIf="activeTab === 'logs'">
        <div class="card form-card">
          <div class="form-grid">
            <div class="form-group">
              <label>From Date</label>
              <input type="date" [(ngModel)]="logFilters.fromDate" name="logFromDate">
            </div>
            <div class="form-group">
              <label>To Date</label>
              <input type="date" [(ngModel)]="logFilters.toDate" name="logToDate">
            </div>
            <div class="form-group">
              <label>Match</label>
              <select [(ngModel)]="logFilters.isMatch" name="logIsMatch">
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" (click)="loadLogs()">Filter</button>
            <button class="btn btn-secondary" (click)="logFilters = { fromDate: '', toDate: '', isMatch: '' }; loadLogs()">Reset</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Recognition Logs</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Camera</th>
                <th>Gate</th>
                <th>Matched User Type</th>
                <th>Matched User</th>
                <th>Confidence %</th>
                <th>Match</th>
                <th>Recognized At</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of logs">
                <td>{{ l.camera || '-' }}</td>
                <td>{{ l.gate || '-' }}</td>
                <td><span class="code-badge" *ngIf="l.matchedUserType">{{ l.matchedUserType }}</span><span *ngIf="!l.matchedUserType">-</span></td>
                <td class="name-cell">{{ l.matchedUser || '-' }}</td>
                <td>{{ l.confidence != null ? (l.confidence + '%') : '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="l.isMatch" [class.badge-inactive]="!l.isMatch">
                    {{ l.isMatch ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>{{ l.recognizedAt ? (l.recognizedAt | date:'medium') : '-' }}</td>
              </tr>
              <tr *ngIf="logs.length === 0"><td colspan="7" class="empty">No recognition logs found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- STATISTICS TAB -->
      <div *ngIf="activeTab === 'statistics'">
        <div class="card form-card">
          <div class="form-grid">
            <div class="form-group">
              <label>From Date</label>
              <input type="date" [(ngModel)]="statFilters.fromDate" name="statFromDate">
            </div>
            <div class="form-group">
              <label>To Date</label>
              <input type="date" [(ngModel)]="statFilters.toDate" name="statToDate">
            </div>
            <div class="form-group form-group-btn">
              <label>&nbsp;</label>
              <button class="btn btn-primary" (click)="loadStatistics()">Filter</button>
            </div>
          </div>
        </div>

        <div class="loading" *ngIf="loading">Loading...</div>

        <div *ngIf="!loading && statistics">
          <div class="stat-cards">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.totalRegistrations ?? 0 }}</div>
              <div class="stat-label">Total Registrations</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ statistics.totalRecognitionAttempts ?? 0 }}</div>
              <div class="stat-label">Total Recognition Attempts</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ statistics.successfulMatches ?? 0 }}</div>
              <div class="stat-label">Successful Matches</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ statistics.matchRate != null ? (statistics.matchRate + '%') : '-' }}</div>
              <div class="stat-label">Match Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ statistics.averageConfidence != null ? (statistics.averageConfidence + '%') : '-' }}</div>
              <div class="stat-label">Average Confidence</div>
            </div>
          </div>

          <div class="card" *ngIf="statistics.byUserType && statistics.byUserType.length > 0" style="margin-top: 16px;">
            <div class="card-header"><span>Breakdown by User Type</span></div>
            <table>
              <thead>
                <tr>
                  <th>User Type</th>
                  <th>Registrations</th>
                  <th>Attempts</th>
                  <th>Matches</th>
                  <th>Match Rate</th>
                  <th>Avg Confidence</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of statistics.byUserType">
                  <td><span class="code-badge">{{ b.userType }}</span></td>
                  <td>{{ b.registrations ?? 0 }}</td>
                  <td>{{ b.attempts ?? 0 }}</td>
                  <td>{{ b.matches ?? 0 }}</td>
                  <td>{{ b.matchRate != null ? (b.matchRate + '%') : '-' }}</td>
                  <td>{{ b.averageConfidence != null ? (b.averageConfidence + '%') : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
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
    .form-group-btn { justify-content: flex-end; }
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
    .photo-thumb { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #eee; }
    .stat-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
    .stat-label { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; }
  `]
})
export class FaceRecognitionComponent implements OnInit {
  activeTab = 'registered';
  loading = false;
  selectedUserType = '';

  registeredFaces: any[] = [];
  logs: any[] = [];
  statistics: any = null;

  logFilters = { fromDate: '', toDate: '', isMatch: '' };
  statFilters = { fromDate: '', toDate: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadRegistered();
  }

  loadRegistered(): void {
    this.loading = true;
    const params: any = {};
    if (this.selectedUserType) params.userType = this.selectedUserType;
    this.api.get<any>('/face-recognition/registered', params).subscribe({
      next: (res) => { this.registeredFaces = res.data?.faces || res.data || []; this.loading = false; },
      error: () => { this.registeredFaces = []; this.loading = false; }
    });
  }

  deleteRegistered(r: any): void {
    if (confirm(`Delete registered face for "${r.userName}"?`)) {
      this.api.delete<any>(`/face-recognition/${r.userType}/${r.userId}`).subscribe({
        next: () => this.loadRegistered(),
        error: () => {}
      });
    }
  }

  loadLogs(): void {
    this.loading = true;
    const params: any = {};
    if (this.logFilters.fromDate) params.fromDate = this.logFilters.fromDate;
    if (this.logFilters.toDate) params.toDate = this.logFilters.toDate;
    if (this.logFilters.isMatch) params.isMatch = this.logFilters.isMatch;
    this.api.get<any>('/face-recognition/logs', params).subscribe({
      next: (res) => { this.logs = res.data?.logs || res.data || []; this.loading = false; },
      error: () => { this.logs = []; this.loading = false; }
    });
  }

  loadStatistics(): void {
    this.loading = true;
    const params: any = {};
    if (this.statFilters.fromDate) params.fromDate = this.statFilters.fromDate;
    if (this.statFilters.toDate) params.toDate = this.statFilters.toDate;
    this.api.get<any>('/face-recognition/statistics', params).subscribe({
      next: (res) => { this.statistics = res.data || {}; this.loading = false; },
      error: () => { this.statistics = null; this.loading = false; }
    });
  }
}
