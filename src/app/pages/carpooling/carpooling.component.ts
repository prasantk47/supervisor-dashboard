import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-carpooling',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Carpooling</h2>
      </div>

      <!-- Create Ride Form -->
      <div class="card form-card" *ngIf="showForm">
        <h3>Create Ride</h3>
        <form (ngSubmit)="createRide()">
          <div class="form-grid">
            <div class="form-group"><label>From Location *</label><input type="text" [(ngModel)]="rideForm.fromLocation" name="fromLocation" required placeholder="Pickup location"></div>
            <div class="form-group"><label>To Location *</label><input type="text" [(ngModel)]="rideForm.toLocation" name="toLocation" required placeholder="Drop location"></div>
            <div class="form-group"><label>Date *</label><input type="date" [(ngModel)]="rideForm.date" name="date" required></div>
            <div class="form-group"><label>Time *</label><input type="time" [(ngModel)]="rideForm.time" name="time" required></div>
            <div class="form-group"><label>Available Seats *</label><input type="number" [(ngModel)]="rideForm.availableSeats" name="availableSeats" required min="1" placeholder="e.g. 3"></div>
            <div class="form-group"><label>Price Per Seat</label><input type="number" [(ngModel)]="rideForm.pricePerSeat" name="pricePerSeat" min="0" placeholder="e.g. 50"></div>
            <div class="form-group"><label>Vehicle Details</label><input type="text" [(ngModel)]="rideForm.vehicleDetails" name="vehicleDetails" placeholder="e.g. White Swift, MH-12-AB-1234"></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">Save</button>
            <button type="button" class="btn btn-secondary" (click)="showForm = false">Cancel</button>
          </div>
          <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        </form>
      </div>

      <!-- Rides List -->
      <div class="card">
        <div class="card-header"><span>Rides</span><button class="btn btn-primary btn-sm" (click)="openForm()" *ngIf="!showForm">+ Create Ride</button></div>
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Driver</th><th>From</th><th>To</th><th>Date</th><th>Time</th><th>Available Seats</th><th>Booked</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rides">
              <td class="name-cell">{{ r.driverName || r.driver || '-' }}</td>
              <td>{{ r.fromLocation || '-' }}</td>
              <td>{{ r.toLocation || '-' }}</td>
              <td>{{ r.date ? (r.date | date:'mediumDate') : '-' }}</td>
              <td>{{ r.time || '-' }}</td>
              <td>{{ r.availableSeats ?? '-' }}</td>
              <td>{{ r.bookedSeats ?? r.booked ?? 0 }}</td>
              <td>
                <span class="badge"
                  [class.badge-active]="r.status === 'active'"
                  [class.badge-completed]="r.status === 'completed'"
                  [class.badge-inactive]="r.status === 'cancelled'">
                  {{ r.status || 'active' }}
                </span>
              </td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="bookRide(r)" *ngIf="r.status === 'active'">Book</button>
                <button class="btn btn-danger btn-sm" (click)="cancelRide(r)" *ngIf="r.status === 'active'">Cancel</button>
              </td>
            </tr>
            <tr *ngIf="rides.length === 0"><td colspan="9" class="empty">No rides found</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { margin: 0; color: #333; }
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
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-completed { background: #e3f2fd; color: #1565c0; }
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
export class CarpoolingComponent implements OnInit {
  loading = false;
  saving = false;
  showForm = false;
  formError = '';

  rides: any[] = [];

  rideForm = {
    fromLocation: '',
    toLocation: '',
    date: '',
    time: '',
    availableSeats: null as number | null,
    pricePerSeat: null as number | null,
    vehicleDetails: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadRides();
  }

  loadRides(): void {
    this.loading = true;
    this.api.get<any>('/community/carpool').subscribe({
      next: (res) => { this.rides = res.data?.rides || res.data || []; this.loading = false; },
      error: () => { this.rides = []; this.loading = false; }
    });
  }

  openForm(): void {
    this.rideForm = { fromLocation: '', toLocation: '', date: '', time: '', availableSeats: null, pricePerSeat: null, vehicleDetails: '' };
    this.formError = '';
    this.showForm = true;
  }

  createRide(): void {
    this.saving = true;
    this.formError = '';
    this.api.post<any>('/community/carpool', this.rideForm).subscribe({
      next: () => { this.saving = false; this.showForm = false; this.loadRides(); },
      error: (err) => { this.saving = false; this.formError = err.error?.message || 'Failed to create ride'; }
    });
  }

  bookRide(r: any): void {
    this.api.post<any>(`/community/carpool/${r.id}/book`, {}).subscribe({
      next: () => this.loadRides(),
      error: (err) => { alert(err.error?.message || 'Failed to book ride'); }
    });
  }

  cancelRide(r: any): void {
    if (confirm(`Cancel ride from "${r.fromLocation}" to "${r.toLocation}"?`)) {
      this.api.put<any>(`/community/carpool/${r.id}/cancel`, {}).subscribe({
        next: () => this.loadRides(),
        error: (err) => { alert(err.error?.message || 'Failed to cancel ride'); }
      });
    }
  }
}
