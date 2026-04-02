import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
  if (!isBrowser) {
    // In server-side rendering there is no localStorage; allow navigation and let the client handle auth checks.
    return true;
  }

  const token = authService.getAccessToken();
  const isAuth = authService.isAuthenticated();

  if (isAuth || !!token) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();
  const token = authService.getAccessToken();
  const isAuth = authService.isAuthenticated();

  if ((isAuth || !!token) && user?.role === 'ADMIN') {
    return true;
  }

  return router.createUrlTree(['/']);
};


