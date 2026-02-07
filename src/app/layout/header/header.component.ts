import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-left">
        <h1>{{ pageTitle }}</h1>
      </div>
      <div class="header-right">
        <div class="user-info" *ngIf="user">
          <span class="user-name">{{ user.fullName || (user.firstName + ' ' + user.lastName) }}</span>
          <span class="user-role">{{ user.role }}</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 60px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      h1 { font-size: 20px; margin: 0; color: #333; }
    }
    .header-right { display: flex; align-items: center; gap: 16px; }
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .user-name { font-weight: 600; font-size: 14px; color: #333; }
    .user-role { font-size: 12px; color: #666; text-transform: capitalize; }
  `]
})
export class HeaderComponent {
  pageTitle = 'Dashboard';
  user: User | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(u => this.user = u);
  }
}
