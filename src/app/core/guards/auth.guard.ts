import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const ALLOWED_ROLES = ['super_admin', 'supervisor', 'admin', 'society_admin', 'manager'];

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.currentUser;
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    authService.logout();
    return false;
  }

  return true;
};
