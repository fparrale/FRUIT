import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/AuthService.service';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const AuthGuard: CanActivateFn = (route, state) => {
  const platform = inject(PLATFORM_ID)
  const authService = inject(AuthService);
  const router = inject(Router);

  if (isPlatformBrowser(platform)) {
    if (authService.isAuthenticated()) {
      return true;
    } else {
      router.navigate(['/login']).then(() => false);
    }
  }

  return false
};
