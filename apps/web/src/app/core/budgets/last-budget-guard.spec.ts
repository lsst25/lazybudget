import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { LAST_BUDGET_STORAGE_KEY } from './budgets';
import { lastBudgetGuard } from './last-budget-guard';

describe('lastBudgetGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  function run() {
    return TestBed.runInInjectionContext(() =>
      lastBudgetGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('redirects to the last opened budget', () => {
    localStorage.setItem(LAST_BUDGET_STORAGE_KEY, '5');

    expect(TestBed.inject(Router).serializeUrl(run() as never)).toBe('/budgets/5');
  });

  it('redirects to the list when no budget was opened yet', () => {
    expect(TestBed.inject(Router).serializeUrl(run() as never)).toBe('/budgets');
  });
});
