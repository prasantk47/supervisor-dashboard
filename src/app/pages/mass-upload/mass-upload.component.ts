import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface UploadRow {
  unitNumber: string;
  blockCode: string;
  floor: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  type: string;
}

interface UploadResult {
  row: number;
  unitNumber: string;
  status: 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-mass-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Mass User Upload</h2>
      </div>

      <!-- Society Selection -->
      <div class="card" style="margin-bottom: 16px;">
        <div class="form-row">
          <div class="form-group">
            <label>Select Society *</label>
            <select [(ngModel)]="selectedSocietyId" (ngModelChange)="onSocietyChange()">
              <option value="">-- Select Society --</option>
              <option *ngFor="let s of societies" [value]="s.id">{{ s.name }} ({{ s.code }})</option>
            </select>
          </div>
          <div class="form-group" *ngIf="blocks.length > 0">
            <label>Default Block</label>
            <select [(ngModel)]="defaultBlockId">
              <option value="">-- Select Block --</option>
              <option *ngFor="let b of blocks" [value]="b.id">{{ b.name }} ({{ b.code }})</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Upload Area -->
      <div class="card" style="margin-bottom: 16px;">
        <h3>Upload CSV File</h3>
        <p class="help-text">CSV format: unitNumber, blockCode, floor, type, ownerName, ownerPhone, ownerEmail</p>

