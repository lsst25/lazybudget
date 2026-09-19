import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth-guard';
import { lastBudgetGuard } from '@core/budgets/last-budget-guard';

export const routes: Routes = [
  {
    // Pure redirect: to the last opened budget, or to the list when there is none.
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard, lastBudgetGuard],
    children: [],
  },
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('@pages/register/register').then((m) => m.Register),
  },
  {
    path: 'budgets',
    canActivate: [authGuard],
    loadChildren: () => import('@pages/budgets/budgets.routes').then((m) => m.BUDGETS_ROUTES),
  },
];
