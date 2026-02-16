import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-intercom',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Intercom</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'devices'" (click)="activeTab = 'devices'; loadDevices()">Devices</button>
        <button class="tab" [class.active]="activeTab === 'calls'" (click)="activeTab = 'calls'; loadCalls()">Call Logs</button>
      </div>

      <!-- DEVICES TAB -->
      <div *ngIf="activeTab === 'devices'">
        <div class="card form-card" *ngIf="showDeviceForm">
          <h3>{{ editingDeviceId ? 'Edit Device' : 'Add Device' }}</h3>
          <form (ngSubmit)="saveDevice()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="deviceForm.name" name="dname" required placeholder="Device name"></div>
              <div class="form-group"><label>Location *</label><input type="text" [(ngModel)]="deviceForm.location" name="dloc" required placeholder="e.g. Main Gate, Lobby"></div>
              <div class="form-group"><label>Unit ID</label><input type="text" [(ngModel)]="deviceForm.unitId" name="dunit" placeholder="Unit ID"></div>
              <div class="form-group">
                <label>Device Type *</label>
                <select [(ngModel)]="deviceForm.deviceType" name="dtype" required>
                  <option value="">Select Type</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="gate">Gate</option>
                  <option value="lobby">Lobby</option>
                </select>
              </div>
              <div class="form-group"><label>IP Address</label><input type="text" [(ngModel)]="deviceForm.ipAddress" name="dip" placeholder="e.g. 192.168.1.100"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showDeviceForm = false; editingDeviceId = ''">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Intercom Devices</span><button class="btn btn-primary btn-sm" (click)="openAddDevice()" *ngIf="!showDeviceForm">+ Add Device</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <div class="table-wrap" *ngIf="!loading">
            <table>
              <thead>
                <tr><th>Name</th><th>Location</th><th>Unit</th><th>Type</th><th>Status</th><th>Last Active</th><th>Actions</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of devices">
                  <td class="name-cell">{{ d.name }}</td>
                  <td>{{ d.location || '-' }}</td>
                  <td>{{ d.unitId || d.unit?.name || '-' }}</td>
                  <td><span class="code-badge">{{ d.deviceType || '-' }}</span></td>
                  <td>
                    <span class="badge" [class.badge-active]="d.status === 'online'" [class.badge-inactive]="d.status === 'offline'">
                      {{ d.status === 'online' ? 'Online' : 'Offline' }}
                    </span>
                  </td>
                  <td>{{ d.lastActive ? (d.lastActive | date:'medium') : '-' }}</td>
                  <td>
                    <button class="btn btn-primary btn-sm" (click)="editDevice(d)">Edit</button>
                  </td>
                </tr>
                <tr *ngIf="devices.length === 0"><td colspan="7" class="empty">No devices found</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- CALL LOGS TAB -->
      <div *ngIf="activeTab === 'calls'">
        <!-- Filters -->
        <div class="filters-bar">
          <div class="form-group">
            <label>From Date</label>
            <input type="date" [(ngModel)]="callFilterFrom" name="cfrom">
          </div>
          <div class="form-group">
            <label>To Date</label>
            <input type="date" [(ngModel)]="callFilterTo" name="cto">
          </div>
          <button class="btn btn-primary btn-sm" (click)="loadCalls()">Filter</button>
          <button class="btn btn-secondary btn-sm" (click)="loadMyCalls()">My Calls</button>
        </div>

        <div class="card">
          <div class="card-header"><span>Call Logs</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <div class="table-wrap" *ngIf="!loading">
            <table>
              <thead>
                <tr><th>From</th><th>To</th><th>Type</th><th>Started At</th><th>Duration</th><th>Status</th><th>Door Opened</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of calls">
                  <td class="name-cell">{{ c.from || c.fromDevice?.name || '-' }}</td>
                  <td>{{ c.to || c.toDevice?.name || '-' }}</td>
                  <td><span class="code-badge">{{ c.type || c.callType || '-' }}</span></td>
                  <td>{{ c.startedAt ? (c.startedAt | date:'medium') : (c.createdAt ? (c.createdAt | date:'medium') : '-') }}</td>
                  <td>{{ c.duration ? c.duration + 's' : '-' }}</td>
                  <td>
                    <span class="badge"
                      [class.badge-active]="c.status === 'answered'"
                      [class.badge-inactive]="c.status === 'missed'"
                      [class.badge-pending]="c.status === 'rejected'">
                      {{ c.status | titlecase }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [class.badge-active]="c.doorOpened" [class.badge-inactive]="!c.doorOpened">
                      {{ c.doorOpened ? 'Yes' : 'No' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="calls.length === 0"><td colspan="7" class="empty">No call logs found</td></tr>
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
    .filters-bar { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 16px; flex-wrap: wrap; }
    .filters-bar .form-group { display: flex; flex-direction: column; }
    .filters-bar .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .filters-bar .form-group input, .filters-bar .form-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #333; }
    .form-card { margin-bottom: 16px; }
    .form-card h3 { margin: 0 0 16px; color: #333; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-group input, .form-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #4fc3f7; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
    .error-msg { color: #f44336; font-size: 13px; margin-top: 8px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; white-space: nowrap; }
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
  `]
})
export class IntercomComponent implements OnInit {
  activeTab = 'devices';
  loading = false;
  saving = false;
  formError = '';

  // Devices
  devices: any[] = [];
  showDeviceForm = false;
  editingDeviceId = '';
  deviceForm: any = { name: '', location: '', unitId: '', deviceType: '', ipAddress: '' };

  // Call Logs
  calls: any[] = [];
  callFilterFrom = '';
  callFilterTo = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  // ---- DEVICES ----

  loadDevices(): void {
    this.loading = true;
    this.api.get<any>('/intercom/devices').subscribe({
      next: (res) => { this.devices = res.data?.devices || res.data || []; this.loading = false; },
      error: () => { this.devices = []; this.loading = false; }
    });
  }

  openAddDevice(): void {
    this.editingDeviceId = '';
    this.deviceForm = { name: '', location: '', unitId: '', deviceType: '', ipAddress: '' };
    this.formError = '';
    this.showDeviceForm = true;
  }

  editDevice(d: any): void {
    this.editingDeviceId = d.id || d._id;
    this.deviceForm = {
      name: d.name || '',
      location: d.location || '',
      unitId: d.unitId || '',
      deviceType: d.deviceType || '',
      ipAddress: d.ipAddress || ''
    };
    this.formError = '';
    this.showDeviceForm = true;
  }

  saveDevice(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingDeviceId
      ? this.api.put<any>(`/intercom/devices/${this.editingDeviceId}`, this.deviceForm)
      : this.api.post<any>('/intercom/devices', this.deviceForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showDeviceForm = false; this.editingDeviceId = ''; this.loadDevices(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save device'; }
    });
  }

  // ---- CALL LOGS ----

  loadCalls(): void {
    this.loading = true;
    const params: any = {};
    if (this.callFilterFrom) params.from = this.callFilterFrom;
    if (this.callFilterTo) params.to = this.callFilterTo;
    this.api.get<any>('/intercom/calls', params).subscribe({
      next: (res) => { this.calls = res.data?.calls || res.data || []; this.loading = false; },
      error: () => { this.calls = []; this.loading = false; }
    });
  }

  loadMyCalls(): void {
    this.loading = true;
    const params: any = {};
    if (this.callFilterFrom) params.from = this.callFilterFrom;
    if (this.callFilterTo) params.to = this.callFilterTo;
    this.api.get<any>('/intercom/calls/my', params).subscribe({
      next: (res) => { this.calls = res.data?.calls || res.data || []; this.loading = false; },
      error: () => { this.calls = []; this.loading = false; }
    });
  }
}
