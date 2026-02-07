import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-community-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Community Setup</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'blocks'" (click)="activeTab = 'blocks'; loadBlocks()">Blocks</button>
        <button class="tab" [class.active]="activeTab === 'floors'" (click)="activeTab = 'floors'; loadFloors()">Floors</button>
        <button class="tab" [class.active]="activeTab === 'gates'" (click)="activeTab = 'gates'; loadGates()">Gates</button>
        <button class="tab" [class.active]="activeTab === 'house-types'" (click)="activeTab = 'house-types'; loadHouseTypes()">House Types</button>
      </div>

      <!-- BLOCKS TAB -->
      <div *ngIf="activeTab === 'blocks'">
        <div class="card form-card" *ngIf="showBlockForm">
          <h3>{{ editingBlockId ? 'Edit Block' : 'Add Block' }}</h3>
          <form (ngSubmit)="saveBlock()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="blockForm.name" name="bname" required placeholder="Block A"></div>
              <div class="form-group"><label>Code *</label><input type="text" [(ngModel)]="blockForm.code" name="bcode" required placeholder="A" maxlength="10"></div>
              <div class="form-group"><label>Type</label>
                <select [(ngModel)]="blockForm.type" name="btype">
                  <option value="residential">Residential</option><option value="commercial">Commercial</option><option value="parking">Parking</option><option value="amenity">Amenity</option>
                </select>
              </div>
              <div class="form-group"><label>Total Floors</label><input type="number" [(ngModel)]="blockForm.totalFloors" name="bfloors" placeholder="0"></div>
              <div class="form-group"><label>Units Per Floor</label><input type="number" [(ngModel)]="blockForm.unitsPerFloor" name="bupf" placeholder="0"></div>
              <div class="form-group"><label>Parking Slots</label><input type="number" [(ngModel)]="blockForm.parkingSlots" name="bpark" placeholder="0"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
              <button type="button" class="btn btn-secondary" (click)="showBlockForm = false">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Blocks</span><button class="btn btn-primary btn-sm" (click)="showBlockForm = true" *ngIf="!showBlockForm">+ Add Block</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Code</th><th>Type</th><th>Floors</th><th>Units/Floor</th><th>Parking</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let b of blocks">
                <td class="name-cell">{{ b.name }}</td><td><span class="code-badge">{{ b.code }}</span></td><td>{{ b.type }}</td>
                <td>{{ b.totalFloors || 0 }}</td><td>{{ b.unitsPerFloor || 0 }}</td><td>{{ b.parkingSlots || 0 }}</td>
                <td><button class="btn btn-primary btn-sm" (click)="editBlock(b)">Edit</button></td>
              </tr>
              <tr *ngIf="blocks.length === 0"><td colspan="7" class="empty">No blocks found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FLOORS TAB -->
      <div *ngIf="activeTab === 'floors'">
        <div class="card form-card" *ngIf="showFloorForm">
          <h3>{{ editingFloorId ? 'Edit Floor' : 'Add Floor' }}</h3>
          <form (ngSubmit)="saveFloor()">
            <div class="form-grid">
              <div class="form-group"><label>Block *</label>
                <select [(ngModel)]="floorForm.blockId" name="fblock" required>
                  <option value="">Select Block</option><option *ngFor="let b of blocks" [value]="b.id">{{ b.name }}</option>
                </select>
              </div>
              <div class="form-group"><label>Floor Number *</label><input type="number" [(ngModel)]="floorForm.floorNumber" name="fnum" required></div>
              <div class="form-group"><label>Name</label><input type="text" [(ngModel)]="floorForm.name" name="fname" placeholder="e.g. Ground Floor"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showFloorForm = false">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Floors</span><button class="btn btn-primary btn-sm" (click)="showFloorForm = true" *ngIf="!showFloorForm">+ Add Floor</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Floor #</th><th>Name</th><th>Block</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let f of floors">
                <td>{{ f.floorNumber }}</td><td>{{ f.name || '-' }}</td><td>{{ f.blockName || '-' }}</td>
                <td><button class="btn btn-primary btn-sm" (click)="editFloor(f)">Edit</button></td>
              </tr>
              <tr *ngIf="floors.length === 0"><td colspan="4" class="empty">No floors found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- GATES TAB -->
      <div *ngIf="activeTab === 'gates'">
        <div class="card form-card" *ngIf="showGateForm">
          <h3>{{ editingGateId ? 'Edit Gate' : 'Add Gate' }}</h3>
          <form (ngSubmit)="saveGate()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="gateForm.name" name="gname" required placeholder="Main Gate"></div>
              <div class="form-group"><label>Code *</label><input type="text" [(ngModel)]="gateForm.code" name="gcode" required placeholder="MG" maxlength="20"></div>
              <div class="form-group"><label>Type</label>
                <select [(ngModel)]="gateForm.type" name="gtype">
                  <option value="main">Main</option><option value="service">Service</option><option value="emergency">Emergency</option><option value="parking">Parking</option><option value="pedestrian">Pedestrian</option>
                </select>
              </div>
              <div class="form-group"><label>Location</label><input type="text" [(ngModel)]="gateForm.location" name="gloc" placeholder="Optional"></div>
              <div class="form-group"><label>Intercom Number</label><input type="text" [(ngModel)]="gateForm.intercomNumber" name="gintercom" placeholder="Optional"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showGateForm = false">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Gates</span><button class="btn btn-primary btn-sm" (click)="showGateForm = true" *ngIf="!showGateForm">+ Add Gate</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Code</th><th>Type</th><th>Location</th><th>Intercom</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let g of gates">
                <td class="name-cell">{{ g.name }}</td><td><span class="code-badge">{{ g.code }}</span></td><td>{{ g.type }}</td>
                <td>{{ g.location || '-' }}</td><td>{{ g.intercomNumber || '-' }}</td>
                <td><button class="btn btn-primary btn-sm" (click)="editGate(g)">Edit</button></td>
              </tr>
              <tr *ngIf="gates.length === 0"><td colspan="6" class="empty">No gates found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- HOUSE TYPES TAB -->
      <div *ngIf="activeTab === 'house-types'">
        <div class="card form-card" *ngIf="showHouseTypeForm">
          <h3>{{ editingHouseTypeId ? 'Edit House Type' : 'Add House Type' }}</h3>
          <form (ngSubmit)="saveHouseType()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="houseTypeForm.name" name="htname" required placeholder="e.g. 2BHK"></div>
              <div class="form-group"><label>Area (sq ft)</label><input type="number" [(ngModel)]="houseTypeForm.area" name="htarea" placeholder="0"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showHouseTypeForm = false">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>House Types</span><button class="btn btn-primary btn-sm" (click)="showHouseTypeForm = true" *ngIf="!showHouseTypeForm">+ Add Type</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Area (sq ft)</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let ht of houseTypes">
                <td class="name-cell">{{ ht.name }}</td><td>{{ ht.area || '-' }}</td>
                <td><button class="btn btn-primary btn-sm" (click)="editHouseType(ht)">Edit</button></td>
              </tr>
              <tr *ngIf="houseTypes.length === 0"><td colspan="3" class="empty">No house types found</td></tr>
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
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .code-badge { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class CommunitySetupComponent implements OnInit {
  activeTab = 'blocks';
  loading = false;
  saving = false;
  societyId = '';

  blocks: any[] = [];
  floors: any[] = [];
  gates: any[] = [];
  houseTypes: any[] = [];

  showBlockForm = false; editingBlockId = '';
  blockForm: any = { name: '', code: '', type: 'residential', totalFloors: null, unitsPerFloor: null, parkingSlots: null };

  showFloorForm = false; editingFloorId = '';
  floorForm: any = { blockId: '', floorNumber: null, name: '' };

  showGateForm = false; editingGateId = '';
  gateForm: any = { name: '', code: '', type: 'main', location: '', intercomNumber: '' };

  showHouseTypeForm = false; editingHouseTypeId = '';
  houseTypeForm: any = { name: '', area: null };

  constructor(private api: ApiService, private auth: AuthService) {
    this.societyId = this.auth.currentUser?.societyId || '';
  }

  ngOnInit(): void { this.loadBlocks(); }

  loadBlocks(): void {
    this.loading = true;
    this.api.get<any>('/block', { societyId: this.societyId }).subscribe({
      next: (res) => { this.blocks = res.data?.blocks || res.data || []; this.loading = false; },
      error: () => { this.blocks = []; this.loading = false; }
    });
  }

  saveBlock(): void {
    this.saving = true;
    const payload = { ...this.blockForm, code: this.blockForm.code?.toUpperCase() };
    const req$ = this.editingBlockId
      ? this.api.put<any>(`/block/update`, { id: this.editingBlockId, ...payload })
      : this.api.post<any>(`/societies/${this.societyId}/blocks`, payload);
    req$.subscribe({
      next: () => { this.saving = false; this.showBlockForm = false; this.editingBlockId = ''; this.loadBlocks(); },
      error: () => { this.saving = false; }
    });
  }

  editBlock(b: any): void {
    this.editingBlockId = b.id;
    this.blockForm = { name: b.name, code: b.code, type: b.type || 'residential', totalFloors: b.totalFloors, unitsPerFloor: b.unitsPerFloor, parkingSlots: b.parkingSlots };
    this.showBlockForm = true;
  }

  loadFloors(): void {
    this.loading = true;
    this.api.get<any>('/floor/find-by-society', { societyId: this.societyId }).subscribe({
      next: (res) => { this.floors = res.data?.floors || res.data || []; this.loading = false; },
      error: () => { this.floors = []; this.loading = false; }
    });
  }

  saveFloor(): void {
    this.saving = true;
    const req$ = this.editingFloorId
      ? this.api.put<any>('/floor/update', { id: this.editingFloorId, ...this.floorForm })
      : this.api.post<any>('/floor', this.floorForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showFloorForm = false; this.editingFloorId = ''; this.loadFloors(); },
      error: () => { this.saving = false; }
    });
  }

  editFloor(f: any): void {
    this.editingFloorId = f.id;
    this.floorForm = { blockId: f.blockId || '', floorNumber: f.floorNumber, name: f.name || '' };
    this.showFloorForm = true;
  }

  loadGates(): void {
    this.loading = true;
    this.api.get<any>('/society/gate').subscribe({
      next: (res) => { this.gates = res.data?.gates || res.data || []; this.loading = false; },
      error: () => { this.gates = []; this.loading = false; }
    });
  }

  saveGate(): void {
    this.saving = true;
    const payload = { ...this.gateForm, code: this.gateForm.code?.toUpperCase() };
    const req$ = this.editingGateId
      ? this.api.put<any>('/society/gate', { id: this.editingGateId, ...payload })
      : this.api.post<any>(`/societies/${this.societyId}/gates`, payload);
    req$.subscribe({
      next: () => { this.saving = false; this.showGateForm = false; this.editingGateId = ''; this.loadGates(); },
      error: () => { this.saving = false; }
    });
  }

  editGate(g: any): void {
    this.editingGateId = g.id;
    this.gateForm = { name: g.name, code: g.code, type: g.type || 'main', location: g.location || '', intercomNumber: g.intercomNumber || '' };
    this.showGateForm = true;
  }

  loadHouseTypes(): void {
    this.loading = true;
    this.api.get<any>('/house-type').subscribe({
      next: (res) => { this.houseTypes = res.data?.houseTypes || res.data || []; this.loading = false; },
      error: () => { this.houseTypes = []; this.loading = false; }
    });
  }

  saveHouseType(): void {
    this.saving = true;
    const req$ = this.editingHouseTypeId
      ? this.api.put<any>('/house-type', { id: this.editingHouseTypeId, ...this.houseTypeForm })
      : this.api.post<any>('/house-type', this.houseTypeForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showHouseTypeForm = false; this.editingHouseTypeId = ''; this.loadHouseTypes(); },
      error: () => { this.saving = false; }
    });
  }

  editHouseType(ht: any): void {
    this.editingHouseTypeId = ht.id;
    this.houseTypeForm = { name: ht.name, area: ht.area };
    this.showHouseTypeForm = true;
  }
}
