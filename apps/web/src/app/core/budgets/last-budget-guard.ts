import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Budgets } from './budgets';

/**
 * Sends the root URL to the budget the user last opened, or to the list of
 * budgets when there is none yet. Always redirects; the route has no page.
 */
export const lastBudgetGuard: CanActivateFn = () => {
  const id = inject(Budgets).currentId();
  const router = inject(Router);

  return router.createUrlTree(id === null ? ['/budgets'] : ['/budgets', id]);
};
