import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

/**
 * Lets authenticated users through; sends everyone else to /login with the
 * attempted URL in `redirect`, so the login page can return them afterwards.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);

  return (
    auth.isAuthenticated() ||
    router.createUrlTree(['/login'], { queryParams: { redirect: state.url } })
  );
};
