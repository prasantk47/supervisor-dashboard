import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Vistr+</h1>
          <p>Supervisor Dashboard</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email"
                   placeholder="Enter email address" required>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password"
                   placeholder="Enter password" required>
          </div>

          <div class="error-msg" *ngIf="error">{{ error }}</div>

          <button type="submit" [disabled]="loading" class="login-btn">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }
    .login-card {
      background: #fff;
      border-radius: 12px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
      h1 { font-size: 28px; color: #1a1a2e; margin: 0; }
      p { color: #666; margin: 4px 0 0; }
    }
    .form-group {
      margin-bottom: 20px;
      label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #333; }
      input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        box-sizing: border-box;
        transition: border-color 0.2s;
        &:focus { outline: none; border-color: #4fc3f7; }
      }
    }
    .error-msg { color: #f44336; font-size: 13px; margin-bottom: 12px; }
    .login-btn {
      width: 100%;
      padding: 12px;
      background: #1a1a2e;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      &:hover { background: #16213e; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const role = (res.data.user.role || '').toLowerCase();
          const allowed = ['super_admin', 'supervisor', 'admin', 'society_admin', 'manager'];
          if (!allowed.includes(role)) {
            this.authService.logout();
            this.error = 'Access denied. This dashboard is for supervisors and admins only.';
            return;
          }
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
