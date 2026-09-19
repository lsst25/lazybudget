import { Routes } from '@angular/router';

export const BUDGETS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./budgets').then((m) => m.BudgetsPage),
  },
  {
    path: ':budgetId',
    loadComponent: () => import('./budget/budget').then((m) => m.BudgetPage),
  },
];
