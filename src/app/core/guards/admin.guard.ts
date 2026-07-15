import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { getUserRoleName } from '../../models/user.model';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loadCurrentUser().pipe(
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        });
      }

      return getUserRoleName(user) === 'admin'
        ? true
        : router.createUrlTree(['/forbidden']);
    })
  );
};
