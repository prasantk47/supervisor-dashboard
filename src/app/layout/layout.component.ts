import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="layout">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-header></app-header>
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: #050508; }
    .main-content {
      flex: 1;
      margin-left: 72px;
      transition: margin-left 0.3s cubic-bezier(.4,0,.2,1);
      background: #0A0A10;
      min-height: 100vh;
    }
    .page-content { padding: 0; }
  `]
})
export class LayoutComponent {}
