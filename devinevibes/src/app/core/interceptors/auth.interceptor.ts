import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const NO_AUTH_PATHS = ['/auth/google', '/auth/send-otp', '/auth/verify-otp', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const needsAuth = !NO_AUTH_PATHS.some((path) => req.url.includes(path));
  const token = authService.getAccessToken();

  const authReq = needsAuth && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || req.url.includes('/auth/refresh')) {
        return throwError(() => error);
      }

      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        authService.logout();
        void router.navigate(['/auth']);
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap((response) => {
          const retryReq = req.clone({
            setHeaders: { Authorization: `${response.tokenType} ${response.accessToken}` }
          });
          return next(retryReq);
        }),
        catchError((refreshError) => {
          authService.logout();
          void router.navigate(['/auth']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
