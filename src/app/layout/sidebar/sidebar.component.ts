import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <h2 *ngIf="!collapsed">Vistr+ Supervisor</h2>
        <span *ngIf="collapsed">V+</span>
        <button class="toggle-btn" (click)="collapsed = !collapsed">
          <span>{{ collapsed ? '>' : '<' }}</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <a *ngFor="let item of navItems"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-item"
           [title]="item.label">
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <a class="nav-item logout" (click)="logout()" title="Logout">
          <span class="nav-icon">&#x1F6AA;</span>
          <span class="nav-label" *ngIf="!collapsed">Logout</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      min-height: 100vh;
      background: #1a1a2e;
      color: #fff;
      display: flex;
      flex-direction: column;
      transition: width 0.3s;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
    }
    .sidebar.collapsed { width: 60px; }
    .sidebar-header {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      h2 { margin: 0; font-size: 16px; white-space: nowrap; }
    }
    .toggle-btn {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 16px;
      padding: 4px 8px;
    }
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }
    .nav-item {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      color: #ccc;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      gap: 12px;
      font-size: 14px;
      &:hover { background: rgba(255,255,255,0.08); color: #fff; }
      &.active { background: #16213e; color: #4fc3f7; border-left: 3px solid #4fc3f7; }
    }
    .nav-icon { font-size: 18px; min-width: 24px; text-align: center; }
    .nav-label { white-space: nowrap; }
    .sidebar-footer {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding: 8px 0;
    }
    .logout:hover { color: #ff5252 !important; }
  `]
})
export class SidebarComponent {
  collapsed = false;
  userRole = '';

  allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: '\u{1F4CA}', route: '/dashboard' },
    { label: 'Visitors', icon: '\u{1F6B6}', route: '/visitors' },
    { label: 'Daily Help', icon: '\u{1F9F9}', route: '/daily-help' },
    { label: 'Staff', icon: '\u{1F464}', route: '/staff' },
    { label: 'Complaints', icon: '\u{1F4DD}', route: '/complaints' },
    { label: 'Helpdesk', icon: '\u{1F3AB}', route: '/helpdesk' },
    { label: 'Alerts / SOS', icon: '\u{1F6A8}', route: '/alerts' },
    { label: 'Deliveries', icon: '\u{1F4E6}', route: '/deliveries' },
    { label: 'Vehicles', icon: '\u{1F697}', route: '/vehicles' },
    { label: 'Patrol', icon: '\u{1F6E1}', route: '/patrol' },
    { label: 'Incidents', icon: '\u{26A0}', route: '/incidents' },
    { label: 'Notes to Guard', icon: '\u{1F4CB}', route: '/notes-to-guard' },
    { label: 'Activity Logs', icon: '\u{1F4C3}', route: '/activity-logs' },
    { label: 'Residents', icon: '\u{1F3E0}', route: '/residents' },
    { label: 'Units', icon: '\u{1F3E2}', route: '/units' },
    { label: 'Notices', icon: '\u{1F4E2}', route: '/notices' },
    { label: 'Amenities', icon: '\u{1F3CA}', route: '/amenities' },
    { label: 'Directory', icon: '\u{1F4D6}', route: '/directory' },
    { label: 'Billing', icon: '\u{1F4B0}', route: '/billing', roles: ['super_admin', 'admin', 'society_admin'] },
    { label: 'Polls', icon: '\u{1F5F3}', route: '/polls' },
    { label: 'Committee', icon: '\u{1F465}', route: '/committee' },
    { label: 'Settings', icon: '\u{2699}', route: '/settings', roles: ['super_admin', 'admin', 'society_admin'] },
  ];

  navItems: NavItem[] = [];

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.userRole = user?.role || '';
      this.navItems = this.allNavItems.filter(item =>
        !item.roles || item.roles.includes(this.userRole)
      );
    });
  }

  logout() {
    this.authService.logout();
  }
}
