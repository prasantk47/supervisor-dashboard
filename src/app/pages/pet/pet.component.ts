import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Pet Management</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'pets'" (click)="activeTab = 'pets'; loadPets()">Pets</button>
        <button class="tab" [class.active]="activeTab === 'incidents'" (click)="activeTab = 'incidents'; loadIncidents()">Incidents</button>
        <button class="tab" [class.active]="activeTab === 'walk-schedules'" (click)="activeTab = 'walk-schedules'; loadWalkSchedules()">Walk Schedules</button>
      </div>

      <!-- PETS TAB -->
      <div *ngIf="activeTab === 'pets'">
        <!-- Vaccination Modal -->
        <div class="card form-card" *ngIf="showVaccinationForm">
          <h3>Add Vaccination for {{ vaccinatingPet?.name }}</h3>
          <form (ngSubmit)="saveVaccination()">
            <div class="form-grid">
              <div class="form-group"><label>Vaccine Name *</label><input type="text" [(ngModel)]="vaccinationForm.vaccineName" name="vacname" required placeholder="e.g. Rabies, DHPP"></div>
              <div class="form-group"><label>Date *</label><input type="date" [(ngModel)]="vaccinationForm.date" name="vacdate" required></div>
              <div class="form-group"><label>Next Due Date</label><input type="date" [(ngModel)]="vaccinationForm.nextDueDate" name="vacnext"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showVaccinationForm = false; vaccinatingPet = null">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Pet Registration Form -->
        <div class="card form-card" *ngIf="showPetForm">
          <h3>{{ editingPetId ? 'Edit Pet' : 'Register Pet' }}</h3>
          <form (ngSubmit)="savePet()">
            <div class="form-grid">
              <div class="form-group"><label>Name *</label><input type="text" [(ngModel)]="petForm.name" name="pname" required placeholder="Pet name"></div>
              <div class="form-group"><label>Species *</label>
                <select [(ngModel)]="petForm.species" name="pspecies" required>
                  <option value="">Select Species</option>
                  <option *ngFor="let s of speciesList" [value]="s">{{ s }}</option>
                </select>
              </div>
              <div class="form-group"><label>Breed</label><input type="text" [(ngModel)]="petForm.breed" name="pbreed" placeholder="Breed"></div>
              <div class="form-group"><label>Color</label><input type="text" [(ngModel)]="petForm.color" name="pcolor" placeholder="Color"></div>
              <div class="form-group"><label>Age</label><input type="number" [(ngModel)]="petForm.age" name="page" placeholder="Age in years"></div>
              <div class="form-group"><label>Owner Name *</label><input type="text" [(ngModel)]="petForm.ownerName" name="powner" required placeholder="Owner name"></div>
              <div class="form-group"><label>Unit Number *</label><input type="text" [(ngModel)]="petForm.unitNumber" name="punit" required placeholder="e.g. A-101"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="cancelPetForm()">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Filter bar -->
        <div class="categories-bar">
          <span class="cat-chip" [class.active]="!showMyPets" (click)="showMyPets = false; loadPets()">All Pets</span>
          <span class="cat-chip" [class.active]="showMyPets" (click)="showMyPets = true; loadMyPets()">My Pets</span>
        </div>

        <div class="card">
          <div class="card-header"><span>Pets</span><button class="btn btn-primary btn-sm" (click)="openPetForm()" *ngIf="!showPetForm">+ Register Pet</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Name</th><th>Species</th><th>Breed</th><th>Owner</th><th>Unit</th><th>Approved</th><th>Vaccinated</th><th>Reg #</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of pets">
                <td class="name-cell">{{ p.name }}</td>
                <td>{{ p.species || '-' }}</td>
                <td>{{ p.breed || '-' }}</td>
                <td>{{ p.ownerName || p.owner?.name || '-' }}</td>
                <td>{{ p.unitNumber || p.unit || '-' }}</td>
                <td><span class="badge" [class.badge-active]="p.approved" [class.badge-pending]="!p.approved">{{ p.approved ? 'Approved' : 'Pending' }}</span></td>
                <td><span class="badge" [class.badge-active]="p.vaccinated" [class.badge-inactive]="!p.vaccinated">{{ p.vaccinated ? 'Yes' : 'No' }}</span></td>
                <td><span class="code-badge">{{ p.registrationNumber || '-' }}</span></td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="editPet(p)">Edit</button>
                  <button class="btn btn-sm" style="background:#4caf50;color:#fff;" (click)="approvePet(p)" *ngIf="!p.approved">Approve</button>
                  <button class="btn btn-sm" style="background:#2196f3;color:#fff;" (click)="openVaccinationForm(p)">+ Vaccine</button>
                </td>
              </tr>
              <tr *ngIf="pets.length === 0"><td colspan="9" class="empty">No pets found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- INCIDENTS TAB -->
      <div *ngIf="activeTab === 'incidents'">
        <div class="card form-card" *ngIf="showIncidentForm">
          <h3>Report Incident</h3>
          <form (ngSubmit)="saveIncident()">
            <div class="form-grid">
              <div class="form-group"><label>Pet *</label>
                <select [(ngModel)]="incidentForm.petId" name="ipet" required>
                  <option value="">Select Pet</option>
                  <option *ngFor="let p of pets" [value]="p.id">{{ p.name }} ({{ p.ownerName || p.owner?.name || 'Unknown' }})</option>
                </select>
              </div>
              <div class="form-group"><label>Incident Type *</label><input type="text" [(ngModel)]="incidentForm.incidentType" name="itype" required placeholder="e.g. Noise, Bite, Property Damage"></div>
              <div class="form-group"><label>Location</label><input type="text" [(ngModel)]="incidentForm.location" name="iloc" placeholder="e.g. Garden, Lobby"></div>
              <div class="form-group full-width"><label>Description *</label><input type="text" [(ngModel)]="incidentForm.description" name="idesc" required placeholder="Describe the incident"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Report</button>
              <button type="button" class="btn btn-secondary" (click)="showIncidentForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <!-- Resolve Form -->
        <div class="card form-card" *ngIf="showResolveForm">
          <h3>Resolve Incident</h3>
          <form (ngSubmit)="resolveIncident()">
            <div class="form-grid">
              <div class="form-group full-width"><label>Resolution *</label><input type="text" [(ngModel)]="resolveText" name="rtext" required placeholder="Enter resolution details"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Resolve</button>
              <button type="button" class="btn btn-secondary" (click)="showResolveForm = false; resolvingIncident = null">Cancel</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Incidents</span><button class="btn btn-primary btn-sm" (click)="showIncidentForm = true; resetIncidentForm()" *ngIf="!showIncidentForm">+ Report Incident</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Pet</th><th>Type</th><th>Description</th><th>Location</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of incidents">
                <td class="name-cell">{{ i.petName || i.pet?.name || '-' }}</td>
                <td>{{ i.incidentType || i.type || '-' }}</td>
                <td>{{ i.description || '-' }}</td>
                <td>{{ i.location || '-' }}</td>
                <td>{{ i.createdAt ? (i.createdAt | date:'mediumDate') : (i.date | date:'mediumDate') }}</td>
                <td>
                  <span class="badge"
                    [class.badge-pending]="i.status === 'reported' || i.status === 'pending'"
                    [class.badge-active]="i.status === 'resolved'">
                    {{ i.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm" style="background:#4caf50;color:#fff;" (click)="openResolveForm(i)" *ngIf="i.status === 'reported' || i.status === 'pending'">Resolve</button>
                </td>
              </tr>
              <tr *ngIf="incidents.length === 0"><td colspan="7" class="empty">No incidents found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- WALK SCHEDULES TAB -->
      <div *ngIf="activeTab === 'walk-schedules'">
        <div class="card form-card" *ngIf="showScheduleForm">
          <h3>Create Walk Schedule</h3>
          <form (ngSubmit)="saveSchedule()">
            <div class="form-grid">
              <div class="form-group"><label>Pet *</label>
                <select [(ngModel)]="scheduleForm.petId" name="spet" required>
                  <option value="">Select Pet</option>
                  <option *ngFor="let p of pets" [value]="p.id">{{ p.name }} ({{ p.ownerName || p.owner?.name || 'Unknown' }})</option>
                </select>
              </div>
              <div class="form-group"><label>Time Slot *</label><input type="text" [(ngModel)]="scheduleForm.timeSlot" name="stime" required placeholder="e.g. 6:00 AM - 7:00 AM"></div>
              <div class="form-group"><label>Area *</label><input type="text" [(ngModel)]="scheduleForm.area" name="sarea" required placeholder="e.g. Garden, Park"></div>
              <div class="form-group full-width"><label>Days *</label><input type="text" [(ngModel)]="scheduleForm.days" name="sdays" required placeholder="e.g. Mon, Wed, Fri"></div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
              <button type="button" class="btn btn-secondary" (click)="showScheduleForm = false">Cancel</button>
            </div>
            <div class="error-msg" *ngIf="formError">{{ formError }}</div>
          </form>
        </div>

        <div class="card">
          <div class="card-header"><span>Walk Schedules</span><button class="btn btn-primary btn-sm" (click)="showScheduleForm = true; resetScheduleForm()" *ngIf="!showScheduleForm">+ Create Schedule</button></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead><tr><th>Pet</th><th>Owner</th><th>Time Slot</th><th>Area</th><th>Days</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let s of walkSchedules">
                <td class="name-cell">{{ s.petName || s.pet?.name || '-' }}</td>
                <td>{{ s.ownerName || s.pet?.ownerName || '-' }}</td>
                <td>{{ s.timeSlot || '-' }}</td>
                <td>{{ s.area || '-' }}</td>
                <td>{{ s.days || '-' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="s.status === 'active'"
                    [class.badge-inactive]="s.status === 'inactive'"
                    [class.badge-pending]="s.status === 'pending'">
                    {{ s.status || 'active' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="walkSchedules.length === 0"><td colspan="6" class="empty">No walk schedules found</td></tr>
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
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-group input, .form-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #4fc3f7; }
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
  `]
})
export class PetComponent implements OnInit {
  activeTab = 'pets';
  loading = false;
  saving = false;
  formError = '';
  showMyPets = false;

  pets: any[] = [];
  speciesList: any[] = [];
  incidents: any[] = [];
  walkSchedules: any[] = [];

  showPetForm = false;
  editingPetId = '';
  petForm = { name: '', species: '', breed: '', color: '', age: null as number | null, ownerName: '', unitNumber: '' };

  showVaccinationForm = false;
  vaccinatingPet: any = null;
  vaccinationForm = { vaccineName: '', date: '', nextDueDate: '' };

  showIncidentForm = false;
  incidentForm = { petId: '', incidentType: '', description: '', location: '' };

  showResolveForm = false;
  resolvingIncident: any = null;
  resolveText = '';

  showScheduleForm = false;
  scheduleForm = { petId: '', timeSlot: '', area: '', days: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadPets();
    this.loadSpecies();
  }

  // --- Pets ---

  loadPets(): void {
    this.loading = true;
    this.api.get<any>('/pets').subscribe({
      next: (res) => { this.pets = res.data?.pets || res.data || []; this.loading = false; },
      error: () => { this.pets = []; this.loading = false; }
    });
  }

  loadMyPets(): void {
    this.loading = true;
    this.api.get<any>('/pets/my-pets').subscribe({
      next: (res) => { this.pets = res.data?.pets || res.data || []; this.loading = false; },
      error: () => { this.pets = []; this.loading = false; }
    });
  }

  loadSpecies(): void {
    this.api.get<any>('/pets/species').subscribe({
      next: (res) => { this.speciesList = res.data?.species || res.data || []; },
      error: () => { this.speciesList = []; }
    });
  }

  openPetForm(): void {
    this.editingPetId = '';
    this.petForm = { name: '', species: '', breed: '', color: '', age: null, ownerName: '', unitNumber: '' };
    this.formError = '';
    this.showPetForm = true;
  }

  cancelPetForm(): void {
    this.showPetForm = false;
    this.editingPetId = '';
    this.formError = '';
  }

  savePet(): void {
    this.saving = true;
    this.formError = '';
    const req$ = this.editingPetId
      ? this.api.put<any>(`/pets/${this.editingPetId}`, this.petForm)
      : this.api.post<any>('/pets', this.petForm);
    req$.subscribe({
      next: () => { this.saving = false; this.showPetForm = false; this.editingPetId = ''; this.loadPets(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to save pet'; }
    });
  }

  editPet(p: any): void {
    this.editingPetId = p.id;
    this.petForm = {
      name: p.name || '',
      species: p.species || '',
      breed: p.breed || '',
      color: p.color || '',
      age: p.age || null,
      ownerName: p.ownerName || p.owner?.name || '',
      unitNumber: p.unitNumber || p.unit || ''
    };
    this.formError = '';
    this.showPetForm = true;
  }

  approvePet(p: any): void {
    this.api.put<any>(`/pets/${p.id}/approve`, {}).subscribe({
      next: () => this.loadPets()
    });
  }

  // --- Vaccination ---

  openVaccinationForm(p: any): void {
    this.vaccinatingPet = p;
    this.vaccinationForm = { vaccineName: '', date: '', nextDueDate: '' };
    this.formError = '';
    this.showVaccinationForm = true;
  }

  saveVaccination(): void {
    if (!this.vaccinatingPet) return;
    this.saving = true;
    this.formError = '';
    this.api.post<any>(`/pets/${this.vaccinatingPet.id}/vaccination`, this.vaccinationForm).subscribe({
      next: () => { this.saving = false; this.showVaccinationForm = false; this.vaccinatingPet = null; this.loadPets(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to add vaccination'; }
    });
  }

  // --- Incidents ---

  loadIncidents(): void {
    this.loading = true;
    this.api.get<any>('/pets/incidents').subscribe({
      next: (res) => { this.incidents = res.data?.incidents || res.data || []; this.loading = false; },
      error: () => { this.incidents = []; this.loading = false; }
    });
  }

  resetIncidentForm(): void {
    this.incidentForm = { petId: '', incidentType: '', description: '', location: '' };
    this.formError = '';
  }

  saveIncident(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/pets/incidents', this.incidentForm).subscribe({
      next: () => { this.saving = false; this.showIncidentForm = false; this.loadIncidents(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to report incident'; }
    });
  }

  openResolveForm(i: any): void {
    this.resolvingIncident = i;
    this.resolveText = '';
    this.showResolveForm = true;
  }

  resolveIncident(): void {
    if (!this.resolvingIncident) return;
    this.saving = true;
    this.api.put<any>(`/pets/incidents/${this.resolvingIncident.id}/resolve`, { resolution: this.resolveText }).subscribe({
      next: () => { this.saving = false; this.showResolveForm = false; this.resolvingIncident = null; this.loadIncidents(); },
      error: () => { this.saving = false; }
    });
  }

  // --- Walk Schedules ---

  loadWalkSchedules(): void {
    this.loading = true;
    this.api.get<any>('/pets/walk-schedules').subscribe({
      next: (res) => { this.walkSchedules = res.data?.walkSchedules || res.data || []; this.loading = false; },
      error: () => { this.walkSchedules = []; this.loading = false; }
    });
  }

  resetScheduleForm(): void {
    this.scheduleForm = { petId: '', timeSlot: '', area: '', days: '' };
    this.formError = '';
  }

  saveSchedule(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/pets/walk-schedules', this.scheduleForm).subscribe({
      next: () => { this.saving = false; this.showScheduleForm = false; this.loadWalkSchedules(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to create schedule'; }
    });
  }
}
