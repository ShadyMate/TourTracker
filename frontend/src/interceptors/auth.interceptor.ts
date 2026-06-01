import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isBackendRequest = req.url.startsWith(environment.backendUrl);

  // Attach credentials so the browser sends the HttpOnly accessToken cookie
  const outgoing = isBackendRequest
    ? req.clone({ withCredentials: true })
    : req;

  return next(outgoing).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && isBackendRequest) {
        return from(authService.logout()).pipe(
          switchMap(() => {
            router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
