import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-left">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <span class="page-subtitle" *ngIf="pageSubtitle">{{ pageSubtitle }}</span>
      </div>

      <div class="header-center">
        <div class="search-box">
          <span class="search-icon">&#128269;</span>
          <input type="text" placeholder="Search..." class="search-input" />
        </div>
      </div>

      <div class="header-right">
        <button class="icon-btn" title="Notifications">
          <span>&#128276;</span>
          <span class="notif-dot"></span>
        </button>
        <div class="divider"></div>
        <div class="user-pill" *ngIf="user">
          <div class="user-avatar">
            <span>{{ userInitial }}</span>
          </div>
          <div class="user-meta">
            <span class="user-name">{{ user.fullName || (user.firstName + ' ' + user.lastName) }}</span>
            <span class="user-role">{{ user.role }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 64px;
      background: #111118;
      border-bottom: 1px solid rgba(200,169,125,0.10);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
    }

    .header-left { display: flex; align-items: baseline; gap: 12px; }

    .page-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      font-weight: 600;
      color: #F2EDE4;
      margin: 0;
      letter-spacing: -0.3px;
    }
    .page-subtitle {
      font-size: 12px;
      color: #7D786E;
      font-weight: 400;
    }

    .header-center { flex: 1; display: flex; justify-content: center; max-width: 420px; margin: 0 24px; }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #1F1F28;
      border: 1px solid rgba(200,169,125,0.10);
      border-radius: 10px;
      padding: 8px 16px;
      width: 100%;
      transition: border-color 0.2s;
    }
    .search-box:focus-within {
      border-color: rgba(200,169,125,0.30);
    }
    .search-icon { font-size: 14px; color: #7D786E; }
    .search-input {
      background: transparent;
      border: none;
      outline: none;
      color: #C8C2B6;
      font-family: 'Sora', sans-serif;
      font-size: 13px;
      width: 100%;
    }
    .search-input::placeholder { color: #4A4740; }

    .header-right { display: flex; align-items: center; gap: 14px; }

    .icon-btn {
      position: relative;
      background: #1F1F28;
      border: 1px solid rgba(200,169,125,0.10);
      border-radius: 10px;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
    }
    .icon-btn:hover {
      border-color: rgba(200,169,125,0.25);
      background: #18181F;
    }
    .notif-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #F06868;
    }

    .divider {
      width: 1px;
      height: 28px;
      background: rgba(200,169,125,0.10);
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 12px 4px 4px;
      border-radius: 12px;
      background: rgba(200,169,125,0.05);
      border: 1px solid rgba(200,169,125,0.08);
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #C8A97D, #DFC59D);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: #050508;
      flex-shrink: 0;
    }
    .user-meta { display: flex; flex-direction: column; }
    .user-name {
      font-size: 12px;
      font-weight: 600;
      color: #F2EDE4;
      white-space: nowrap;
    }
    .user-role {
      font-size: 10px;
      color: #7D786E;
      text-transform: capitalize;
      white-space: nowrap;
    }
  `]
})
export class HeaderComponent {
  pageTitle = 'Dashboard';
  pageSubtitle = '';
  user: User | null = null;
  userInitial = 'U';

  private routeTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/visitors': 'Visitors',
    '/daily-help': 'Daily Help',
    '/local-services': 'Local Services',
    '/staff': 'Staff',
    '/security-shifts': 'Security & Shifts',
    '/complaints': 'Complaints',
    '/helpdesk': 'Helpdesk',
    '/alerts': 'Alerts / SOS',
    '/emergency-contacts': 'Emergency Contacts',
    '/deliveries': 'Deliveries',
    '/vehicles': 'Vehicles',
    '/patrol': 'Patrol',
    '/qr-code': 'QR Code',
    '/incidents': 'Incidents',
    '/notes-to-guard': 'Notes to Guard',
    '/activity-logs': 'Activity Logs',
    '/residents': 'Residents',
    '/units': 'Units',
    '/community-setup': 'Community Setup',
    '/notices': 'Notices',
    '/amenities': 'Amenities',
    '/directory': 'Directory',
    '/polls': 'Polls',
    '/committee': 'Committee',
    '/billing': 'Billing',
    '/advertisements': 'Advertisements',
    '/anpr': 'ANPR',
    '/attendance': 'Attendance',
    '/carpooling': 'Carpooling',
    '/daily-essentials': 'Daily Essentials',
    '/documents': 'Documents',
    '/domestic-staff': 'Domestic Staff',
    '/events': 'Events',
    '/face-recognition': 'Face Recognition',
    '/finance': 'Finance',
    '/forum': 'Forum',
    '/group-discussion': 'Group Discussion',
    '/intercom': 'Intercom',
    '/lost-found': 'Lost & Found',
    '/marketplace': 'Marketplace',
    '/move-in-out': 'Move In/Out',
    '/parking': 'Parking',
    '/pet': 'Pets',
    '/rental-agreement': 'Rental Agreement',
    '/reports': 'Reports',
    '/school-bus': 'School Bus',
    '/skill-exchange': 'Skill Exchange',
    '/sla': 'SLA',
    '/staff-leave': 'Staff Leave',
    '/vendor': 'Vendor',
    '/settings': 'Settings',
    '/societies': 'Societies',
    '/daily-help-setup': 'Daily Help Setup',
    '/mass-upload': 'Mass Upload',
  };

  constructor(private authService: AuthService, private router: Router) {
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      this.userInitial = u ? `${u.firstName || ''}`.charAt(0).toUpperCase() || 'U' : 'U';
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url = e.urlAfterRedirects || e.url;
      this.pageTitle = this.routeTitles[url] || 'Dashboard';
    });
  }
}
