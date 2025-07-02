import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/AuthService.service';

export const roleAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getUserData()?.user.role.name == 'Administrador') {
    return true;
  }
  
  router.navigate(['/home']);
  return false;
};
