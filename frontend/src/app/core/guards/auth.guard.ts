import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // During SSR/prerender there is no browser storage; avoid false redirects.
  if (typeof window === 'undefined') {
    return true;
  }

  if (authService.isAuthenticated() || !!authService.getAccessToken()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (typeof window === 'undefined') {
    return true;
  }

  if ((authService.isAuthenticated() || !!authService.getAccessToken()) && user?.role === 'ADMIN') {
    return true;
  }

  return router.createUrlTree(['/']);
};
