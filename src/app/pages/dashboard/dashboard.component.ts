import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h2>Dashboard Overview</h2>

      <div class="stats-grid">
        <div class="stat-card" *ngFor="let stat of stats">
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-info">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-card">
          <h3>Visitor Trend (Last 7 Days)</h3>
          <div class="chart-placeholder" *ngIf="visitorTrend.length === 0">Loading...</div>
          <div class="bar-chart" *ngIf="visitorTrend.length > 0">
            <div class="bar-item" *ngFor="let item of visitorTrend">
              <div class="bar" [style.height.%]="getBarHeight(item.count)"></div>
              <span class="bar-label">{{ item.date | date:'EEE' }}</span>
              <span class="bar-value">{{ item.count }}</span>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Recent Alerts</h3>
          <div class="alert-list">
            <div class="alert-item" *ngFor="let alert of recentAlerts" [class]="'alert-' + alert.status">
              <span class="alert-status">{{ alert.status }}</span>
              <span class="alert-time">{{ alert.createdAt | date:'short' }}</span>
            </div>
            <div *ngIf="recentAlerts.length === 0" class="empty-state">No active alerts</div>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-card">
          <h3>Recent Complaints</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of recentComplaints">
                  <td>{{ c.type || 'General' }}</td>
                  <td><span class="badge" [class]="'badge-' + c.status">{{ c.status }}</span></td>
                  <td>{{ c.createdAt | date:'mediumDate' }}</td>
                </tr>
                <tr *ngIf="recentComplaints.length === 0">
                  <td colspan="3" class="empty-state">No complaints</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="chart-card">
          <h3>Staff on Duty</h3>
          <div class="stat-mini" *ngFor="let s of staffStats">
            <span>{{ s.label }}</span>
            <strong>{{ s.value }}</strong>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard h2 { margin: 0 0 24px; color: #333; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #fff;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .stat-icon { font-size: 32px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 700; color: #333; }
    .stat-label { font-size: 13px; color: #888; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .chart-card {
      background: #fff;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      h3 { margin: 0 0 16px; font-size: 16px; color: #333; }
    }
    .bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 150px; }
    .bar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .bar {
      width: 100%;
      background: linear-gradient(180deg, #4fc3f7, #1a1a2e);
      border-radius: 4px 4px 0 0;
      min-height: 4px;
      transition: height 0.5s;
    }
    .bar-label { font-size: 11px; color: #888; }
    .bar-value { font-size: 12px; font-weight: 600; color: #333; }
    .alert-list { display: flex; flex-direction: column; gap: 8px; }
    .alert-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      background: #fff3e0;
    }
    .alert-active { background: #ffebee; }
    .alert-resolved { background: #e8f5e9; }
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { font-weight: 600; color: #666; }
    .badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-open, .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-resolved, .badge-closed { background: #e8f5e9; color: #2e7d32; }
    .badge-in_progress { background: #e3f2fd; color: #1565c0; }
    .stat-mini {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    .empty-state { color: #999; text-align: center; padding: 20px; font-size: 14px; }
    .chart-placeholder { color: #999; text-align: center; padding: 40px; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any[] = [];
  visitorTrend: any[] = [];
  recentAlerts: any[] = [];
  recentComplaints: any[] = [];
  staffStats: any[] = [];
  maxVisitorCount = 1;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboard();
    this.loadAlerts();
    this.loadComplaints();
  }

  loadDashboard() {
    this.api.get<any>('/dashboard').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const d = res.data;
          this.stats = [
            { icon: '\u{1F6B6}', label: 'Visitors Today', value: d.todayVisitors || 0 },
            { icon: '\u{1F4DD}', label: 'Open Complaints', value: d.openComplaints || 0 },
            { icon: '\u{1F6A8}', label: 'Active Alerts', value: d.activeAlerts || 0 },
            { icon: '\u{1F464}', label: 'Staff on Duty', value: d.staffOnDuty || 0 },
            { icon: '\u{1F4E6}', label: 'Deliveries Today', value: d.todayDeliveries || 0 },
            { icon: '\u{1F697}', label: 'Vehicles Inside', value: d.vehiclesInside || 0 },
          ];
          if (d.visitorTrend) {
            this.visitorTrend = d.visitorTrend;
            this.maxVisitorCount = Math.max(...d.visitorTrend.map((v: any) => v.count), 1);
          }
          this.staffStats = [
            { label: 'Security Guards', value: d.securityGuards || 0 },
            { label: 'Housekeeping', value: d.housekeeping || 0 },
            { label: 'Maintenance', value: d.maintenance || 0 },
          ];
        }
      },
      error: () => {
        this.stats = [
          { icon: '\u{1F6B6}', label: 'Visitors Today', value: '-' },
          { icon: '\u{1F4DD}', label: 'Open Complaints', value: '-' },
          { icon: '\u{1F6A8}', label: 'Active Alerts', value: '-' },
          { icon: '\u{1F464}', label: 'Staff on Duty', value: '-' },
        ];
      }
    });
  }

  loadAlerts() {
    this.api.get<any>('/alerts', { limit: 5 }).subscribe({
      next: (res) => {
        this.recentAlerts = res.data?.alerts || [];
      }
    });
  }

  loadComplaints() {
    this.api.get<any>('/complaints', { limit: 5 }).subscribe({
      next: (res) => {
        this.recentComplaints = res.data?.complaints || res.data || [];
      }
    });
  }

  getBarHeight(count: number): number {
    return (count / this.maxVisitorCount) * 100;
  }
}
