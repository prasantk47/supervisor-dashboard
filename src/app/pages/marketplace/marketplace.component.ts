import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Marketplace</h2>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'listings'" (click)="activeTab = 'listings'; loadListings()">Listings</button>
        <button class="tab" [class.active]="activeTab === 'categories'" (click)="activeTab = 'categories'; loadCategories()">Categories</button>
      </div>

      <!-- LISTINGS TAB -->
      <div *ngIf="activeTab === 'listings'">
        <!-- Filters -->
        <div class="filter-bar">
          <div class="filter-group">
            <label>Category</label>
            <select [(ngModel)]="filterCategory" name="fcat" (change)="loadListings()">
              <option value="">All Categories</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Type</label>
            <select [(ngModel)]="filterType" name="ftype" (change)="loadListings()">
              <option value="">All Types</option>
              <option value="sell">Sell</option>
              <option value="rent">Rent</option>
              <option value="free">Free</option>
              <option value="wanted">Wanted</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Status</label>
            <select [(ngModel)]="filterStatus" name="fstatus" (change)="loadListings()">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span>Marketplace Listings</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr>
                <th>Title</th><th>Type</th><th>Category</th><th>Price</th><th>Condition</th><th>Views</th><th>Favorites</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of listings">
                <td class="name-cell">{{ l.title }}</td>
                <td>
                  <span class="badge"
                    [class.badge-type-sell]="l.type === 'sell' || l.listingType === 'sell'"
                    [class.badge-type-rent]="l.type === 'rent' || l.listingType === 'rent'"
                    [class.badge-type-free]="l.type === 'free' || l.listingType === 'free'"
                    [class.badge-type-wanted]="l.type === 'wanted' || l.listingType === 'wanted'">
                    {{ l.type || l.listingType || '-' }}
                  </span>
                </td>
                <td>{{ l.categoryName || l.category?.name || '-' }}</td>
                <td>{{ l.price != null ? ('Rs. ' + l.price) : '-' }}</td>
                <td>{{ l.condition || '-' }}</td>
                <td>{{ l.views || 0 }}</td>
                <td>{{ l.favorites || l.favourites || 0 }}</td>
                <td>
                  <span class="badge"
                    [class.badge-active]="l.status === 'active'"
                    [class.badge-sold]="l.status === 'sold'"
                    [class.badge-reserved]="l.status === 'reserved'">
                    {{ l.status || 'active' }}
                  </span>
                </td>
                <td>{{ l.createdAt ? (l.createdAt | date:'mediumDate') : '-' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="viewListing(l)">View</button>
                  <button class="btn btn-secondary btn-sm" (click)="markAsSold(l)" *ngIf="l.status === 'active'">Mark Sold</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteListing(l)">Delete</button>
                </td>
              </tr>
              <tr *ngIf="listings.length === 0"><td colspan="10" class="empty">No listings found</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Listing Detail Modal -->
        <div class="modal-overlay" *ngIf="selectedListing" (click)="selectedListing = null">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ selectedListing.title }}</h3>
              <button class="btn btn-secondary btn-sm" (click)="selectedListing = null">Close</button>
            </div>
            <div class="modal-body">
              <div class="detail-row"><strong>Type:</strong> {{ selectedListing.type || selectedListing.listingType || '-' }}</div>
              <div class="detail-row"><strong>Category:</strong> {{ selectedListing.categoryName || selectedListing.category?.name || '-' }}</div>
              <div class="detail-row"><strong>Price:</strong> {{ selectedListing.price != null ? ('Rs. ' + selectedListing.price) : '-' }}</div>
              <div class="detail-row"><strong>Condition:</strong> {{ selectedListing.condition || '-' }}</div>
              <div class="detail-row"><strong>Status:</strong> {{ selectedListing.status || 'active' }}</div>
              <div class="detail-row"><strong>Views:</strong> {{ selectedListing.views || 0 }} | <strong>Favorites:</strong> {{ selectedListing.favorites || selectedListing.favourites || 0 }}</div>
              <div class="detail-row"><strong>Seller:</strong> {{ selectedListing.sellerName || selectedListing.seller?.name || '-' }}</div>
              <div class="detail-row" style="margin-top: 12px;"><strong>Description:</strong></div>
              <div class="content-block">{{ selectedListing.description || selectedListing.content || '-' }}</div>
              <div class="detail-row" *ngIf="selectedListing.images?.length"><strong>Images:</strong> {{ selectedListing.images.length }} attached</div>
              <div class="detail-row"><strong>Created:</strong> {{ selectedListing.createdAt ? (selectedListing.createdAt | date:'medium') : '-' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CATEGORIES TAB -->
      <div *ngIf="activeTab === 'categories'">
        <div class="card">
          <div class="card-header"><span>Marketplace Categories</span></div>
          <div class="loading" *ngIf="loading">Loading...</div>
          <table *ngIf="!loading">
            <thead>
              <tr><th>Name</th><th>Description</th><th>Icon</th><th>Listings Count</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of categories">
                <td class="name-cell">{{ c.name }}</td>
                <td>{{ c.description || '-' }}</td>
                <td>{{ c.icon || '-' }}</td>
                <td>{{ c.listingsCount || c.listingCount || c.count || 0 }}</td>
                <td>
                  <span class="badge" [class.badge-active]="!c.disabled && c.status !== 'inactive'" [class.badge-inactive]="c.disabled || c.status === 'inactive'">
                    {{ c.disabled || c.status === 'inactive' ? 'Inactive' : 'Active' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="categories.length === 0"><td colspan="5" class="empty">No categories found</td></tr>
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
    .filter-bar { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; }
    .filter-group label { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
    .filter-group select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .filter-group select:focus { outline: none; border-color: #4fc3f7; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-weight: 600; color: #666; background: #fafafa; }
    .name-cell { font-weight: 600; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .badge-inactive { background: #ffebee; color: #c62828; }
    .badge-sold { background: #ede7f6; color: #4527a0; }
    .badge-reserved { background: #fff3e0; color: #e65100; }
    .badge-type-sell { background: #e3f2fd; color: #1565c0; }
    .badge-type-rent { background: #f3e5f5; color: #7b1fa2; }
    .badge-type-free { background: #e8f5e9; color: #2e7d32; }
    .badge-type-wanted { background: #fff8e1; color: #f57f17; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-danger { background: #f44336; color: #fff; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn + .btn { margin-left: 4px; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty { text-align: center; color: #999; padding: 40px; }
    .loading { text-align: center; color: #999; padding: 40px; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-card { background: #fff; border-radius: 10px; padding: 24px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .modal-header h3 { margin: 0; color: #333; }
    .modal-body { font-size: 13px; color: #555; }
    .detail-row { margin-bottom: 8px; }
    .detail-row strong { color: #333; }
    .content-block { background: #f9f9f9; padding: 12px; border-radius: 6px; margin-top: 4px; white-space: pre-wrap; line-height: 1.6; }
  `]
})
export class MarketplaceComponent implements OnInit {
  activeTab = 'listings';
  loading = false;

  listings: any[] = [];
  categories: any[] = [];

  filterCategory = '';
  filterType = '';
  filterStatus = '';

  selectedListing: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadListings();
  }

  loadListings(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterCategory) params.categoryId = this.filterCategory;
    if (this.filterType) params.listingType = this.filterType;
    if (this.filterStatus) params.status = this.filterStatus;
    this.api.get<any>('/marketplace', params).subscribe({
      next: (res) => { this.listings = res.data?.listings || res.data || []; this.loading = false; },
      error: () => { this.listings = []; this.loading = false; }
    });
  }

  loadCategories(): void {
    this.api.get<any>('/marketplace/categories').subscribe({
      next: (res) => { this.categories = res.data?.categories || res.data || []; },
      error: () => { this.categories = []; }
    });
  }

  viewListing(l: any): void {
    this.api.get<any>(`/marketplace/${l.id}`).subscribe({
      next: (res) => { this.selectedListing = res.data || l; },
      error: () => { this.selectedListing = l; }
    });
  }

  markAsSold(l: any): void {
    if (confirm(`Mark listing "${l.title}" as sold?`)) {
      this.api.put<any>(`/marketplace/${l.id}/sold`, {}).subscribe({
        next: () => this.loadListings(),
        error: () => {}
      });
    }
  }

  deleteListing(l: any): void {
    if (confirm(`Delete listing "${l.title}"?`)) {
      this.api.delete<any>(`/marketplace/${l.id}`).subscribe({
        next: () => this.loadListings(),
        error: () => {}
      });
    }
  }
}
