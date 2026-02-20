import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-energy-meters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Energy Meters</h2>
        <div class="header-actions">
          <select [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="faulty">Faulty</option>
            <option value="disconnected">Disconnected</option>
          </select>
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search meters..." class="search-input">
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalMeters }}</div>
          <div class="stat-label">Total Meters</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.activeMeters }}</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.inactiveMeters }}</div>
          <div class="stat-label">Inactive</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalConsumption | number:'1.0-2' }}</div>
          <div class="stat-label">Total Consumption</div>
        </div>
      </div>

      <!-- Meters Table -->
      <div class="card">
        <div class="card-header">
          <span>Energy Meters</span>
        </div>
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Meter Number</th>
              <th>Location</th>
              <th>Type</th>
              <th>Current Reading</th>
              <th>Last Reading Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let meter of filteredMeters">
              <td class="name-cell">{{ meter.meterNumber || meter.name || '-' }}</td>
              <td>{{ meter.location || '-' }}</td>
              <td>
                <span class="type-badge" [ngClass]="'type-' + (meter.meterType || meter.type || 'other')">
                  {{ meter.meterType || meter.type || '-' }}
                </span>
              </td>
              <td>{{ meter.currentReading != null ? (meter.currentReading | number:'1.0-2') : '-' }}</td>
              <td>{{ meter.lastReadingDate ? (meter.lastReadingDate | date:'mediumDate') : '-' }}</td>
              <td>
                <span class="badge"
                  [class.badge-active]="meter.status === 'active'"
                  [class.badge-inactive]="meter.status === 'inactive' || meter.status === 'disconnected'"
                  [class.badge-faulty]="meter.status === 'faulty'">
                  {{ meter.status || 'unknown' }}
                </span>
              </td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="viewDetails(meter)">View</button>
              </td>
            </tr>
            <tr *ngIf="filteredMeters.length === 0">
              <td colspan="7" class="empty">No energy meters found</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" *ngIf="totalPages > 1">
          <button (click)="changePage(page - 1)" [disabled]="page <= 1">Prev</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button (click)="changePage(page + 1)" [disabled]="page >= totalPages">Next</button>
        </div>
      </div>

      <!-- Details Modal -->
      <div class="modal-overlay" *ngIf="showDetailsModal" (click)="closeModal($event)">
        <div class="modal-card modal-lg">
          <div class="modal-header">
            <h3>Meter Details - {{ selectedMeter?.meterNumber || selectedMeter?.name || 'N/A' }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">&times;</button>
          </div>

          <div class="detail-grid" *ngIf="selectedMeter">
            <div class="detail-item">
              <span class="detail-label">Meter Number</span>
              <span class="detail-value">{{ selectedMeter.meterNumber || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Type</span>
              <span class="detail-value">{{ selectedMeter.meterType || selectedMeter.type || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Location</span>
              <span class="detail-value">{{ selectedMeter.location || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="badge"
                [class.badge-active]="selectedMeter.status === 'active'"
                [class.badge-inactive]="selectedMeter.status === 'inactive' || selectedMeter.status === 'disconnected'"
                [class.badge-faulty]="selectedMeter.status === 'faulty'">
                {{ selectedMeter.status || 'unknown' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Smart Meter</span>
              <span class="detail-value">{{ selectedMeter.isSmartMeter ? 'Yes' : 'No' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Current Reading</span>
              <span class="detail-value">{{ selectedMeter.currentReading != null ? (selectedMeter.currentReading | number:'1.0-2') : '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Sanctioned Load</span>
              <span class="detail-value">{{ selectedMeter.sanctionedLoad != null ? selectedMeter.sanctionedLoad : '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Rate Per Unit</span>
              <span class="detail-value">{{ selectedMeter.ratePerUnit != null ? (selectedMeter.ratePerUnit | number:'1.0-2') : '-' }}</span>
            </div>
          </div>

          <!-- Readings History -->
          <div class="readings-section">
            <h4>Readings History</h4>
            <div class="loading" *ngIf="loadingReadings">Loading readings...</div>
            <table *ngIf="!loadingReadings && readings.length > 0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reading</th>
                  <th>Previous</th>
                  <th>Consumption</th>
                  <th>Type</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of readings">
                  <td>{{ r.readingDate ? (r.readingDate | date:'mediumDate') : (r.createdAt | date:'mediumDate') }}</td>
                  <td>{{ r.currentReading != null ? (r.currentReading | number:'1.0-2') : '-' }}</td>
                  <td>{{ r.previousReading != null ? (r.previousReading | number:'1.0-2') : '-' }}</td>
                  <td>{{ r.consumption != null ? (r.consumption | number:'1.0-2') : '-' }}</td>
                  <td>
                    <span class="badge badge-reading-type">{{ r.readingType || 'manual' }}</span>
                  </td>
                  <td>{{ r.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
            <div class="empty" *ngIf="!loadingReadings && readings.length === 0">No readings recorded yet</div>
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
    .filter-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; background: #fff; cursor: pointer; }
    .filter-select:focus { outline: none; border-color: #4fc3f7; }

    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
    .stat-label { font-size: 12px; color: #888; margin-top: 4px; }

    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #333; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }

    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-faulty { background: #fff3e0; color: #e65100; }
    .badge-reading-type { background: #e3f2fd; color: #1565c0; }

    .type-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .type-electricity { background: #fff9c4; color: #f57f17; }
    .type-water { background: #e3f2fd; color: #1565c0; }
    .type-gas { background: #fce4ec; color: #c62828; }
    .type-solar { background: #e8f5e9; color: #2e7d32; }
    .type-dg { background: #f3e5f5; color: #7b1fa2; }
    .type-other { background: #f0f0f0; color: #555; }

    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }

    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-card { background: #fff; border-radius: 10px; padding: 24px; width: 400px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); max-height: 85vh; overflow-y: auto; }
    .modal-lg { width: 700px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .modal-header h3 { margin: 0; color: #333; font-size: 16px; }
    .btn-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #999; padding: 0 4px; line-height: 1; }
    .btn-close:hover { color: #333; }

    /* Detail Grid */
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
    .detail-item { display: flex; flex-direction: column; }
    .detail-label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 2px; }
    .detail-value { font-size: 14px; color: #333; }

    /* Readings Section */
    .readings-section { margin-top: 8px; }
    .readings-section h4 { margin: 0 0 12px; color: #333; font-size: 14px; }
    .readings-section table { font-size: 12px; }
    .readings-section th, .readings-section td { padding: 8px 10px; font-size: 12px; }
  `]
})
export class EnergyMetersComponent implements OnInit {
  meters: any[] = [];
  filteredMeters: any[] = [];
  readings: any[] = [];
  loading = false;
  loadingReadings = false;
  search = '';
  statusFilter = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;

  stats: any = { totalMeters: 0, activeMeters: 0, inactiveMeters: 0, totalConsumption: 0 };

  showDetailsModal = false;
  selectedMeter: any = null;

  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
    this.loadStats();
  }

  loadData(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;
    if (this.statusFilter) params.status = this.statusFilter;

    this.api.get<any>('/energy-meters', params).subscribe({
      next: (res) => {
        this.meters = res.data?.meters || res.data?.energyMeters || res.data || [];
        this.total = res.data?.total || res.data?.pagination?.total || this.meters.length;
        this.totalPages = res.data?.pagination?.totalPages || Math.ceil(this.total / this.limit);
        this.applyClientFilters();
        this.loading = false;
      },
      error: () => {
        this.meters = [];
        this.filteredMeters = [];
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.api.get<any>('/energy-meters/stats').subscribe({
      next: (res) => {
        const data = res.data || res;
        this.stats = {
          totalMeters: data.totalMeters || data.total || 0,
          activeMeters: data.activeMeters || data.active || 0,
          inactiveMeters: data.inactiveMeters || data.inactive || 0,
          totalConsumption: data.totalConsumption || data.consumption || 0,
        };
      },
      error: () => {
        this.computeStatsFromData();
      }
    });
  }

  computeStatsFromData(): void {
    this.stats = {
      totalMeters: this.meters.length,
      activeMeters: this.meters.filter((m: any) => m.status === 'active').length,
      inactiveMeters: this.meters.filter((m: any) => m.status !== 'active').length,
      totalConsumption: this.meters.reduce((sum: number, m: any) => sum + (parseFloat(m.currentReading) || 0), 0),
    };
  }

  applyClientFilters(): void {
    let result = [...this.meters];

    if (this.search) {
      const q = this.search.toLowerCase();
      result = result.filter((m: any) =>
        (m.meterNumber || '').toLowerCase().includes(q) ||
        (m.name || '').toLowerCase().includes(q) ||
        (m.location || '').toLowerCase().includes(q) ||
        (m.meterType || m.type || '').toLowerCase().includes(q)
      );
    }

    if (this.statusFilter) {
      result = result.filter((m: any) => m.status === this.statusFilter);
    }

    this.filteredMeters = result;
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 400);
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadData();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadData();
    }
  }

  viewDetails(meter: any): void {
    this.selectedMeter = meter;
    this.showDetailsModal = true;
    this.loadReadings(meter.id);
  }

  loadReadings(meterId: string): void {
    this.loadingReadings = true;
    this.readings = [];

    this.api.get<any>(`/energy-meters/${meterId}/readings`).subscribe({
      next: (res) => {
        this.readings = res.data?.readings || res.data || [];
        this.loadingReadings = false;
      },
      error: () => {
        this.readings = [];
        this.loadingReadings = false;
      }
    });
  }

  closeModal(event: any): void {
    if (event.target === event.currentTarget) {
      this.showDetailsModal = false;
    }
  }
}
