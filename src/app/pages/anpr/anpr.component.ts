import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-anpr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>ANPR Management</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'detections'" (click)="activeTab = 'detections'; loadDetections()">Detections</button>
        <button class="tab" [class.active]="activeTab === 'cameras'" (click)="activeTab = 'cameras'; loadCameras()">Cameras</button>
        <button class="tab" [class.active]="activeTab === 'blacklist'" (click)="activeTab = 'blacklist'; loadBlacklist()">Blacklist</button>
        <button class="tab" [class.active]="activeTab === 'alerts'" (click)="activeTab = 'alerts'; loadAlerts()">Alerts</button>
        <button class="tab" [class.active]="activeTab === 'statistics'" (click)="activeTab = 'statistics'; loadStatistics()">Statistics</button>
      </div>

      <!-- DETECTIONS TAB -->
      <div *ngIf="activeTab === 'detections'">
        <div class="card filter-card">
          <div class="filter-bar">
            <div class="form-group">
              <label>From Date</label>
              <input type="date" [(ngModel)]="detectionFilter.fromDate" name="dfrom" (change)="loadDetections()">
            </div>
            <div class="form-group">
              <label>To Date</label>
              <input type="date" [(ngModel)]="detectionFilter.toDate" name="dto" (change)="loadDetections()">
            </div>
            <div class="form-group">
              <label>Plate Number</label>
              <input type="text" [(ngModel)]="detectionFilter.plateNumber" name="dplate" placeholder="Search plate..." (keyup.enter)="loadDetections()">
            </div>
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="detectionFilter.type" name="dtype" (change)="loadDetections()">
                <option value="">All</option>
                <option value="entry">Entry</option>
                <option value="exit">Exit</option>
              </select>
            </div>
            <div class="form-group">
              <label>Registered</label>
              <select [(ngModel)]="detectionFilter.isRegistered" name="dreg" (change)="loadDetections()">
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div class="form-group filter-action">
              <button class="btn btn-primary" (click)="loadDetections()">Search</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Detections</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Vehicle Type</th>
                <th>Detection Type</th>
                <th>Camera</th>
                <th>Confidence %</th>
                <th>Registered</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of detections">
                <td class="name-cell">{{ d.plateNumber || d.vehicleNumber || '-' }}</td>
                <td>{{ d.vehicleType || '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="d.type === 'entry'" [class.badge-pending]="d.type === 'exit'">
                    {{ d.type || '-' }}
                  </span>
                </td>
                <td>{{ d.cameraName || d.camera || '-' }}</td>
                <td>{{ d.confidence != null ? d.confidence + '%' : '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="d.isRegistered" [class.badge-inactive]="!d.isRegistered">
                    {{ d.isRegistered ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>{{ d.detectedAt ? (d.detectedAt | date:'medium') : (d.createdAt ? (d.createdAt | date:'medium') : '-') }}</td>
              </tr>
              <tr *ngIf="detections.length === 0"><td colspan="7" class="empty">No detections found</td></tr>
            </tbody>
          </table>
          <div class="pagination" *ngIf="detections.length > 0">
            <button class="btn btn-secondary btn-sm" [disabled]="detectionPage <= 1" (click)="detectionPage = detectionPage - 1; loadDetections()">Previous</button>
            <span class="page-info">Page {{ detectionPage }}</span>
            <button class="btn btn-secondary btn-sm" [disabled]="detections.length < detectionLimit" (click)="detectionPage = detectionPage + 1; loadDetections()">Next</button>
          </div>
        </div>
      </div>

      <!-- CAMERAS TAB -->
      <div *ngIf="activeTab === 'cameras'">
        <div class="card form-card" *ngIf="showCameraForm">
          <h3>{{ editingCameraId ? 'Edit Camera' : 'Add Camera' }}</h3>
          <form (ngSubmit)="saveCamera()">
            <div class="form-grid">
              <div class="form-group">
                <label>Name *</label>
                <input type="text" [(ngModel)]="cameraForm.name" name="camname" required placeholder="Camera name">
              </div>
              <div class="form-group">
                <label>Type *</label>
                <select [(ngModel)]="cameraForm.cameraType" name="camtype" required>
                  <option value="">Select Type</option>
                  <option value="entry">Entry</option>
                  <option value="exit">Exit</option>
                  <option value="both">Both</option>
                  <option value="parking">Parking</option>
                </select>
              </div>
              <div class="form-group">
                <label>Gate ID</label>
                <input type="text" [(ngModel)]="cameraForm.gateId" name="camgate" placeholder="Gate identifier">
              </div>
              <div class="form-group">
                <label>RTSP URL</label>
                <input type="text" [(ngModel)]="cameraForm.rtspUrl" name="camrtsp" placeholder="rtsp://...">
              </div>
              <div class="form-group">
                <label>IP Address</label>
                <input type="text" [(ngModel)]="cameraForm.ipAddress" name="camip" placeholder="192.168.x.x">
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelCameraForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <span>ANPR Cameras</span>
            <button class="btn btn-primary btn-sm" (click)="showCameraForm = true" *ngIf="!showCameraForm">+ Add Camera</button>
          </div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Gate</th>
                <th>Status</th>
                <th>IP Address</th>
                <th>Total Detections</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of cameras">
                <td class="name-cell">{{ c.name }}</td>
                <td>{{ c.cameraType || c.type || '-' }}</td>
                <td>{{ c.gateId || c.gate || '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="c.status === 'online'" [class.badge-inactive]="c.status === 'offline'">
                    {{ c.status || 'unknown' }}
                  </span>
                </td>
                <td>{{ c.ipAddress || '-' }}</td>
                <td>{{ c.totalDetections || 0 }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editCamera(c)">Edit</button>
                  <button class="btn btn-secondary btn-sm" (click)="testCamera(c)" [disabled]="testingCameraId === c.id">
                    {{ testingCameraId === c.id ? 'Testing...' : 'Test' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="cameras.length === 0"><td colspan="7" class="empty">No cameras found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BLACKLIST TAB -->
      <div *ngIf="activeTab === 'blacklist'">
        <div class="card form-card" *ngIf="showBlacklistForm">
          <h3>Add to Blacklist</h3>
          <form (ngSubmit)="addToBlacklist()">
            <div class="form-grid">
              <div class="form-group">
                <label>Vehicle Number *</label>
                <input type="text" [(ngModel)]="blacklistForm.vehicleNumber" name="blvehicle" required placeholder="e.g. ABC1234">
              </div>
              <div class="form-group">
                <label>Reason *</label>
                <input type="text" [(ngModel)]="blacklistForm.reason" name="blreason" required placeholder="Reason for blacklisting">
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Add</button>
              <button type="button" class="btn btn-secondary" (click)="showBlacklistForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <span>Blacklisted Vehicles</span>
            <button class="btn btn-primary btn-sm" (click)="showBlacklistForm = true" *ngIf="!showBlacklistForm">+ Add to Blacklist</button>
          </div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Reason</th>
                <th>Added Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of blacklist">
                <td class="name-cell">{{ b.vehicleNumber }}</td>
                <td>{{ b.reason || '-' }}</td>
                <td>{{ b.createdAt ? (b.createdAt | date:'medium') : '-' }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" (click)="removeFromBlacklist(b)">Remove</button>
                </td>
              </tr>
              <tr *ngIf="blacklist.length === 0"><td colspan="4" class="empty">No blacklisted vehicles</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ALERTS TAB -->
      <div *ngIf="activeTab === 'alerts'">
        <div class="card filter-card">
          <div class="filter-bar">
            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="alertFilter.status" name="astatus" (change)="loadAlerts()">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div class="form-group">
              <label>Severity</label>
              <select [(ngModel)]="alertFilter.severity" name="aseverity" (change)="loadAlerts()">
                <option value="">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Resolve Modal -->
        <div class="card form-card" *ngIf="resolvingAlert">
          <h3>Resolve Alert: {{ resolvingAlert.title }}</h3>
          <form (ngSubmit)="confirmResolve()">
            <div class="form-grid">
              <div class="form-group">
                <label>Resolution Type *</label>
                <select [(ngModel)]="resolveForm.resolutionType" name="restype" required>
                  <option value="">Select Type</option>
                  <option value="resolved">Resolved</option>
                  <option value="false_alarm">False Alarm</option>
                  <option value="escalated">Escalated</option>
                  <option value="no_action">No Action Needed</option>
                </select>
              </div>
              <div class="form-group">
                <label>Resolution Notes</label>
                <input type="text" [(ngModel)]="resolveForm.resolutionNotes" name="resnotes" placeholder="Add notes...">
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Resolve</button>
              <button type="button" class="btn btn-secondary" (click)="resolvingAlert = null">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>ANPR Alerts</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Title</th>
                <th>Plate</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of alerts">
                <td class="name-cell">{{ a.title || '-' }}</td>
                <td>{{ a.plateNumber || a.vehicleNumber || '-' }}</td>
                <td>{{ a.type || a.alertType || '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-severity-low]="a.severity === 'low'"
                    [class.badge-severity-medium]="a.severity === 'medium'"
                    [class.badge-severity-high]="a.severity === 'high'"
                    [class.badge-severity-critical]="a.severity === 'critical'">
                    {{ a.severity || '-' }}
                  </span>
                </td>
                <td>
                  <span class="badge"
                    [class.badge-active]="a.status === 'resolved'"
                    [class.badge-pending]="a.status === 'active'"
                    [class.badge-inactive]="a.status === 'acknowledged'">
                    {{ a.status || '-' }}
                  </span>
                </td>
                <td>{{ a.createdAt ? (a.createdAt | date:'medium') : '-' }}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" *ngIf="a.status === 'active'" (click)="acknowledgeAlert(a)">Acknowledge</button>
                  <button class="btn btn-primary btn-sm" *ngIf="a.status !== 'resolved'" (click)="resolveAlert(a)">Resolve</button>
                </td>
              </tr>
              <tr *ngIf="alerts.length === 0"><td colspan="7" class="empty">No alerts found</td></tr>
            </tbody>
          </table>
          <div class="pagination" *ngIf="alerts.length > 0">
            <button class="btn btn-secondary btn-sm" [disabled]="alertPage <= 1" (click)="alertPage = alertPage - 1; loadAlerts()">Previous</button>
            <span class="page-info">Page {{ alertPage }}</span>
            <button class="btn btn-secondary btn-sm" [disabled]="alerts.length < alertLimit" (click)="alertPage = alertPage + 1; loadAlerts()">Next</button>
          </div>
        </div>
      </div>

      <!-- STATISTICS TAB -->
      <div *ngIf="activeTab === 'statistics'">
        <div class="card filter-card">
          <div class="filter-bar">
            <div class="form-group">
              <label>From Date</label>
              <input type="date" [(ngModel)]="statsFilter.fromDate" name="sfrom" (change)="loadStatistics()">
            </div>
            <div class="form-group">
              <label>To Date</label>
              <input type="date" [(ngModel)]="statsFilter.toDate" name="sto" (change)="loadStatistics()">
            </div>
          </div>
        </div>

        <div class="loading" *ngIf="loading">Loading...</div>
        <div *ngIf="!loading">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.totalDetections || 0 }}</div>
              <div class="stat-label">Total Detections</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ statistics.entries || 0 }}</div>
              <div class="stat-label">Entries</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ statistics.exits || 0 }}</div>
              <div class="stat-label">Exits</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ statistics.registeredVehicles || 0 }}</div>
              <div class="stat-label">Registered Vehicles</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ statistics.unknownVehicles || 0 }}</div>
              <div class="stat-label">Unknown Vehicles</div>
            </div>
            <div class="stat-card stat-card-alert">
              <div class="stat-value">{{ statistics.blacklistAlerts || 0 }}</div>
              <div class="stat-label">Blacklist Alerts</div>
            </div>
          </div>

          <div class="card" *ngIf="topVehicles.length > 0" style="margin-top: 16px;">
            <div class="card-header"><span>Top 10 Detected Vehicles</span></div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Plate Number</th>
                  <th>Detection Count</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let v of topVehicles; let i = index">
                  <td>{{ i + 1 }}</td>
                  <td class="name-cell">{{ v.plateNumber || v.vehicleNumber || '-' }}</td>
                  <td>{{ v.count || v.detectionCount || 0 }}</td>
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
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #333; }
    .form-card { margin-bottom: 16px; }
    .form-card h3 { margin: 0 0 16px; color: #333; }
    .filter-card { margin-bottom: 16px; }
    .filter-bar { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-group input, .form-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #4fc3f7; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
    .filter-action { justify-content: flex-end; }
    .error-msg { color: #f44336; font-size: 13px; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active, .badge-completed { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-severity-low { background: #e8f5e9; color: #2e7d32; }
    .badge-severity-medium { background: #fff3e0; color: #e65100; }
    .badge-severity-high { background: #ffebee; color: #c62828; }
    .badge-severity-critical { background: #4a0000; color: #fff; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #eee; }
    .page-info { font-size: 13px; color: #666; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-card-alert { border-left: 4px solid #f44336; }
    .stat-value { font-size: 32px; font-weight: 700; color: #1a1a2e; }
    .stat-label { font-size: 13px; color: #888; margin-top: 4px; }
  `]
})
export class AnprComponent implements OnInit {
  activeTab = 'detections';
  loading = false;
  saving = false;
  formError = '';

  // Detections
  detections: any[] = [];
  detectionPage = 1;
  detectionLimit = 20;
  detectionFilter = { fromDate: '', toDate: '', plateNumber: '', type: '', isRegistered: '' };

  // Cameras
  cameras: any[] = [];
  showCameraForm = false;
  editingCameraId = '';
  testingCameraId = '';
  cameraForm = { name: '', cameraType: '', gateId: '', rtspUrl: '', ipAddress: '' };

  // Blacklist
  blacklist: any[] = [];
  showBlacklistForm = false;
  blacklistForm = { vehicleNumber: '', reason: '' };

  // Alerts
  alerts: any[] = [];
  alertPage = 1;
  alertLimit = 20;
  alertFilter = { status: '', severity: '' };
  resolvingAlert: any = null;
  resolveForm = { resolutionType: '', resolutionNotes: '' };

  // Statistics
  statistics: any = {};
  topVehicles: any[] = [];
  statsFilter = { fromDate: '', toDate: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadDetections(); }

  // ========== DETECTIONS ==========

  loadDetections(): void {
    this.loading = true;
    const params: any = { page: this.detectionPage, limit: this.detectionLimit };
    if (this.detectionFilter.fromDate) params.fromDate = this.detectionFilter.fromDate;
    if (this.detectionFilter.toDate) params.toDate = this.detectionFilter.toDate;
    if (this.detectionFilter.plateNumber) params.plateNumber = this.detectionFilter.plateNumber;
    if (this.detectionFilter.type) params.type = this.detectionFilter.type;
    if (this.detectionFilter.isRegistered) params.isRegistered = this.detectionFilter.isRegistered;
    this.api.get<any>('/anpr/detections', params).subscribe({
      next: (res) => { this.detections = res.data?.detections || res.data || []; this.loading = false; },
      error: () => { this.detections = []; this.loading = false; }
    });
  }

  // ========== CAMERAS ==========

  loadCameras(): void {
    this.loading = true;
    this.api.get<any>('/anpr/cameras').subscribe({
      next: (res) => { this.cameras = res.data?.cameras || res.data || []; this.loading = false; },
      error: () => { this.cameras = []; this.loading = false; }
    });
  }

  saveCamera(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingCameraId
      ? this.api.put<any>('/anpr/cameras/' + this.editingCameraId, this.cameraForm)
      : this.api.post<any>('/anpr/cameras', this.cameraForm);
    req$.subscribe({
      next: () => { this.saving = false; this.cancelCameraForm(); this.loadCameras(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save camera'; }
    });
  }

  editCamera(c: any): void {
    this.editingCameraId = c.id || c._id;
    this.cameraForm = {
      name: c.name || '',
      cameraType: c.cameraType || c.type || '',
      gateId: c.gateId || c.gate || '',
      rtspUrl: c.rtspUrl || '',
      ipAddress: c.ipAddress || ''
    };
    this.showCameraForm = true;
  }

  cancelCameraForm(): void {
    this.showCameraForm = false;
    this.editingCameraId = '';
    this.cameraForm = { name: '', cameraType: '', gateId: '', rtspUrl: '', ipAddress: '' };
    this.formError = '';
  }

  testCamera(c: any): void {
    const id = c.id || c._id;
    this.testingCameraId = id;
    this.api.post<any>('/anpr/cameras/' + id + '/test', {}).subscribe({
      next: (res) => {
        this.testingCameraId = '';
        alert(res.data?.message || 'Camera test successful');
      },
      error: (err) => {
        this.testingCameraId = '';
        alert(err.error?.message || 'Camera test failed');
      }
    });
  }

  // ========== BLACKLIST ==========

  loadBlacklist(): void {
    this.loading = true;
    this.api.get<any>('/anpr/blacklist').subscribe({
      next: (res) => { this.blacklist = res.data?.blacklist || res.data || []; this.loading = false; },
      error: () => { this.blacklist = []; this.loading = false; }
    });
  }

  addToBlacklist(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/anpr/blacklist', this.blacklistForm).subscribe({
      next: () => {
        this.saving = false;
        this.showBlacklistForm = false;
        this.blacklistForm = { vehicleNumber: '', reason: '' };
        this.loadBlacklist();
      },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to add to blacklist'; }
    });
  }

  removeFromBlacklist(b: any): void {
    if (confirm(`Remove "${b.vehicleNumber}" from blacklist?`)) {
      this.api.delete<any>('/anpr/blacklist/' + b.vehicleNumber).subscribe({
        next: () => this.loadBlacklist(),
        error: (err) => alert(err.error?.message || 'Failed to remove from blacklist')
      });
    }
  }

  // ========== ALERTS ==========

  loadAlerts(): void {
    this.loading = true;
    const params: any = { page: this.alertPage, limit: this.alertLimit };
    if (this.alertFilter.status) params.status = this.alertFilter.status;
    if (this.alertFilter.severity) params.severity = this.alertFilter.severity;
    this.api.get<any>('/anpr/alerts', params).subscribe({
      next: (res) => { this.alerts = res.data?.alerts || res.data || []; this.loading = false; },
      error: () => { this.alerts = []; this.loading = false; }
    });
  }

  acknowledgeAlert(a: any): void {
    const id = a.id || a._id;
    this.api.put<any>('/anpr/alerts/' + id + '/acknowledge', {}).subscribe({
      next: () => this.loadAlerts(),
      error: (err) => alert(err.error?.message || 'Failed to acknowledge alert')
    });
  }

  resolveAlert(a: any): void {
    this.resolvingAlert = a;
    this.resolveForm = { resolutionType: '', resolutionNotes: '' };
  }

  confirmResolve(): void {
    if (!this.resolvingAlert) return;
    this.saving = true;
    const id = this.resolvingAlert.id || this.resolvingAlert._id;
    this.api.put<any>('/anpr/alerts/' + id + '/resolve', this.resolveForm).subscribe({
      next: () => { this.saving = false; this.resolvingAlert = null; this.loadAlerts(); },
      error: (err) => { this.saving = false; alert(err.error?.message || 'Failed to resolve alert'); }
    });
  }

  // ========== STATISTICS ==========

  loadStatistics(): void {
    this.loading = true;
    const params: any = {};
    if (this.statsFilter.fromDate) params.fromDate = this.statsFilter.fromDate;
    if (this.statsFilter.toDate) params.toDate = this.statsFilter.toDate;
    this.api.get<any>('/anpr/statistics', params).subscribe({
      next: (res) => {
        const data = res.data || {};
        this.statistics = {
          totalDetections: data.totalDetections || 0,
          entries: data.entries || 0,
          exits: data.exits || 0,
          registeredVehicles: data.registeredVehicles || 0,
          unknownVehicles: data.unknownVehicles || 0,
          blacklistAlerts: data.blacklistAlerts || 0
        };
        this.topVehicles = data.topVehicles || [];
        this.loading = false;
      },
      error: () => { this.statistics = {}; this.topVehicles = []; this.loading = false; }
    });
  }
}
