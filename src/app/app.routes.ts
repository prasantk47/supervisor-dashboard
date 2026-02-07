import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './auth/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'visitors', loadComponent: () => import('./pages/visitors/visitors.component').then(m => m.VisitorsComponent) },
      { path: 'daily-help', loadComponent: () => import('./pages/daily-help/daily-help.component').then(m => m.DailyHelpComponent) },
      { path: 'staff', loadComponent: () => import('./pages/staff/staff.component').then(m => m.StaffComponent) },
      { path: 'complaints', loadComponent: () => import('./pages/complaints/complaints.component').then(m => m.ComplaintsComponent) },
      { path: 'helpdesk', loadComponent: () => import('./pages/helpdesk/helpdesk.component').then(m => m.HelpdeskComponent) },
      { path: 'alerts', loadComponent: () => import('./pages/alerts/alerts.component').then(m => m.AlertsComponent) },
      { path: 'deliveries', loadComponent: () => import('./pages/deliveries/deliveries.component').then(m => m.DeliveriesComponent) },
      { path: 'vehicles', loadComponent: () => import('./pages/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
      { path: 'patrol', loadComponent: () => import('./pages/patrol/patrol.component').then(m => m.PatrolComponent) },
      { path: 'incidents', loadComponent: () => import('./pages/incidents/incidents.component').then(m => m.IncidentsComponent) },
      { path: 'notes-to-guard', loadComponent: () => import('./pages/notes-to-guard/notes-to-guard.component').then(m => m.NotesToGuardComponent) },
      { path: 'activity-logs', loadComponent: () => import('./pages/activity-logs/activity-logs.component').then(m => m.ActivityLogsComponent) },
      { path: 'residents', loadComponent: () => import('./pages/residents/residents.component').then(m => m.ResidentsComponent) },
      { path: 'units', loadComponent: () => import('./pages/units/units.component').then(m => m.UnitsComponent) },
      { path: 'notices', loadComponent: () => import('./pages/notices/notices.component').then(m => m.NoticesComponent) },
      { path: 'amenities', loadComponent: () => import('./pages/amenities/amenities.component').then(m => m.AmenitiesComponent) },
      { path: 'directory', loadComponent: () => import('./pages/directory/directory.component').then(m => m.DirectoryComponent) },
      { path: 'billing', loadComponent: () => import('./pages/billing/billing.component').then(m => m.BillingComponent) },
      { path: 'polls', loadComponent: () => import('./pages/polls/polls.component').then(m => m.PollsComponent) },
      { path: 'committee', loadComponent: () => import('./pages/committee/committee.component').then(m => m.CommitteeComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
      // Super Admin pages
      { path: 'societies', loadComponent: () => import('./pages/societies/societies.component').then(m => m.SocietiesComponent) },
      { path: 'daily-help-setup', loadComponent: () => import('./pages/daily-help-setup/daily-help-setup.component').then(m => m.DailyHelpSetupComponent) },
      { path: 'mass-upload', loadComponent: () => import('./pages/mass-upload/mass-upload.component').then(m => m.MassUploadComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
