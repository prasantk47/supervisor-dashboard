import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Attendance</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'today'" (click)="activeTab = 'today'; loadToday()">Today</button>
        <button class="tab" [class.active]="activeTab === 'records'" (click)="activeTab = 'records'; loadRecords()">Records</button>
        <button class="tab" [class.active]="activeTab === 'summary'" (click)="activeTab = 'summary'; loadSummary()">Summary</button>
      </div>

      <!-- TODAY TAB -->
      <div *ngIf="activeTab === 'today'">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">{{ todayCounts.total }}</div>
            <div class="stat-label">Total Staff</div>
          </div>
          <div class="stat-card">
            <div class="stat-value present">{{ todayCounts.present }}</div>
            <div class="stat-label">Present</div>
          </div>
          <div class="stat-card">
            <div class="stat-value absent">{{ todayCounts.absent }}</div>
            <div class="stat-label">Absent</div>
          </div>
          <div class="stat-card">
            <div class="stat-value late">{{ todayCounts.late }}</div>
            <div class="stat-label">Late</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Today's Attendance</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Staff Name</th><th>Role</th><th>Punch In Time</th><th>Punch Out Time</th><th>Method</th><th>Status</th><th>Duration</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of todayRecords">
                <td class="name-cell">{{ r.staffName || r.name || '-' }}</td>
                <td>{{ r.role || '-' }}</td>
                <td>{{ r.punchInTime ? (r.punchInTime | date:'shortTime') : '-' }}</td>
                <td>{{ r.punchOutTime ? (r.punchOutTime | date:'shortTime') : '-' }}</td>
                <td><span class="badge badge-method">{{ r.method || '-' }}</span></td>
                <td>
                  <span class="badge" [class.badge-active]="r.status === 'present'" [class.badge-inactive]="r.status === 'absent'" [class.badge-pending]="r.status === 'late'">
                    {{ r.status || '-' }}
                  </span>
                </td>
                <td>{{ r.duration || '-' }}</td>
              </tr>
              <tr *ngIf="todayRecords.length === 0"><td colspan="7" class="empty">No attendance records for today</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECORDS TAB -->
      <div *ngIf="activeTab === 'records'">
        <div class="card filter-card">
          <div class="form-grid">
            <div class="form-group">
              <label>From Date</label>
              <input type="date" [(ngModel)]="filters.fromDate" name="fromDate">
            </div>
            <div class="form-group">
              <label>To Date</label>
              <input type="date" [(ngModel)]="filters.toDate" name="toDate">
            </div>
            <div class="form-group" style="justify-content: flex-end;">
              <button class="btn btn-primary" (click)="loadRecords()">Search</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Attendance Records</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Staff Name</th><th>Date</th><th>Punch In</th><th>Punch Out</th><th>Duration</th><th>Method</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of records">
                <td class="name-cell">{{ r.staffName || r.name || '-' }}</td>
                <td>{{ r.date ? (r.date | date:'mediumDate') : '-' }}</td>
                <td>{{ r.punchInTime ? (r.punchInTime | date:'shortTime') : '-' }}</td>
                <td>{{ r.punchOutTime ? (r.punchOutTime | date:'shortTime') : '-' }}</td>
                <td>{{ r.duration || '-' }}</td>
                <td><span class="badge badge-method">{{ r.method || '-' }}</span></td>
                <td>
                  <span class="badge" [class.badge-active]="r.status === 'present'" [class.badge-inactive]="r.status === 'absent'" [class.badge-pending]="r.status === 'late'">
                    {{ r.status || '-' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="regularize(r)">Regularize</button>
                </td>
              </tr>
              <tr *ngIf="records.length === 0"><td colspan="8" class="empty">No records found</td></tr>
            </tbody>
          </table>
          <div class="pagination" *ngIf="records.length > 0">
            <button class="btn btn-secondary btn-sm" [disabled]="pagination.page <= 1" (click)="pagination.page = pagination.page - 1; loadRecords()">Previous</button>
            <span class="page-info">Page {{ pagination.page }}</span>
            <button class="btn btn-secondary btn-sm" [disabled]="records.length < pagination.limit" (click)="pagination.page = pagination.page + 1; loadRecords()">Next</button>
          </div>
        </div>
      </div>

      <!-- SUMMARY TAB -->
      <div *ngIf="activeTab === 'summary'">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">{{ summaryStats.totalDays || 0 }}</div>
            <div class="stat-label">Total Days</div>
          </div>
          <div class="stat-card">
            <div class="stat-value present">{{ summaryStats.presentPercentage || 0 }}%</div>
            <div class="stat-label">Present %</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ summaryStats.averageHours || 0 }}</div>
            <div class="stat-label">Average Hours</div>
          </div>
          <div class="stat-card">
            <div class="stat-value late">{{ summaryStats.lateCount || 0 }}</div>
            <div class="stat-label">Late Count</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Attendance Summary</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <div *ngIf="!loading && summaryList.length === 0" class="empty">No summary data available</div>
          <table *ngIf="!loading && summaryList.length > 0">
            <thead><tr><th>Staff Name</th><th>Total Days</th><th>Present</th><th>Absent</th><th>Late</th><th>Avg Hours</th></tr></thead>
            <tbody>
              <tr *ngFor="let s of summaryList">
                <td class="name-cell">{{ s.staffName || s.name || '-' }}</td>
                <td>{{ s.totalDays || 0 }}</td>
                <td>{{ s.presentDays || 0 }}</td>
                <td>{{ s.absentDays || 0 }}</td>
                <td>{{ s.lateDays || 0 }}</td>
                <td>{{ s.averageHours || '-' }}</td>
              </tr>
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
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #333; }
    .stat-value.present { color: #2e7d32; }
    .stat-value.absent { color: #c62828; }
    .stat-value.late { color: #e65100; }
    .stat-label { font-size: 12px; color: #888; margin-top: 4px; font-weight: 500; text-transform: uppercase; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #333; }
    .filter-card { margin-bottom: 16px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-group input, .form-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #4fc3f7; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-method { background: #e3f2fd; color: #1565c0; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #eee; }
    .page-info { font-size: 13px; color: #666; }
  `]
})
export class AttendanceComponent implements OnInit {
  activeTab = 'today';
  loading = false;

  todayRecords: any[] = [];
  todayCounts = { total: 0, present: 0, absent: 0, late: 0 };

  records: any[] = [];
  filters = { fromDate: '', toDate: '' };
  pagination = { page: 1, limit: 20 };

  summaryStats: any = {};
  summaryList: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadToday(); }

  loadToday(): void {
    this.loading = true;
    this.api.get<any>('/attendance/staff/today').subscribe({
      next: (res) => {
        this.todayRecords = res.data?.records || res.data || [];
        this.todayCounts = {
          total: res.data?.total || this.todayRecords.length,
          present: res.data?.present || this.todayRecords.filter((r: any) => r.status === 'present').length,
          absent: res.data?.absent || this.todayRecords.filter((r: any) => r.status === 'absent').length,
          late: res.data?.late || this.todayRecords.filter((r: any) => r.status === 'late').length
        };
        this.loading = false;
      },
      error: () => { this.todayRecords = []; this.todayCounts = { total: 0, present: 0, absent: 0, late: 0 }; this.loading = false; }
    });
  }

  loadRecords(): void {
    this.loading = true;
    const params: any = { page: this.pagination.page, limit: this.pagination.limit };
    if (this.filters.fromDate) params.fromDate = this.filters.fromDate;
    if (this.filters.toDate) params.toDate = this.filters.toDate;
    this.api.get<any>('/attendance', params).subscribe({
      next: (res) => { this.records = res.data?.records || res.data || []; this.loading = false; },
      error: () => { this.records = []; this.loading = false; }
    });
  }

  regularize(record: any): void {
    if (confirm(`Regularize attendance for "${record.staffName || record.name}"?`)) {
      this.api.put<any>(`/attendance/${record.id}/regularize`, {}).subscribe({
        next: () => this.loadRecords(),
        error: () => {}
      });
    }
  }

  loadSummary(): void {
    this.loading = true;
    this.api.get<any>('/attendance/summary').subscribe({
      next: (res) => {
        const data = res.data || {};
        this.summaryStats = {
          totalDays: data.totalDays || data.summary?.totalDays || 0,
          presentPercentage: data.presentPercentage || data.summary?.presentPercentage || 0,
          averageHours: data.averageHours || data.summary?.averageHours || 0,
          lateCount: data.lateCount || data.summary?.lateCount || 0
        };
        this.summaryList = data.staffSummary || data.list || [];
        this.loading = false;
      },
      error: () => { this.summaryStats = {}; this.summaryList = []; this.loading = false; }
    });
  }
}
