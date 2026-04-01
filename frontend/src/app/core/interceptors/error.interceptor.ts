import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SnackbarService } from '../../shared/services/snackbar.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbar = inject(SnackbarService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Backend error
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        // Handle validation errors (if any)
        if (error.error && error.error.errors) {
          // We can let the component handle specific field errors, 
          // but we still show a generic validation message
          errorMessage = 'Please check the form for errors.';
        }
      }

      // Don't show snackbar for 401s if they are being handled by auth interceptor refresh
      if (error.status !== 401 || req.url.includes('/auth/refresh')) {
         snackbar.showError(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
