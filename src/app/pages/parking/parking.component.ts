import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Parking Management</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'zones'" (click)="activeTab = 'zones'; loadZones(); loadStats()">Zones</button>
        <button class="tab" [class.active]="activeTab === 'slots'" (click)="activeTab = 'slots'; loadZones(); loadSlots()">Slots</button>
        <button class="tab" [class.active]="activeTab === 'sessions'" (click)="activeTab = 'sessions'; loadSessions()">Sessions</button>
        <button class="tab" [class.active]="activeTab === 'violations'" (click)="activeTab = 'violations'; loadViolations()">Violations</button>
      </div>

      <!-- ZONES TAB -->
      <div *ngIf="activeTab === 'zones'">

        <!-- Stats Cards -->
        <div class="stats-row" *ngIf="stats">
          <div class="stat-card"><div class="stat-value">{{ stats.totalZones || 0 }}</div><div class="stat-label">Total Zones</div></div>
          <div class="stat-card"><div class="stat-value">{{ stats.totalSlots || 0 }}</div><div class="stat-label">Total Slots</div></div>
          <div class="stat-card"><div class="stat-value">{{ stats.occupiedSlots || 0 }}</div><div class="stat-label">Occupied</div></div>
          <div class="stat-card"><div class="stat-value">{{ stats.availableSlots || 0 }}</div><div class="stat-label">Available</div></div>
          <div class="stat-card"><div class="stat-value">{{ stats.activeSessions || 0 }}</div><div class="stat-label">Active Sessions</div></div>
          <div class="stat-card"><div class="stat-value">{{ stats.todayRevenue || 0 }}</div><div class="stat-label">Today Revenue</div></div>
        </div>

        <div class="card form-card" *ngIf="showZoneForm">
          <h3>Add Zone</h3>
          <form (ngSubmit)="saveZone()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="zoneForm.name" name="zname" required placeholder="e.g. Basement A"></div>
              <div class="form-group"><label>Code *</label><input type="text" [(ngModel)]="zoneForm.code" name="zcode" required placeholder="e.g. BA-01"></div>
              <div class="form-group"><label>Type *</label>
                <select [(ngModel)]="zoneForm.type" name="ztype" required>
                  <option value="">Select Type</option>
                  <option value="basement">Basement</option>
                  <option value="open">Open</option>
                  <option value="covered">Covered</option>
                  <option value="multilevel">Multilevel</option>
                  <option value="valet">Valet</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>
              <div class="form-group"><label>Level</label><input type="text" [(ngModel)]="zoneForm.level" name="zlevel" placeholder="e.g. B1, G, L1"></div>
              <div class="form-group"><label>Total Slots *</label><input type="number" [(ngModel)]="zoneForm.totalSlots" name="ztotal" required placeholder="e.g. 50"></div>
              <div class="form-group"><label>Hourly Rate</label><input type="number" [(ngModel)]="zoneForm.hourlyRate" name="zrate" placeholder="0.00"></div>
              <div class="form-group form-group-checkbox">
                <label><input type="checkbox" [(ngModel)]="zoneForm.isPaid" name="zpaid"> Paid Parking</label>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showZoneForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Parking Zones</span><button class="btn btn-primary btn-sm" (click)="showZoneForm = true" *ngIf="!showZoneForm">+ Add Zone</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Code</th><th>Type</th><th>Level</th><th>Total Slots</th><th>Available</th><th>Reserved</th><th>Visitor</th><th>EV Charging</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let z of zones">
                <td class="name-cell">{{ z.name }}</td>
                <td><span class="code-badge">{{ z.code }}</span></td>
                <td>{{ z.type | titlecase }}</td>
                <td>{{ z.level || '-' }}</td>
                <td>{{ z.totalSlots || 0 }}</td>
                <td>{{ z.availableSlots || 0 }}</td>
                <td>{{ z.reservedSlots || 0 }}</td>
                <td>{{ z.visitorSlots || 0 }}</td>
                <td>{{ z.evChargingSlots || 0 }}</td>
                <td><span class="badge" [class.badge-active]="z.status === 'active'" [class.badge-inactive]="z.status !== 'active'">{{ z.status || 'active' }}</span></td>
              </tr>
              <tr *ngIf="zones.length === 0"><td colspan="10" class="empty">No zones found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SLOTS TAB -->
      <div *ngIf="activeTab === 'slots'">
        <!-- Zone Filter -->
        <div class="categories-bar" *ngIf="zones.length > 0">
          <span class="cat-chip" [class.active]="!selectedZone" (click)="selectedZone = ''; loadSlots()">All Zones</span>
          <span class="cat-chip" *ngFor="let z of zones" [class.active]="selectedZone === z.id" (click)="selectedZone = z.id; loadSlots()">{{ z.name }}</span>
        </div>

        <div class="card">
          <div class="card-header"><span>Parking Slots</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Slot #</th><th>Type</th><th>Size</th><th>Allocation</th><th>Occupancy</th><th>Allocated To</th><th>Vehicle #</th><th>EV Charger</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let s of slots">
                <td class="name-cell">{{ s.slotNumber || s.number }}</td>
                <td>{{ s.type || '-' }}</td>
                <td>{{ s.size || '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="s.allocationStatus === 'allocated'" [class.badge-pending]="s.allocationStatus === 'reserved'" [class.badge-inactive]="s.allocationStatus === 'unallocated' || !s.allocationStatus">
                    {{ s.allocationStatus || 'unallocated' }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class.badge-active]="s.occupancyStatus === 'occupied'" [class.badge-inactive]="s.occupancyStatus === 'vacant' || !s.occupancyStatus" [class.badge-pending]="s.occupancyStatus === 'reserved'">
                    {{ s.occupancyStatus || 'vacant' }}
                  </span>
                </td>
                <td>{{ s.allocatedTo || s.unitNumber || '-' }}</td>
                <td>{{ s.vehicleNumber || '-' }}</td>
                <td>{{ s.hasEvCharger ? 'Yes' : 'No' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" *ngIf="s.allocationStatus !== 'allocated'" (click)="openAllocate(s)">Allocate</button>
                  <button class="btn btn-danger btn-sm" *ngIf="s.allocationStatus === 'allocated'" (click)="releaseSlot(s)">Release</button>
                </td>
              </tr>
              <tr *ngIf="slots.length === 0"><td colspan="9" class="empty">No slots found</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Allocate Modal -->
        <div class="modal-overlay" *ngIf="showAllocateForm">
          <div class="modal-card">
            <h3>Allocate Slot {{ allocatingSlot?.slotNumber || allocatingSlot?.number }}</h3>
            <form (ngSubmit)="allocateSlot()">
              <div class="form-group"><label>Unit ID *</label><input type="text" [(ngModel)]="allocateForm.unitId" name="aunit" required placeholder="Enter unit ID"></div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="saving">Allocate</button>
                <button type="button" class="btn btn-secondary" (click)="showAllocateForm = false">Cancel</button>
              </div>
              <div class="error-msg" *ngIf="formError">{{ formError }}</div>
            </form>
          </div>
        </div>
      </div>

      <!-- SESSIONS TAB -->
      <div *ngIf="activeTab === 'sessions'">
        <!-- Entry Form -->
        <div class="card form-card" *ngIf="showEntryForm">
          <h3>Record Entry</h3>
          <form (ngSubmit)="recordEntry()">
            <div class="form-grid">
              <div class="form-group"><label>Vehicle Number *</label><input type="text" [(ngModel)]="entryForm.vehicleNumber" name="evnum" required placeholder="e.g. KA01AB1234"></div>
              <div class="form-group"><label>Vehicle Type *</label>
                <select [(ngModel)]="entryForm.vehicleType" name="evtype" required>
                  <option value="">Select Type</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="ev">EV</option>
                </select>
              </div>
              <div class="form-group"><label>Session Type *</label>
                <select [(ngModel)]="entryForm.sessionType" name="estype" required>
                  <option value="">Select Type</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>
              <div class="form-group"><label>Entry Gate ID *</label><input type="text" [(ngModel)]="entryForm.entryGateId" name="egate" required placeholder="Gate ID"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Record Entry</button>
              <button type="button" class="btn btn-secondary" (click)="showEntryForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Exit Form -->
        <div class="card form-card" *ngIf="showExitForm">
          <h3>Record Exit</h3>
          <form (ngSubmit)="recordExit()">
            <div class="form-grid">
              <div class="form-group"><label>Vehicle Number *</label><input type="text" [(ngModel)]="exitForm.vehicleNumber" name="xvnum" required placeholder="e.g. KA01AB1234"></div>
              <div class="form-group"><label>Exit Gate ID *</label><input type="text" [(ngModel)]="exitForm.exitGateId" name="xgate" required placeholder="Gate ID"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Record Exit</button>
              <button type="button" class="btn btn-secondary" (click)="showExitForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <span>Active Sessions</span>
            <div>
              <button class="btn btn-primary btn-sm" (click)="showEntryForm = true; showExitForm = false" *ngIf="!showEntryForm">+ Record Entry</button>
              <button class="btn btn-secondary btn-sm" (click)="showExitForm = true; showEntryForm = false" *ngIf="!showExitForm" style="margin-left: 4px;">Record Exit</button>
            </div>
          </div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Vehicle #</th><th>Vehicle Type</th><th>Driver</th><th>Entry Time</th><th>Exit Time</th><th>Duration</th><th>Gate In</th><th>Gate Out</th><th>Amount</th><th>Status</th><th>Payment</th></tr></thead>
            <tbody>
              <tr *ngFor="let s of sessions">
                <td class="name-cell">{{ s.vehicleNumber }}</td>
                <td>{{ s.vehicleType || '-' }}</td>
                <td>{{ s.driverName || s.driver || '-' }}</td>
                <td>{{ s.entryTime ? (s.entryTime | date:'medium') : '-' }}</td>
                <td>{{ s.exitTime ? (s.exitTime | date:'medium') : '-' }}</td>
                <td>{{ s.duration || '-' }}</td>
                <td>{{ s.entryGate || s.gateIn || '-' }}</td>
                <td>{{ s.exitGate || s.gateOut || '-' }}</td>
                <td>{{ s.amount != null ? s.amount : '-' }}</td>
                <td>
                  <span class="badge" [class.badge-active]="s.status === 'active' || s.status === 'parked'" [class.badge-completed]="s.status === 'completed'" [class.badge-inactive]="s.status === 'exited'">
                    {{ s.status || 'active' }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class.badge-active]="s.paymentStatus === 'paid'" [class.badge-pending]="s.paymentStatus === 'pending'" [class.badge-inactive]="s.paymentStatus === 'unpaid'">
                    {{ s.paymentStatus || 'pending' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="sessions.length === 0"><td colspan="11" class="empty">No active sessions found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- VIOLATIONS TAB -->
      <div *ngIf="activeTab === 'violations'">
        <div class="card form-card" *ngIf="showViolationForm">
          <h3>Report Violation</h3>
          <form (ngSubmit)="reportViolation()">
            <div class="form-grid">
              <div class="form-group"><label>Vehicle Number *</label><input type="text" [(ngModel)]="violationForm.vehicleNumber" name="vvnum" required placeholder="e.g. KA01AB1234"></div>
              <div class="form-group"><label>Violation Type *</label>
                <select [(ngModel)]="violationForm.violationType" name="vtype" required>
                  <option value="">Select Type</option>
                  <option value="wrong_slot">Wrong Slot</option>
                  <option value="overstay">Overstay</option>
                  <option value="unauthorized">Unauthorized</option>
                  <option value="double_parking">Double Parking</option>
                  <option value="no_permit">No Permit</option>
                  <option value="speeding">Speeding</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group"><label>Fine Amount</label><input type="number" [(ngModel)]="violationForm.fineAmount" name="vfine" placeholder="0.00"></div>
              <div class="form-group"><label>Location</label><input type="text" [(ngModel)]="violationForm.location" name="vloc" placeholder="e.g. Zone A, Slot 12"></div>
              <div class="form-group form-group-full"><label>Description</label><input type="text" [(ngModel)]="violationForm.description" name="vdesc" placeholder="Describe the violation"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Report</button>
              <button type="button" class="btn btn-secondary" (click)="showViolationForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Parking Violations</span><button class="btn btn-primary btn-sm" (click)="showViolationForm = true" *ngIf="!showViolationForm">+ Report Violation</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Vehicle #</th><th>Type</th><th>Description</th><th>Location</th><th>Fine Amount</th><th>Status</th><th>Reported By</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let v of violations">
                <td class="name-cell">{{ v.vehicleNumber }}</td>
                <td>{{ v.violationType || v.type }}</td>
                <td>{{ v.description || '-' }}</td>
                <td>{{ v.location || '-' }}</td>
                <td>{{ v.fineAmount != null ? v.fineAmount : '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-pending]="v.status === 'pending' || v.status === 'open'"
                    [class.badge-active]="v.status === 'resolved' || v.status === 'paid'"
                    [class.badge-inactive]="v.status === 'cancelled' || v.status === 'dismissed'">
                    {{ v.status || 'pending' }}
                  </span>
                </td>
                <td>{{ v.reportedBy || '-' }}</td>
                <td>{{ v.createdAt ? (v.createdAt | date:'mediumDate') : '-' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" *ngIf="v.status === 'pending' || v.status === 'open'" (click)="resolveViolation(v)">Resolve</button>
                </td>
              </tr>
              <tr *ngIf="violations.length === 0"><td colspan="9" class="empty">No violations found</td></tr>
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
    .stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 16px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
    .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
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
    .form-group-checkbox { flex-direction: row; align-items: center; padding-top: 20px; }
    .form-group-checkbox label { display: flex; align-items: center; gap: 6px; font-size: 13px; }
    .form-group-checkbox input[type="checkbox"] { width: 16px; height: 16px; }
    .form-group-full { grid-column: 1 / -1; }
    .form-actions { margin-top: 16px; display: flex; gap: 8px; }
    .error-msg { color: #f44336; font-size: 13px; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .code-badge { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active, .badge-completed { background: #e8f5e9; color: #2e7d32; }
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
    .modal-card { background: #fff; border-radius: 10px; padding: 24px; width: 400px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    .modal-card h3 { margin: 0 0 16px; color: #333; }
  `]
})
export class ParkingComponent implements OnInit {
  activeTab = 'zones';
  loading = false;
  saving = false;
  formError = '';

  // Data
  zones: any[] = [];
  slots: any[] = [];
  sessions: any[] = [];
  violations: any[] = [];
  stats: any = null;

  // Zone form
  showZoneForm = false;
  zoneForm = { name: '', code: '', type: '', level: '', totalSlots: null as number | null, isPaid: false, hourlyRate: null as number | null };

  // Slots
  selectedZone = '';
  showAllocateForm = false;
  allocatingSlot: any = null;
  allocateForm = { unitId: '' };

  // Sessions
  showEntryForm = false;
  showExitForm = false;
  entryForm = { vehicleNumber: '', vehicleType: '', sessionType: '', entryGateId: '' };
  exitForm = { vehicleNumber: '', exitGateId: '' };

  // Violations
  showViolationForm = false;
  violationForm = { vehicleNumber: '', violationType: '', description: '', fineAmount: null as number | null, location: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadZones();
    this.loadStats();
  }

  // ── Zones ──────────────────────────────────────────

  loadStats(): void {
    this.api.get<any>('/parking/stats').subscribe({
      next: (res) => { this.stats = res.data || res; },
      error: () => { this.stats = null; }
    });
  }

  loadZones(): void {
    this.loading = true;
    this.api.get<any>('/parking/zones').subscribe({
      next: (res) => { this.zones = res.data?.zones || res.data || []; this.loading = false; },
      error: () => { this.zones = []; this.loading = false; }
    });
  }

  saveZone(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/parking/zones', this.zoneForm).subscribe({
      next: () => {
        this.saving = false;
        this.showZoneForm = false;
        this.zoneForm = { name: '', code: '', type: '', level: '', totalSlots: null, isPaid: false, hourlyRate: null };
        this.loadZones();
        this.loadStats();
      },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save zone'; }
    });
  }

  // ── Slots ──────────────────────────────────────────

  loadSlots(): void {
    this.loading = true;
    const params: any = {};
    if (this.selectedZone) params.zoneId = this.selectedZone;
    this.api.get<any>('/parking/slots/available', params).subscribe({
      next: (res) => { this.slots = res.data?.slots || res.data || []; this.loading = false; },
      error: () => { this.slots = []; this.loading = false; }
    });
  }

  openAllocate(slot: any): void {
    this.allocatingSlot = slot;
    this.allocateForm = { unitId: '' };
    this.formError = '';
    this.showAllocateForm = true;
  }

  allocateSlot(): void {
    if (!this.allocatingSlot) return;
    this.saving = true;
    this.formError = '';
    this.api.put<any>(`/parking/slots/${this.allocatingSlot.id}/allocate`, this.allocateForm).subscribe({
      next: () => { this.saving = false; this.showAllocateForm = false; this.loadSlots(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to allocate slot'; }
    });
  }

  releaseSlot(slot: any): void {
    if (confirm(`Release slot "${slot.slotNumber || slot.number}"?`)) {
      this.api.put<any>(`/parking/slots/${slot.id}/release`, {}).subscribe({
        next: () => this.loadSlots(),
        error: () => {}
      });
    }
  }

  // ── Sessions ───────────────────────────────────────

  loadSessions(): void {
    this.loading = true;
    this.api.get<any>('/parking/sessions/active').subscribe({
      next: (res) => { this.sessions = res.data?.sessions || res.data || []; this.loading = false; },
      error: () => { this.sessions = []; this.loading = false; }
    });
  }

  recordEntry(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/parking/entry', this.entryForm).subscribe({
      next: () => {
        this.saving = false;
        this.showEntryForm = false;
        this.entryForm = { vehicleNumber: '', vehicleType: '', sessionType: '', entryGateId: '' };
        this.loadSessions();
      },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to record entry'; }
    });
  }

  recordExit(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/parking/exit', this.exitForm).subscribe({
      next: () => {
        this.saving = false;
        this.showExitForm = false;
        this.exitForm = { vehicleNumber: '', exitGateId: '' };
        this.loadSessions();
      },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to record exit'; }
    });
  }

  // ── Violations ─────────────────────────────────────

  loadViolations(): void {
    this.loading = true;
    this.api.get<any>('/parking/violations').subscribe({
      next: (res) => { this.violations = res.data?.violations || res.data || []; this.loading = false; },
      error: () => { this.violations = []; this.loading = false; }
    });
  }

  reportViolation(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/parking/violations', this.violationForm).subscribe({
      next: () => {
        this.saving = false;
        this.showViolationForm = false;
        this.violationForm = { vehicleNumber: '', violationType: '', description: '', fineAmount: null, location: '' };
        this.loadViolations();
      },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to report violation'; }
    });
  }

  resolveViolation(v: any): void {
    if (confirm(`Resolve violation for vehicle "${v.vehicleNumber}"?`)) {
      this.api.put<any>(`/parking/violations/${v.id}/resolve`, {}).subscribe({
        next: () => this.loadViolations(),
        error: () => {}
      });
    }
  }
}
