import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/budget' },
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('@pages/register/register').then((m) => m.Register),
  },
  {
    path: 'budget',
    canActivate: [authGuard],
    loadChildren: () => import('@pages/budget/budget.routes').then((m) => m.BUDGET_ROUTES),
  },
];
