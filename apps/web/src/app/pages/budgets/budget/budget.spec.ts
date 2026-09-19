import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AUTH_TOKEN_STORAGE_KEY } from '@core/auth/auth';
import { Budgets, LAST_BUDGET_STORAGE_KEY } from '@core/budgets/budgets';
import { BudgetPage } from './budget';

describe('BudgetPage', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|token');
    await TestBed.configureTestingModule({
      imports: [BudgetPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  async function setup(budgetId: string) {
    const fixture = TestBed.createComponent(BudgetPage);
    fixture.componentRef.setInput('budgetId', budgetId);
    // whenStable() would wait for the request each test answers itself; render synchronously first.
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    // The page fetches the budget; the shell service fetches the list. Only the first is under test.
    http.match({ method: 'GET', url: '/api/v1/budgets' }).forEach((r) => r.flush({ data: [] }));
    return { fixture, http };
  }

  it('fetches the budget from the URL and remembers it as current', async () => {
    const { fixture, http } = await setup('3');

    http.expectOne({ method: 'GET', url: '/api/v1/budgets/3' }).flush({
      data: {
        id: 3,
        name: 'Household',
        first_month: '2026-09-01',
        created_at: null,
        role: 'owner',
      },
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.budget__title')?.textContent).toBe('Household');
    expect(fixture.nativeElement.textContent).toContain('September 2026');
    expect(TestBed.inject(Budgets).currentId()).toBe(3);
    expect(localStorage.getItem(LAST_BUDGET_STORAGE_KEY)).toBe('3');
  });

  it('shows the API error and a way back to all budgets', async () => {
    const { fixture, http } = await setup('99');

    http
      .expectOne({ method: 'GET', url: '/api/v1/budgets/99' })
      .flush({ message: 'This action is unauthorized.' }, { status: 403, statusText: 'Forbidden' });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Could not open this budget');
    expect(fixture.nativeElement.textContent).toContain('This action is unauthorized.');
    expect(fixture.nativeElement.querySelector('a[href="/budgets"]')).not.toBeNull();
  });
});
