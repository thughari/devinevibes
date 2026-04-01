import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { FormErrorService } from '../services/form-error.service';
import { NotificationService } from '../services/notification.service';

interface BackendError {
  timestamp: string;
  status?: number;
  message?: string;
  errors?: Record<string, string>;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  const formErrorService = inject(FormErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const payload = error.error as BackendError;

      if (payload?.message) {
        notify.show(payload.message, 'error');
      }

      if (payload?.errors) {
        formErrorService.setErrors(payload.errors);
      } else {
        formErrorService.clear();
      }

      return throwError(() => error);
    })
  );
};
