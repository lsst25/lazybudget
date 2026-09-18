import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/budget' },
  {
    path: 'budget',
    loadChildren: () => import('./pages/budget/budget.routes').then((m) => m.BUDGET_ROUTES),
  },
];
