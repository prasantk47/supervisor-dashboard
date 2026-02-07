import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface SocietySettings {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  totalUnits: number;
  totalFloors: number;
  managerName: string;
  managerPhone: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Settings</h2>
      </div>

      <div class="card">
        <div class="loading" *ngIf="loading">Loading...</div>

        <form *ngIf="!loading" (ngSubmit)="save()">
          <div class="form-section">
            <h3>Society Information</h3>

            <div class="form-row">
              <div class="form-group">
                <label>Society Name</label>
                <input type="text" [(ngModel)]="settings.name" name="name" class="form-control" placeholder="Enter society name">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="settings.email" name="email" class="form-control" placeholder="Enter email">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Phone</label>
                <input type="text" [(ngModel)]="settings.phone" name="phone" class="form-control" placeholder="Enter phone number">
              </div>
              <div class="form-group">
                <label>Address</label>
                <input type="text" [(ngModel)]="settings.address" name="address" class="form-control" placeholder="Enter address">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>City</label>
                <input type="text" [(ngModel)]="settings.city" name="city" class="form-control" placeholder="Enter city">
              </div>
              <div class="form-group">
                <label>State</label>
                <input type="text" [(ngModel)]="settings.state" name="state" class="form-control" placeholder="Enter state">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Pincode</label>
                <input type="text" [(ngModel)]="settings.pincode" name="pincode" class="form-control" placeholder="Enter pincode">
              </div>
              <div class="form-group">
                <label>Total Units</label>
                <input type="number" [(ngModel)]="settings.totalUnits" name="totalUnits" class="form-control" placeholder="Enter total units">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Total Floors</label>
                <input type="number" [(ngModel)]="settings.totalFloors" name="totalFloors" class="form-control" placeholder="Enter total floors">
              </div>
              <div class="form-group"></div>
            </div>
          </div>

          <div class="form-section">
            <h3>Manager Details</h3>

            <div class="form-row">
              <div class="form-group">
                <label>Manager Name</label>
                <input type="text" [(ngModel)]="settings.managerName" name="managerName" class="form-control" placeholder="Enter manager name">
              </div>
              <div class="form-group">
                <label>Manager Phone</label>
                <input type="text" [(ngModel)]="settings.managerPhone" name="managerPhone" class="form-control" placeholder="Enter manager phone">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>

          <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { margin: 0; color: #333; }
    .card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .form-section { margin-bottom: 24px; }
    .form-section h3 { margin: 0 0 16px; font-size: 16px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-size: 13px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-control { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .form-control:focus { outline: none; border-color: #4fc3f7; }
    .form-actions { margin-top: 20px; }
    .btn-save { padding: 10px 24px; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500; }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
    .success-msg { margin-top: 12px; padding: 10px; background: #e8f5e9; color: #2e7d32; border-radius: 6px; font-size: 13px; }
    .error-msg { margin-top: 12px; padding: 10px; background: #ffebee; color: #c62828; border-radius: 6px; font-size: 13px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class SettingsComponent implements OnInit {
  settings: SocietySettings = {
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    totalUnits: 0,
    totalFloors: 0,
    managerName: '',
    managerPhone: ''
  };

  loading = false;
  saving = false;
  successMsg = '';
  errorMsg = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.api.get<any>('/settings').subscribe({
      next: (res) => {
        if (res.data) {
          this.settings = { ...this.settings, ...res.data };
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  save(): void {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.api.put<any>('/settings', this.settings).subscribe({
      next: () => {
        this.successMsg = 'Settings saved successfully!';
        this.saving = false;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.errorMsg = 'Failed to save settings. Please try again.';
        this.saving = false;
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }
}
