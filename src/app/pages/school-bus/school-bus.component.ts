import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-school-bus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>School Bus Management</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'children'" (click)="activeTab = 'children'; loadChildren()">Children</button>
        <button class="tab" [class.active]="activeTab === 'buses'" (click)="activeTab = 'buses'; loadBuses()">Buses</button>
        <button class="tab" [class.active]="activeTab === 'routes'" (click)="activeTab = 'routes'; loadRoutes()">Routes</button>
        <button class="tab" [class.active]="activeTab === 'trips'" (click)="activeTab = 'trips'; loadTrips()">Trips</button>
        <button class="tab" [class.active]="activeTab === 'alerts'" (click)="activeTab = 'alerts'; loadAlerts()">Alerts</button>
      </div>

      <!-- CHILDREN TAB -->
      <div *ngIf="activeTab === 'children'">
        <div class="card form-card" *ngIf="showChildForm">
          <h3>{{ editingChildId ? 'Edit Child' : 'Add Child' }}</h3>
          <form (ngSubmit)="saveChild()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="childForm.name" name="cname" required placeholder="Child's full name"></div>
              <div class="form-group"><label>Date of Birth *</label><input type="date" [(ngModel)]="childForm.dateOfBirth" name="cdob" required></div>
              <div class="form-group"><label>Gender *</label>
                <select [(ngModel)]="childForm.gender" name="cgender" required>
                  <option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <div class="form-group"><label>School Name *</label><input type="text" [(ngModel)]="childForm.schoolName" name="cschool" required placeholder="School name"></div>
              <div class="form-group"><label>Grade *</label><input type="text" [(ngModel)]="childForm.grade" name="cgrade" required placeholder="e.g. 5"></div>
              <div class="form-group"><label>Section</label><input type="text" [(ngModel)]="childForm.section" name="csection" placeholder="e.g. A"></div>
              <div class="form-group"><label>Emergency Contact Name *</label><input type="text" [(ngModel)]="childForm.emergencyContact1Name" name="cecname" required placeholder="Parent/Guardian name"></div>
              <div class="form-group"><label>Emergency Contact Phone *</label><input type="text" [(ngModel)]="childForm.emergencyContact1Phone" name="cecphone" required placeholder="10-digit" maxlength="10"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelChildForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Children</span><button class="btn btn-primary btn-sm" (click)="showChildForm = true" *ngIf="!showChildForm">+ Add Child</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Age</th><th>School</th><th>Grade</th><th>Section</th><th>Uses Bus</th><th>Emergency Contact</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of children">
                <td class="name-cell">{{ c.name }}</td>
                <td>{{ c.age || '-' }}</td>
                <td>{{ c.schoolName || c.school || '-' }}</td>
                <td>{{ c.grade || '-' }}</td>
                <td>{{ c.section || '-' }}</td>
                <td><span class="badge" [class.badge-active]="c.usesBus" [class.badge-inactive]="!c.usesBus">{{ c.usesBus ? 'Yes' : 'No' }}</span></td>
                <td>{{ c.emergencyContact1Name || '-' }} {{ c.emergencyContact1Phone ? '(' + c.emergencyContact1Phone + ')' : '' }}</td>
                <td><span class="badge" [class.badge-active]="c.status === 'active'" [class.badge-inactive]="c.status !== 'active'">{{ c.status || 'active' }}</span></td>
                <td><button class="btn btn-primary btn-sm" (click)="editChild(c)">Edit</button></td>
              </tr>
              <tr *ngIf="children.length === 0"><td colspan="9" class="empty">No children found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BUSES TAB -->
      <div *ngIf="activeTab === 'buses'">
        <div class="card form-card" *ngIf="showBusForm">
          <h3>{{ editingBusId ? 'Edit Bus' : 'Add Bus' }}</h3>
          <form (ngSubmit)="saveBus()">
            <div class="form-grid">
              <div class="form-group"><label>Bus Number *</label><input type="text" [(ngModel)]="busForm.busNumber" name="bnum" required placeholder="e.g. BUS-001"></div>
              <div class="form-group"><label>Vehicle Number *</label><input type="text" [(ngModel)]="busForm.vehicleNumber" name="bvnum" required placeholder="e.g. KA-01-AB-1234"></div>
              <div class="form-group"><label>School Name *</label><input type="text" [(ngModel)]="busForm.schoolName" name="bschool" required placeholder="School name"></div>
              <div class="form-group"><label>Driver Name *</label><input type="text" [(ngModel)]="busForm.driverName" name="bdriver" required placeholder="Driver's full name"></div>
              <div class="form-group"><label>Driver Phone *</label><input type="text" [(ngModel)]="busForm.driverPhone" name="bdphone" required placeholder="10-digit" maxlength="10"></div>
              <div class="form-group"><label>Capacity *</label><input type="number" [(ngModel)]="busForm.capacity" name="bcap" required placeholder="e.g. 40"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelBusForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Buses</span><button class="btn btn-primary btn-sm" (click)="showBusForm = true" *ngIf="!showBusForm">+ Add Bus</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Bus #</th><th>Vehicle #</th><th>School</th><th>Driver</th><th>Driver Phone</th><th>Capacity</th><th>Status</th><th>Verified</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let b of buses">
                <td class="name-cell">{{ b.busNumber }}</td>
                <td>{{ b.vehicleNumber || '-' }}</td>
                <td>{{ b.schoolName || '-' }}</td>
                <td>{{ b.driverName || '-' }}</td>
                <td>{{ b.driverPhone || '-' }}</td>
                <td>{{ b.capacity || '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="b.status === 'parked'" [class.badge-pending]="b.status === 'en_route'">
                    {{ b.status || 'parked' }}
                  </span>
                </td>
                <td><span class="badge" [class.badge-active]="b.isVerified" [class.badge-inactive]="!b.isVerified">{{ b.isVerified ? 'Verified' : 'Unverified' }}</span></td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editBus(b)">Edit</button>
                  <button class="btn btn-success btn-sm" *ngIf="!b.isVerified" (click)="verifyBus(b)">Verify</button>
                </td>
              </tr>
              <tr *ngIf="buses.length === 0"><td colspan="9" class="empty">No buses found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ROUTES TAB -->
      <div *ngIf="activeTab === 'routes'">
        <div class="card form-card" *ngIf="showRouteForm">
          <h3>{{ editingRouteId ? 'Edit Route' : 'Add Route' }}</h3>
          <form (ngSubmit)="saveRoute()">
            <div class="form-grid">
              <div class="form-group"><label>Route Name *</label><input type="text" [(ngModel)]="routeForm.routeName" name="rname" required placeholder="e.g. Route A - Morning"></div>
              <div class="form-group"><label>Route Type *</label>
                <select [(ngModel)]="routeForm.routeType" name="rtype" required>
                  <option value="">Select Type</option><option value="pickup">Pickup</option><option value="drop">Drop</option>
                </select>
              </div>
              <div class="form-group"><label>Bus *</label>
                <select [(ngModel)]="routeForm.busId" name="rbus" required>
                  <option value="">Select Bus</option><option *ngFor="let b of buses" [value]="b.id">{{ b.busNumber }} - {{ b.vehicleNumber }}</option>
                </select>
              </div>
              <div class="form-group"><label>School Name *</label><input type="text" [(ngModel)]="routeForm.schoolName" name="rschool" required placeholder="School name"></div>
              <div class="form-group"><label>Start Time *</label><input type="time" [(ngModel)]="routeForm.startTime" name="rstart" required></div>
              <div class="form-group"><label>End Time *</label><input type="time" [(ngModel)]="routeForm.endTime" name="rend" required></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelRouteForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Routes</span><button class="btn btn-primary btn-sm" (click)="openRouteForm()" *ngIf="!showRouteForm">+ Add Route</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Route Name</th><th>Type</th><th>School</th><th>Bus</th><th>Start Time</th><th>End Time</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of routes">
                <td class="name-cell">{{ r.routeName }}</td>
                <td>
                  <span class="badge" [class.badge-active]="r.routeType === 'pickup'" [class.badge-pending]="r.routeType === 'drop'">
                    {{ r.routeType }}
                  </span>
                </td>
                <td>{{ r.schoolName || '-' }}</td>
                <td>{{ r.busNumber || r.bus?.busNumber || '-' }}</td>
                <td>{{ r.startTime || '-' }}</td>
                <td>{{ r.endTime || '-' }}</td>
                <td>{{ r.duration || '-' }}</td>
                <td><span class="badge" [class.badge-active]="r.status === 'active'" [class.badge-inactive]="r.status !== 'active'">{{ r.status || 'active' }}</span></td>
                <td><button class="btn btn-primary btn-sm" (click)="editRoute(r)">Edit</button></td>
              </tr>
              <tr *ngIf="routes.length === 0"><td colspan="9" class="empty">No routes found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TRIPS TAB -->
      <div *ngIf="activeTab === 'trips'">
        <div class="card form-card" *ngIf="showTripForm">
          <h3>Start New Trip</h3>
          <form (ngSubmit)="startTrip()">
            <div class="form-grid">
              <div class="form-group"><label>Bus *</label>
                <select [(ngModel)]="tripForm.busId" name="tbus" required>
                  <option value="">Select Bus</option><option *ngFor="let b of buses" [value]="b.id">{{ b.busNumber }} - {{ b.vehicleNumber }}</option>
                </select>
              </div>
              <div class="form-group"><label>Route *</label>
                <select [(ngModel)]="tripForm.routeId" name="troute" required>
                  <option value="">Select Route</option><option *ngFor="let r of routes" [value]="r.id">{{ r.routeName }}</option>
                </select>
              </div>
              <div class="form-group"><label>Trip Date *</label><input type="date" [(ngModel)]="tripForm.tripDate" name="tdate" required></div>
              <div class="form-group"><label>Trip Type *</label>
                <select [(ngModel)]="tripForm.tripType" name="ttype" required>
                  <option value="">Select Type</option><option value="pickup">Pickup</option><option value="drop">Drop</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Start Trip</button>
              <button type="button" class="btn btn-secondary" (click)="showTripForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Trip Filters -->
        <div class="card form-card">
          <div class="form-grid">
            <div class="form-group"><label>Date</label><input type="date" [(ngModel)]="tripFilter.date" name="tfdate" (change)="loadTrips()"></div>
            <div class="form-group"><label>Status</label>
              <select [(ngModel)]="tripFilter.status" name="tfstatus" (change)="loadTrips()">
                <option value="">All Statuses</option><option value="scheduled">Scheduled</option><option value="started">Started</option><option value="completed">Completed</option>
              </select>
            </div>
            <div class="form-group"><label>Bus</label>
              <select [(ngModel)]="tripFilter.busId" name="tfbus" (change)="loadTrips()">
                <option value="">All Buses</option><option *ngFor="let b of buses" [value]="b.id">{{ b.busNumber }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Trips</span><button class="btn btn-primary btn-sm" (click)="openTripForm()" *ngIf="!showTripForm">+ Start Trip</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Bus</th><th>Route</th><th>Date</th><th>Type</th><th>Scheduled Start</th><th>Actual Start</th><th>End</th><th>Boarded</th><th>Dropped</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let t of trips">
                <td class="name-cell">{{ t.busNumber || t.bus?.busNumber || '-' }}</td>
                <td>{{ t.routeName || t.route?.routeName || '-' }}</td>
                <td>{{ t.tripDate ? (t.tripDate | date:'mediumDate') : '-' }}</td>
                <td>{{ t.tripType || '-' }}</td>
                <td>{{ t.scheduledStart || '-' }}</td>
                <td>{{ t.actualStart ? (t.actualStart | date:'shortTime') : '-' }}</td>
                <td>{{ t.endTime ? (t.endTime | date:'shortTime') : '-' }}</td>
                <td>{{ t.boardedCount ?? '-' }}</td>
                <td>{{ t.droppedCount ?? '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-pending]="t.status === 'scheduled'"
                    [class.badge-started]="t.status === 'started'"
                    [class.badge-active]="t.status === 'completed'">
                    {{ t.status || 'scheduled' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-success btn-sm" *ngIf="t.status === 'started'" (click)="endTrip(t)">End Trip</button>
                </td>
              </tr>
              <tr *ngIf="trips.length === 0"><td colspan="11" class="empty">No trips found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ALERTS TAB -->
      <div *ngIf="activeTab === 'alerts'">
        <div class="card form-card" *ngIf="showAlertForm">
          <h3>Create Safety Alert</h3>
          <form (ngSubmit)="createAlert()">
            <div class="form-grid">
              <div class="form-group"><label>Alert Type *</label>
                <select [(ngModel)]="alertForm.alertType" name="atype" required>
                  <option value="">Select Type</option><option value="sos">SOS</option><option value="delay">Delay</option><option value="route_deviation">Route Deviation</option><option value="overspeeding">Overspeeding</option>
                </select>
              </div>
              <div class="form-group"><label>Severity *</label>
                <select [(ngModel)]="alertForm.severity" name="aseverity" required>
                  <option value="">Select Severity</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
              <div class="form-group"><label>Title *</label><input type="text" [(ngModel)]="alertForm.title" name="atitle" required placeholder="Alert title"></div>
              <div class="form-group"><label>Description</label><input type="text" [(ngModel)]="alertForm.description" name="adesc" placeholder="Alert description"></div>
              <div class="form-group"><label>Bus *</label>
                <select [(ngModel)]="alertForm.busId" name="abus" required>
                  <option value="">Select Bus</option><option *ngFor="let b of buses" [value]="b.id">{{ b.busNumber }} - {{ b.vehicleNumber }}</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Create Alert</button>
              <button type="button" class="btn btn-secondary" (click)="showAlertForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Resolve Modal -->
        <div class="card form-card" *ngIf="showResolveForm">
          <h3>Resolve Alert</h3>
          <form (ngSubmit)="resolveAlert()">
            <div class="form-grid">
              <div class="form-group"><label>Resolution *</label><input type="text" [(ngModel)]="resolveText" name="rtext" required placeholder="Describe how the alert was resolved"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Resolve</button>
              <button type="button" class="btn btn-secondary" (click)="showResolveForm = false; resolvingAlertId = ''">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Safety Alerts</span><button class="btn btn-primary btn-sm" (click)="openAlertForm()" *ngIf="!showAlertForm">+ Create Alert</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>Bus</th><th>Child</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of alerts">
                <td class="name-cell">{{ a.title }}</td>
                <td>
                  <span class="badge"
                    [class.badge-sos]="a.alertType === 'sos'"
                    [class.badge-pending]="a.alertType === 'delay'"
                    [class.badge-route]="a.alertType === 'route_deviation'"
                    [class.badge-speed]="a.alertType === 'overspeeding'">
                    {{ a.alertType }}
                  </span>
                </td>
                <td>
                  <span class="badge"
                    [class.badge-active]="a.severity === 'low'"
                    [class.badge-pending]="a.severity === 'medium'"
                    [class.badge-inactive]="a.severity === 'high' || a.severity === 'critical'">
                    {{ a.severity }}
                  </span>
                </td>
                <td>{{ a.busNumber || a.bus?.busNumber || '-' }}</td>
                <td>{{ a.childName || a.child?.name || '-' }}</td>
                <td><span class="badge" [class.badge-active]="a.status === 'resolved'" [class.badge-pending]="a.status === 'acknowledged'" [class.badge-inactive]="a.status === 'active'">{{ a.status || 'active' }}</span></td>
                <td>{{ a.createdAt ? (a.createdAt | date:'medium') : '-' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" *ngIf="a.status === 'active'" (click)="acknowledgeAlert(a)">Acknowledge</button>
                  <button class="btn btn-success btn-sm" *ngIf="a.status === 'active' || a.status === 'acknowledged'" (click)="openResolveForm(a)">Resolve</button>
                </td>
              </tr>
              <tr *ngIf="alerts.length === 0"><td colspan="8" class="empty">No alerts found</td></tr>
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
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active, .badge-completed { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-started { background: #e3f2fd; color: #1565c0; }
    .badge-sos { background: #ffebee; color: #c62828; }
    .badge-route { background: #f3e5f5; color: #7b1fa2; }
    .badge-speed { background: #fce4ec; color: #c62828; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-success { background: #4caf50; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class SchoolBusComponent implements OnInit {
  activeTab = 'children';
  loading = false;
  saving = false;
  formError = '';

  // Data arrays
  children: any[] = [];
  buses: any[] = [];
  routes: any[] = [];
  trips: any[] = [];
  alerts: any[] = [];

  // Children form
  showChildForm = false;
  editingChildId = '';
  childForm = { name: '', dateOfBirth: '', gender: '', schoolName: '', grade: '', section: '', emergencyContact1Name: '', emergencyContact1Phone: '' };

  // Buses form
  showBusForm = false;
  editingBusId = '';
  busForm = { busNumber: '', vehicleNumber: '', schoolName: '', driverName: '', driverPhone: '', capacity: '' };

  // Routes form
  showRouteForm = false;
  editingRouteId = '';
  routeForm = { routeName: '', routeType: '', busId: '', schoolName: '', startTime: '', endTime: '' };

  // Trips form
  showTripForm = false;
  tripForm = { busId: '', routeId: '', tripDate: '', tripType: '' };
  tripFilter = { date: '', status: '', busId: '' };

  // Alerts form
  showAlertForm = false;
  alertForm = { alertType: '', severity: '', title: '', description: '', busId: '' };
  showResolveForm = false;
  resolvingAlertId = '';
  resolveText = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadChildren(); }

  // ===== CHILDREN =====
  loadChildren(): void {
    this.loading = true;
    this.api.get<any>('/school-bus/children').subscribe({
      next: (res) => { this.children = res.data?.children || res.data || []; this.loading = false; },
      error: () => { this.children = []; this.loading = false; }
    });
  }

  saveChild(): void {
    this.saving = true; this.formError = '';
    const req$ = this.editingChildId
      ? this.api.put<any>(`/school-bus/children/${this.editingChildId}`, this.childForm)
      : this.api.post<any>('/school-bus/children', this.childForm);
    req$.subscribe({
      next: () => { this.saving = false; this.cancelChildForm(); this.loadChildren(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save'; }
    });
  }

  editChild(c: any): void {
    this.editingChildId = c.id;
    this.childForm = {
      name: c.name || '', dateOfBirth: c.dateOfBirth || '', gender: c.gender || '',
      schoolName: c.schoolName || '', grade: c.grade || '', section: c.section || '',
      emergencyContact1Name: c.emergencyContact1Name || '', emergencyContact1Phone: c.emergencyContact1Phone || ''
    };
    this.showChildForm = true;
  }

  cancelChildForm(): void {
    this.showChildForm = false; this.editingChildId = '';
    this.childForm = { name: '', dateOfBirth: '', gender: '', schoolName: '', grade: '', section: '', emergencyContact1Name: '', emergencyContact1Phone: '' };
  }

  // ===== BUSES =====
  loadBuses(): void {
    this.loading = true;
    this.api.get<any>('/school-bus/buses').subscribe({
      next: (res) => { this.buses = res.data?.buses || res.data || []; this.loading = false; },
      error: () => { this.buses = []; this.loading = false; }
    });
  }

  saveBus(): void {
    this.saving = true; this.formError = '';
    const req$ = this.editingBusId
      ? this.api.put<any>(`/school-bus/buses/${this.editingBusId}`, this.busForm)
      : this.api.post<any>('/school-bus/buses', this.busForm);
    req$.subscribe({
      next: () => { this.saving = false; this.cancelBusForm(); this.loadBuses(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save'; }
    });
  }

  editBus(b: any): void {
    this.editingBusId = b.id;
    this.busForm = {
      busNumber: b.busNumber || '', vehicleNumber: b.vehicleNumber || '', schoolName: b.schoolName || '',
      driverName: b.driverName || '', driverPhone: b.driverPhone || '', capacity: b.capacity || ''
    };
    this.showBusForm = true;
  }

  cancelBusForm(): void {
    this.showBusForm = false; this.editingBusId = '';
    this.busForm = { busNumber: '', vehicleNumber: '', schoolName: '', driverName: '', driverPhone: '', capacity: '' };
  }

  verifyBus(b: any): void {
    this.api.put<any>(`/school-bus/buses/${b.id}/verify`, {}).subscribe({
      next: () => this.loadBuses(),
      error: () => {}
    });
  }

  // ===== ROUTES =====
  loadRoutes(): void {
    this.loading = true;
    this.api.get<any>('/school-bus/routes').subscribe({
      next: (res) => { this.routes = res.data?.routes || res.data || []; this.loading = false; },
      error: () => { this.routes = []; this.loading = false; }
    });
  }

  openRouteForm(): void {
    if (this.buses.length === 0) {
      this.api.get<any>('/school-bus/buses').subscribe({
        next: (res) => { this.buses = res.data?.buses || res.data || []; this.showRouteForm = true; },
        error: () => { this.showRouteForm = true; }
      });
    } else {
      this.showRouteForm = true;
    }
  }

  saveRoute(): void {
    this.saving = true; this.formError = '';
    const req$ = this.editingRouteId
      ? this.api.put<any>(`/school-bus/routes/${this.editingRouteId}`, this.routeForm)
      : this.api.post<any>('/school-bus/routes', this.routeForm);
    req$.subscribe({
      next: () => { this.saving = false; this.cancelRouteForm(); this.loadRoutes(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save'; }
    });
  }

  editRoute(r: any): void {
    this.editingRouteId = r.id;
    this.routeForm = {
      routeName: r.routeName || '', routeType: r.routeType || '', busId: r.busId || '',
      schoolName: r.schoolName || '', startTime: r.startTime || '', endTime: r.endTime || ''
    };
    if (this.buses.length === 0) {
      this.api.get<any>('/school-bus/buses').subscribe({
        next: (res) => { this.buses = res.data?.buses || res.data || []; this.showRouteForm = true; },
        error: () => { this.showRouteForm = true; }
      });
    } else {
      this.showRouteForm = true;
    }
  }

  cancelRouteForm(): void {
    this.showRouteForm = false; this.editingRouteId = '';
    this.routeForm = { routeName: '', routeType: '', busId: '', schoolName: '', startTime: '', endTime: '' };
  }

  // ===== TRIPS =====
  loadTrips(): void {
    this.loading = true;
    const params: any = {};
    if (this.tripFilter.date) params.date = this.tripFilter.date;
    if (this.tripFilter.status) params.status = this.tripFilter.status;
    if (this.tripFilter.busId) params.busId = this.tripFilter.busId;
    this.api.get<any>('/school-bus/trips', params).subscribe({
      next: (res) => { this.trips = res.data?.trips || res.data || []; this.loading = false; },
      error: () => { this.trips = []; this.loading = false; }
    });
  }

  openTripForm(): void {
    if (this.buses.length === 0 || this.routes.length === 0) {
      this.api.get<any>('/school-bus/buses').subscribe({
        next: (res) => {
          this.buses = res.data?.buses || res.data || [];
          this.api.get<any>('/school-bus/routes').subscribe({
            next: (res2) => { this.routes = res2.data?.routes || res2.data || []; this.showTripForm = true; },
            error: () => { this.showTripForm = true; }
          });
        },
        error: () => { this.showTripForm = true; }
      });
    } else {
      this.showTripForm = true;
    }
  }

  startTrip(): void {
    this.saving = true; this.formError = '';
    this.api.post<any>('/school-bus/trips/start', this.tripForm).subscribe({
      next: () => { this.saving = false; this.showTripForm = false; this.tripForm = { busId: '', routeId: '', tripDate: '', tripType: '' }; this.loadTrips(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to start trip'; }
    });
  }

  endTrip(t: any): void {
    if (confirm('End this trip?')) {
      this.api.put<any>(`/school-bus/trips/${t.id}/end`, {}).subscribe({
        next: () => this.loadTrips(),
        error: () => {}
      });
    }
  }

  // ===== ALERTS =====
  loadAlerts(): void {
    this.loading = true;
    this.api.get<any>('/school-bus/alerts').subscribe({
      next: (res) => { this.alerts = res.data?.alerts || res.data || []; this.loading = false; },
      error: () => { this.alerts = []; this.loading = false; }
    });
  }

  openAlertForm(): void {
    if (this.buses.length === 0) {
      this.api.get<any>('/school-bus/buses').subscribe({
        next: (res) => { this.buses = res.data?.buses || res.data || []; this.showAlertForm = true; },
        error: () => { this.showAlertForm = true; }
      });
    } else {
      this.showAlertForm = true;
    }
  }

  createAlert(): void {
    this.saving = true; this.formError = '';
    this.api.post<any>('/school-bus/alerts', this.alertForm).subscribe({
      next: () => { this.saving = false; this.showAlertForm = false; this.alertForm = { alertType: '', severity: '', title: '', description: '', busId: '' }; this.loadAlerts(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to create alert'; }
    });
  }

  acknowledgeAlert(a: any): void {
    this.api.put<any>(`/school-bus/alerts/${a.id}/acknowledge`, {}).subscribe({
      next: () => this.loadAlerts(),
      error: () => {}
    });
  }

  openResolveForm(a: any): void {
    this.resolvingAlertId = a.id;
    this.resolveText = '';
    this.showResolveForm = true;
  }

  resolveAlert(): void {
    this.saving = true;
    this.api.put<any>(`/school-bus/alerts/${this.resolvingAlertId}/resolve`, { resolution: this.resolveText }).subscribe({
      next: () => { this.saving = false; this.showResolveForm = false; this.resolvingAlertId = ''; this.resolveText = ''; this.loadAlerts(); },
      error: () => { this.saving = false; }
    });
  }
}