        <div class="upload-area" (click)="fileInput.click()"
             (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
          <input type="file" #fileInput (change)="onFileSelect($event)" accept=".csv" hidden>
          <div class="upload-icon">&#x1F4C4;</div>
          <p>Click or drag CSV file here</p>
          <span class="file-name" *ngIf="fileName">{{ fileName }} ({{ parsedRows.length }} rows)</span>
        </div>

        <button class="btn btn-secondary" (click)="downloadTemplate()" style="margin-top: 12px;">
          Download CSV Template
        </button>
      </div>

      <!-- Preview Table -->
      <div class="card" *ngIf="parsedRows.length > 0" style="margin-bottom: 16px;">
        <div class="preview-header">
          <h3>Preview ({{ parsedRows.length }} rows)</h3>
          <button class="btn btn-primary" (click)="startUpload()" [disabled]="uploading || !selectedSocietyId">
            {{ uploading ? 'Uploading... (' + uploadProgress + '/' + parsedRows.length + ')' : 'Start Upload' }}
          </button>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Unit</th>
                <th>Block</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Owner Name</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of parsedRows; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ row.unitNumber }}</td>
                <td>{{ row.blockCode }}</td>
                <td>{{ row.floor }}</td>
                <td>{{ row.type }}</td>
                <td>{{ row.ownerName }}</td>
                <td>{{ row.ownerPhone }}</td>
                <td>{{ row.ownerEmail }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Results -->
      <div class="card" *ngIf="results.length > 0">
        <h3>Upload Results</h3>
        <div class="results-summary">
          <span class="result-stat success">{{ successCount }} succeeded</span>
          <span class="result-stat error">{{ errorCount }} failed</span>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Row</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of results" [class.row-error]="r.status === 'error'">
                <td>{{ r.row }}</td>
                <td>{{ r.unitNumber }}</td>
                <td>
                  <span class="badge" [class.badge-active]="r.status === 'success'" [class.badge-inactive]="r.status === 'error'">
                    {{ r.status }}
                  </span>
                </td>
                <td>{{ r.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { margin: 0; color: #333; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card h3 { margin: 0 0 12px; color: #333; font-size: 16px; }
    .help-text { color: #888; font-size: 12px; margin: 0 0 12px; }
    .form-row { display: flex; gap: 16px; }
    .form-group { display: flex; flex-direction: column; min-width: 250px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .form-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .form-group select:focus { outline: none; border-color: #4fc3f7; }
    .upload-area {
      border: 2px dashed #ccc; border-radius: 10px; padding: 40px; text-align: center;
      cursor: pointer; transition: all 0.2s;
    }
    .upload-area:hover { border-color: #4fc3f7; background: #f8fdff; }
    .upload-icon { font-size: 40px; margin-bottom: 8px; }
    .upload-area p { color: #666; margin: 0; }
    .file-name { color: #1565c0; font-weight: 600; font-size: 13px; margin-top: 8px; display: block; }
    .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .preview-header h3 { margin: 0; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #eee; font-size: 12px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .row-error { background: #fff8f8; }
    .results-summary { display: flex; gap: 16px; margin-bottom: 12px; }
    .result-stat { padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; }
    .result-stat.success { background: #e8f5e9; color: #2e7d32; }
    .result-stat.error { background: #ffebee; color: #c62828; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .btn { padding: 8px 16px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class MassUploadComponent {
  societies: any[] = [];
  blocks: any[] = [];
  selectedSocietyId = '';
  defaultBlockId = '';
  fileName = '';
  parsedRows: UploadRow[] = [];
  results: UploadResult[] = [];
  uploading = false;
  uploadProgress = 0;

  get successCount(): number { return this.results.filter(r => r.status === 'success').length; }
  get errorCount(): number { return this.results.filter(r => r.status === 'error').length; }

  constructor(private api: ApiService) {
    this.loadSocieties();
  }

  loadSocieties(): void {
    this.api.get<any>('/societies', { limit: 100 }).subscribe({
      next: (res) => {
        this.societies = res.data?.societies || res.data || [];
      }
    });
  }

  onSocietyChange(): void {
    if (this.selectedSocietyId) {
      this.api.get<any>(`/societies/${this.selectedSocietyId}`).subscribe({
        next: (res) => {
          this.blocks = res.data?.blocks || [];
        }
      });
    } else {
      this.blocks = [];
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.parseFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files?.length) {
      this.parseFile(event.dataTransfer.files[0]);
    }
  }

  parseFile(file: File): void {
    this.fileName = file.name;
    this.results = [];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      // Skip header row
      this.parsedRows = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        return {
          unitNumber: cols[0] || '',
          blockCode: cols[1] || '',
          floor: cols[2] || '0',
          type: cols[3] || '2bhk',
          ownerName: cols[4] || '',
          ownerPhone: cols[5] || '',
          ownerEmail: cols[6] || ''
        };
      }).filter(r => r.unitNumber);
    };
    reader.readAsText(file);
  }

  downloadTemplate(): void {
    const csv = 'unitNumber,blockCode,floor,type,ownerName,ownerPhone,ownerEmail\n101,A,1,2bhk,John Doe,9876543210,john@example.com\n102,A,1,3bhk,Jane Smith,9876543211,jane@example.com';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mass_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async startUpload(): Promise<void> {
    if (!this.selectedSocietyId || this.parsedRows.length === 0) return;

    this.uploading = true;
    this.uploadProgress = 0;
    this.results = [];

    // Find block IDs by code
    const blockMap = new Map<string, string>();
    for (const b of this.blocks) {
      blockMap.set(b.code?.toUpperCase(), b.id);
    }

    for (let i = 0; i < this.parsedRows.length; i++) {
      const row = this.parsedRows[i];
      this.uploadProgress = i + 1;

      const blockId = blockMap.get(row.blockCode.toUpperCase()) || this.defaultBlockId;
      if (!blockId) {
        this.results.push({ row: i + 1, unitNumber: row.unitNumber, status: 'error', message: `Block "${row.blockCode}" not found` });
        continue;
      }

      try {
        // Create unit
        const unitRes: any = await this.api.post<any>('/units', {
          blockId,
          unitNumber: row.unitNumber,
          floor: parseInt(row.floor) || 0,
          type: row.type || '2bhk'
        }).toPromise();

        const unitId = unitRes?.data?.id;

        // If owner info provided, create user and assign
        if (row.ownerName && row.ownerPhone && unitId) {
          try {
            await this.api.post<any>('/auth/create-staff', {
              name: row.ownerName,
              phone: row.ownerPhone,
              email: row.ownerEmail || undefined,
              role: 'resident'
            }).toPromise();
          } catch {
            // Owner may already exist, continue
          }
        }

        this.results.push({ row: i + 1, unitNumber: row.unitNumber, status: 'success', message: 'Unit created successfully' });
      } catch (err: any) {
        this.results.push({
          row: i + 1, unitNumber: row.unitNumber, status: 'error',
          message: err.error?.message || 'Failed to create unit'
        });
      }
    }

    this.uploading = false;
  }
}
