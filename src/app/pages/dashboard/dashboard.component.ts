import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <!-- Greeting -->
      <div class="greeting-row">
        <div>
          <h2 class="greeting-title">Welcome back</h2>
          <p class="greeting-sub">Here's what's happening across your community today.</p>
        </div>
        <div class="date-pill">
          <span class="date-icon">&#128197;</span>
          <span>{{ today | date:'mediumDate' }}</span>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card" *ngFor="let stat of stats; let i = index">
          <div class="stat-icon-wrap" [style.background]="statColors[i]?.bg">
            <span class="stat-icon">{{ stat.icon }}</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Visitor Trend -->
        <div class="card">
          <div class="card-header">
            <h3>Visitor Trend</h3>
            <span class="card-badge">Last 7 Days</span>
          </div>
          <div class="chart-placeholder" *ngIf="visitorTrend.length === 0">
            <span class="shimmer-bar"></span>
            <span class="shimmer-bar short"></span>
            <span class="shimmer-bar"></span>
          </div>
          <div class="bar-chart" *ngIf="visitorTrend.length > 0">
            <div class="bar-item" *ngFor="let item of visitorTrend">
              <div class="bar-value">{{ item.count }}</div>
              <div class="bar-track">
                <div class="bar" [style.height.%]="getBarHeight(item.count)"></div>
              </div>
              <span class="bar-label">{{ item.date | date:'EEE' }}</span>
            </div>
          </div>
        </div>

        <!-- Occupancy Donut -->
        <div class="card">
          <div class="card-header">
            <h3>Community Overview</h3>
          </div>
          <div class="overview-grid">
            <div class="overview-item" *ngFor="let s of staffStats">
              <span class="overview-value">{{ s.value }}</span>
              <span class="overview-label">{{ s.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity & Complaints -->
      <div class="charts-row">
        <!-- Recent Alerts -->
        <div class="card">
          <div class="card-header">
            <h3>Recent Alerts</h3>
            <span class="card-badge">Live</span>
          </div>
          <div class="activity-feed">
            <div class="activity-item" *ngFor="let alert of recentAlerts">
              <div class="activity-dot" [class]="'dot-' + alert.status"></div>
              <div class="activity-content">
                <span class="activity-title">{{ alert.type || 'Alert' }}</span>
                <span class="activity-meta">{{ alert.status }} &middot; {{ alert.createdAt | date:'short' }}</span>
              </div>
            </div>
            <div *ngIf="recentAlerts.length === 0" class="empty-state">
              <span class="empty-icon">&#9989;</span>
              <span>No active alerts</span>
            </div>
          </div>
        </div>

        <!-- Complaints Table -->
        <div class="card">
          <div class="card-header">
            <h3>Recent Complaints</h3>
          </div>
          <div class="table-wrap">
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
                  <td class="td-date">{{ c.createdAt | date:'mediumDate' }}</td>
                </tr>
                <tr *ngIf="recentComplaints.length === 0">
                  <td colspan="3" class="empty-state">No complaints</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 28px; animation: fadeUp 0.5s ease; }

    /* Greeting */
    .greeting-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .greeting-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 600;
      color: #F2EDE4;
      margin: 0 0 4px;
    }
    .greeting-sub { font-size: 13px; color: #7D786E; margin: 0; }
    .date-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #18181F;
      border: 1px solid rgba(200,169,125,0.10);
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 12px;
      color: #C8C2B6;
    }
    .date-icon { font-size: 14px; }

    /* Stat Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #111118;
      border: 1px solid rgba(200,169,125,0.10);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.25s;
    }
    .stat-card:hover {
      border-color: rgba(200,169,125,0.20);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .stat-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon { font-size: 20px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value {
      font-size: 22px;
      font-weight: 700;
      color: #F2EDE4;
      font-family: 'Sora', sans-serif;
    }
    .stat-label { font-size: 12px; color: #7D786E; margin-top: 2px; }

    /* Cards */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .card {
      background: #111118;
      border: 1px solid rgba(200,169,125,0.10);
      border-radius: 14px;
      padding: 22px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .card-header h3 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16px;
      font-weight: 600;
      color: #F2EDE4;
      margin: 0;
    }
    .card-badge {
      font-size: 10px;
      padding: 3px 10px;
      border-radius: 6px;
      background: rgba(200,169,125,0.08);
      color: #C8A97D;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Bar Chart */
    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      height: 160px;
      padding-top: 10px;
    }
    .bar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      height: 100%;
    }
    .bar-value { font-size: 11px; font-weight: 600; color: #C8A97D; }
    .bar-track {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
    }
    .bar {
      width: 100%;
      background: linear-gradient(180deg, #C8A97D, rgba(200,169,125,0.20));
      border-radius: 6px 6px 2px 2px;
      min-height: 4px;
      transition: height 0.6s cubic-bezier(.4,0,.2,1);
    }
    .bar-label { font-size: 10px; color: #4A4740; font-weight: 500; }

    /* Overview Grid */
    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }
    .overview-item {
      background: #18181F;
      border: 1px solid rgba(200,169,125,0.08);
      border-radius: 12px;
      padding: 18px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .overview-value {
      font-size: 24px;
      font-weight: 700;
      color: #C8A97D;
      font-family: 'Sora', sans-serif;
    }
    .overview-label {
      font-size: 11px;
      color: #7D786E;
      text-align: center;
    }

    /* Activity Feed */
    .activity-feed { display: flex; flex-direction: column; gap: 12px; }
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      background: #18181F;
      border: 1px solid rgba(200,169,125,0.06);
    }
    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
      background: #7D786E;
    }
    .dot-active, .dot-pending { background: #F06868; }
    .dot-resolved, .dot-closed { background: #5CE0A0; }
    .dot-in_progress { background: #E8A84C; }
    .activity-content { display: flex; flex-direction: column; }
    .activity-title { font-size: 13px; color: #C8C2B6; font-weight: 500; }
    .activity-meta { font-size: 11px; color: #4A4740; margin-top: 2px; text-transform: capitalize; }

    /* Table */
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid rgba(200,169,125,0.06);
    }
    th { font-weight: 600; color: #7D786E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { color: #C8C2B6; }
    .td-date { color: #4A4740; font-size: 12px; }

    .badge {
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .badge-open, .badge-pending { background: rgba(232,168,76,0.12); color: #E8A84C; }
    .badge-resolved, .badge-closed { background: rgba(92,224,160,0.12); color: #5CE0A0; }
    .badge-in_progress { background: rgba(107,138,255,0.12); color: #6B8AFF; }

    .empty-state {
      color: #4A4740;
      text-align: center;
      padding: 24px;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .empty-icon { font-size: 24px; }

    /* Shimmer loading */
    .chart-placeholder {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px 0;
    }
    .shimmer-bar {
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(90deg, #18181F 25%, #1F1F28 50%, #18181F 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .shimmer-bar.short { width: 60%; }

    @media (max-width: 900px) {
      .charts-row { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: 1fr; }
      .greeting-row { flex-direction: column; gap: 12px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any[] = [];
  visitorTrend: any[] = [];
  recentAlerts: any[] = [];
  recentComplaints: any[] = [];
  staffStats: any[] = [];
  maxVisitorCount = 1;
  today = new Date();

  statColors = [
    { bg: 'rgba(107,138,255,0.12)' },
    { bg: 'rgba(232,168,76,0.12)' },
    { bg: 'rgba(240,104,104,0.12)' },
    { bg: 'rgba(92,224,160,0.12)' },
    { bg: 'rgba(157,138,232,0.12)' },
    { bg: 'rgba(200,169,125,0.12)' },
  ];

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
          const s = d.stats || d;
          this.stats = [
            { icon: '\u{1F3E0}', label: 'Total Residents', value: s.totalResidents ?? 0 },
            { icon: '\u{1F514}', label: 'Pending Approvals', value: s.pendingResidents ?? 0 },
            { icon: '\u{1F6B6}', label: 'Visitors Today', value: s.visitorsToday ?? s.todayVisitors ?? 0 },
            { icon: '\u{1F4DD}', label: 'Open Complaints', value: s.openComplaints ?? 0 },
            { icon: '\u{1F6A8}', label: 'Active Alerts', value: s.activeAlerts ?? 0 },
            { icon: '\u{1F464}', label: 'Staff on Duty', value: s.staffPresentToday ?? s.totalStaff ?? 0 },
            { icon: '\u{1F4E6}', label: 'Deliveries Today', value: s.deliveriesToday ?? s.todayDeliveries ?? 0 },
            { icon: '\u{1F697}', label: 'Vehicles Inside', value: s.vehiclesInside ?? 0 },
          ];
          if (d.visitorTrend) {
            this.visitorTrend = d.visitorTrend;
            this.maxVisitorCount = Math.max(...d.visitorTrend.map((v: any) => v.count), 1);
          }
          this.staffStats = [
            { label: 'Security Guards', value: s.totalStaff ?? s.securityGuards ?? 0 },
            { label: 'Housekeeping', value: s.housekeeping ?? 0 },
            { label: 'Maintenance', value: s.maintenance ?? 0 },
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
