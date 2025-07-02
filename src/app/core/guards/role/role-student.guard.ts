import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/AuthService.service';
import { inject } from '@angular/core';

export const roleStudentGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
    const router = inject(Router);
  
    if (authService.getUserData()?.user.role.name == 'Estudiante') {
      return true;
    }
    
    router.navigate(['/home']);
    return false;
};
