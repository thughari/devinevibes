import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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

  const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
  if (!isBrowser) {
    // In server-side rendering there is no localStorage; allow navigation and let the client handle auth checks.
    return true;
  }
  
  const token = authService.getAccessToken();

  if (!token) {
    return router.createUrlTree(['/']);
  }

  const user = authService.currentUser();
  
  // If user is already loaded in state
  if (user) {
    if (user.role === 'ADMIN') return true;
    return router.createUrlTree(['/']);
  }
  
  // If user is not loaded yet (e.g., hard refresh), wait for profile fetch before resolving route
  return authService.fetchProfile().pipe(
    map(profile => {
      if (profile && profile.role === 'ADMIN') {
        return true;
      }
      return router.createUrlTree(['/']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/']));
    })
  );
};


