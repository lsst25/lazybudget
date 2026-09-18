import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from './auth';

const isApiRequest = (url: string): boolean => url.startsWith('/api');

/**
 * Attaches the bearer token to API requests and, when the API answers 401,
 * drops the token and sends the user to the login page. The error is
 * rethrown so callers still observe the failure.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const token = auth.token();

  const request =
    token && isApiRequest(req.url)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && isApiRequest(req.url)) {
        auth.forget();
        void router.navigateByUrl('/login');
      }
      return throwError(() => err);
    }),
  );
};
