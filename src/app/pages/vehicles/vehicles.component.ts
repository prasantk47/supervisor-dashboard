import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Vehicles</h2>
        <div class="header-actions">
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search vehicles..." class="search-input">
        </div>
      </div>

      <div class="card">
        <div class="loading" *ngIf="loading">Loading...</div>
        <table *ngIf="!loading">
          <thead>
            <tr>
              <th>Number</th>
              <th>Name</th>
              <th>Type</th>
              <th>Unit</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>{{ item.number || '-' }}</td>
              <td>{{ item.name || '-' }}</td>
              <td>{{ item.type || '-' }}</td>
              <td>{{ item.rentalUnit?.name || '-' }}</td>
              <td>{{ item.user ? (item.user.firstName + ' ' + (item.user.lastName || '')) : '-' }}</td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="5" class="empty">No vehicles found</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" *ngIf="totalPages > 1">
          <button (click)="changePage(page - 1)" [disabled]="page <= 1">Prev</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button (click)="changePage(page + 1)" [disabled]="page >= totalPages">Next</button>
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
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
  `]
})
export class VehiclesComponent implements OnInit {
  items: any[] = [];
  loading = false;
  search = '';
  page = 1;
  limit = 15;
  total = 0;
  totalPages = 0;

  private searchTimeout: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;

    this.api.get<any>('/vehicles', params).subscribe({
      next: (res) => {
        this.items = res.data?.vehicles || res.data || [];
        this.total = res.data?.pagination?.total || res.data?.total || this.items.length;
        this.totalPages = Math.ceil(this.total / this.limit);
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 400);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadData();
    }
  }
}
