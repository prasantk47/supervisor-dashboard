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
    <aside class="sidebar" [class.expanded]="expanded"
           (mouseenter)="expanded = true" (mouseleave)="expanded = false">

      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-circle">
          <span class="logo-letter">V</span>
        </div>
        <span class="logo-text" *ngIf="expanded">{{ sidebarTitle }}</span>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <a *ngFor="let item of navItems"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-item"
           [title]="item.label">
          <div class="active-indicator"></div>
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label" *ngIf="expanded">{{ item.label }}</span>
        </a>
      </nav>

      <!-- Profile -->
      <div class="profile-section">
        <div class="profile-avatar">
          <span>{{ userInitial }}</span>
        </div>
        <div class="profile-info" *ngIf="expanded">
          <span class="profile-name">{{ userName }}</span>
          <span class="profile-role">{{ userRole }}</span>
        </div>
      </div>

      <!-- Logout -->
      <div class="logout-section">
        <a class="nav-item logout-item" (click)="logout()" title="Logout">
          <span class="nav-icon">\u{1F6AA}</span>
          <span class="nav-label" *ngIf="expanded">Logout</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 72px;
      height: 100vh;
      background: #111118;
      border-right: 1px solid rgba(200,169,125,0.10);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(.4,0,.2,1);
      overflow: hidden;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
    }
    .sidebar.expanded { width: 230px; }

    .logo-section {
      padding: 18px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border-bottom: 1px solid rgba(200,169,125,0.10);
      min-height: 64px;
    }
    .logo-circle {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #C8A97D, #DFC59D);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .logo-letter {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      font-weight: 700;
      color: #050508;
    }
    .logo-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      font-weight: 600;
      color: #F2EDE4;
      white-space: nowrap;
      letter-spacing: -0.3px;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 12px;
      cursor: pointer;
      color: #7D786E;
      text-decoration: none;
      transition: all 0.2s ease;
      position: relative;
      font-size: 13px;
      font-family: 'Sora', sans-serif;
    }
    .nav-item:hover {
      background: #1F1F28;
      color: #C8C2B6;
    }
    .nav-item.active {
      background: rgba(200,169,125,0.08);
      color: #C8A97D;
    }
    .active-indicator {
      position: absolute;
      left: 0;
      top: 20%;
      bottom: 20%;
      width: 3px;
      border-radius: 2px;
      background: transparent;
      transition: background 0.2s;
    }
    .nav-item.active .active-indicator {
      background: #C8A97D;
    }

    .nav-icon {
      font-size: 18px;
      min-width: 24px;
      text-align: center;
      flex-shrink: 0;
    }
    .nav-label {
      white-space: nowrap;
      font-weight: 400;
    }
    .nav-item.active .nav-label { font-weight: 600; }

    .profile-section {
      padding: 14px;
      border-top: 1px solid rgba(200,169,125,0.10);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .profile-avatar {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #C8A97D, #DFC59D);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 13px;
      font-weight: 700;
      color: #050508;
    }
    .profile-info {
      display: flex;
      flex-direction: column;
    }
    .profile-name {
      font-size: 12px;
      font-weight: 600;
      color: #F2EDE4;
      white-space: nowrap;
    }
    .profile-role {
      font-size: 10px;
      color: #4A4740;
      text-transform: capitalize;
      white-space: nowrap;
    }

    .logout-section {
      padding: 4px 10px 12px;
    }
    .logout-item:hover {
      color: #F06868 !important;
      background: rgba(240,104,104,0.08) !important;
    }
  `]
})
export class SidebarComponent {
  expanded = false;
  userRole = '';
  userName = '';
  userInitial = 'U';
  sidebarTitle = 'Vistr+';

  superAdminNav: NavItem[] = [
    { label: 'Dashboard', icon: '\u{1F4CA}', route: '/dashboard' },
    { label: 'Societies', icon: '\u{1F3D8}', route: '/societies' },
    { label: 'Society Setup', icon: '\u{2699}', route: '/settings' },
    { label: 'Staff', icon: '\u{1F464}', route: '/staff' },
    { label: 'Daily Help Setup', icon: '\u{1F9F9}', route: '/daily-help-setup' },
    { label: 'Mass Upload', icon: '\u{1F4E4}', route: '/mass-upload' },
    { label: 'Residents', icon: '\u{1F3E0}', route: '/residents' },
    { label: 'Units', icon: '\u{1F3E2}', route: '/units' },
  ];

  supervisorNav: NavItem[] = [
    { label: 'Dashboard', icon: '\u{1F4CA}', route: '/dashboard' },
    { label: 'Residents', icon: '\u{1F3E0}', route: '/residents' },
    { label: 'Units', icon: '\u{1F3E2}', route: '/units' },
    { label: 'Visitors', icon: '\u{1F6B6}', route: '/visitors' },
    { label: 'Daily Help', icon: '\u{1F9F9}', route: '/daily-help' },
    { label: 'Local Services', icon: '\u{1F527}', route: '/local-services' },
    { label: 'Staff', icon: '\u{1F464}', route: '/staff' },
    { label: 'Security & Shifts', icon: '\u{1F6E1}', route: '/security-shifts' },
    { label: 'Complaints', icon: '\u{1F4DD}', route: '/complaints' },
    { label: 'Helpdesk', icon: '\u{1F3AB}', route: '/helpdesk' },
    { label: 'Alerts / SOS', icon: '\u{1F6A8}', route: '/alerts' },
    { label: 'Emergency', icon: '\u{1F6D1}', route: '/emergency-contacts' },
    { label: 'Deliveries', icon: '\u{1F4E6}', route: '/deliveries' },
    { label: 'Vehicles', icon: '\u{1F697}', route: '/vehicles' },
    { label: 'Patrol', icon: '\u{1F6E1}', route: '/patrol' },
    { label: 'QR Code', icon: '\u{1F4F1}', route: '/qr-code' },
    { label: 'Incidents', icon: '\u{26A0}', route: '/incidents' },
    { label: 'Notes to Guard', icon: '\u{1F4CB}', route: '/notes-to-guard' },
    { label: 'Activity Logs', icon: '\u{1F4C3}', route: '/activity-logs' },
    { label: 'Community Setup', icon: '\u{1F3D7}', route: '/community-setup' },
    { label: 'Notices', icon: '\u{1F4E2}', route: '/notices' },
    { label: 'Amenities', icon: '\u{1F3CA}', route: '/amenities' },
    { label: 'Directory', icon: '\u{1F4D6}', route: '/directory' },
    { label: 'Polls', icon: '\u{1F5F3}', route: '/polls' },
    { label: 'Committee', icon: '\u{1F465}', route: '/committee' },
    { label: 'Billing', icon: '\u{1F4B3}', route: '/billing' },
    { label: 'Advertisements', icon: '\u{1F4E3}', route: '/advertisements' },
    { label: 'ANPR', icon: '\u{1F4F7}', route: '/anpr' },
    { label: 'Attendance', icon: '\u{1F4CB}', route: '/attendance' },
    { label: 'Carpooling', icon: '\u{1F698}', route: '/carpooling' },
    { label: 'Daily Essentials', icon: '\u{1F6D2}', route: '/daily-essentials' },
    { label: 'Documents', icon: '\u{1F4C4}', route: '/documents' },
    { label: 'Domestic Staff', icon: '\u{1F9F9}', route: '/domestic-staff' },
    { label: 'Events', icon: '\u{1F389}', route: '/events' },
    { label: 'Face Recognition', icon: '\u{1F9D1}', route: '/face-recognition' },
    { label: 'Finance', icon: '\u{1F4B0}', route: '/finance' },
    { label: 'Forum', icon: '\u{1F4AC}', route: '/forum' },
    { label: 'Group Discussion', icon: '\u{1F5E3}', route: '/group-discussion' },
    { label: 'Intercom', icon: '\u{1F4DE}', route: '/intercom' },
    { label: 'Lost & Found', icon: '\u{1F50D}', route: '/lost-found' },
    { label: 'Marketplace', icon: '\u{1F6CD}', route: '/marketplace' },
    { label: 'Move In/Out', icon: '\u{1F69A}', route: '/move-in-out' },
    { label: 'Parking', icon: '\u{1F17F}', route: '/parking' },
    { label: 'Pets', icon: '\u{1F43E}', route: '/pet' },
    { label: 'Rental Agreement', icon: '\u{1F4DD}', route: '/rental-agreement' },
    { label: 'Reports', icon: '\u{1F4CA}', route: '/reports' },
    { label: 'School Bus', icon: '\u{1F68C}', route: '/school-bus' },
    { label: 'Skill Exchange', icon: '\u{1F91D}', route: '/skill-exchange' },
    { label: 'SLA', icon: '\u{1F4C8}', route: '/sla' },
    { label: 'Staff Leave', icon: '\u{1F4C5}', route: '/staff-leave' },
    { label: 'Vendor', icon: '\u{1F3EA}', route: '/vendor' },
    { label: 'Energy Meters', icon: '\u{26A1}', route: '/energy-meters' },
    { label: 'Interest Groups', icon: '\u{1F465}', route: '/interest-groups' },
    { label: 'Settings', icon: '\u{2699}', route: '/settings' },
  ];

  navItems: NavItem[] = [];

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.userRole = (user?.role || '').toLowerCase();
      this.userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
      this.userInitial = this.userName ? this.userName[0].toUpperCase() : 'U';
      if (this.userRole === 'super_admin') {
        this.sidebarTitle = 'Vistr+ Admin';
        this.navItems = this.superAdminNav;
      } else {
        this.sidebarTitle = 'Vistr+';
        this.navItems = this.supervisorNav;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
