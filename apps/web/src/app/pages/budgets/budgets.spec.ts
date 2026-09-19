import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { AUTH_TOKEN_STORAGE_KEY } from '@core/auth/auth';
import { icons } from '../../icons-provider';
import { BudgetsPage } from './budgets';

describe('BudgetsPage', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|token');
    await TestBed.configureTestingModule({
      imports: [BudgetsPage],
      providers: [
        provideRouter([]),
        provideNzIcons(icons),
        provideHttpClient(),
        provideHttpClientTesting(),
        importProvidersFrom(NzModalModule),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  async function setup() {
    const fixture = TestBed.createComponent(BudgetsPage);
    // whenStable() would wait for the request each test answers itself; render synchronously first.
    fixture.detectChanges();
    return { fixture, http: TestBed.inject(HttpTestingController) };
  }

  it('renders one row per budget with role and first month', async () => {
    const { fixture, http } = await setup();

    http.expectOne({ method: 'GET', url: '/api/v1/budgets' }).flush({
      data: [
        { id: 1, name: 'Household', first_month: '2026-09-01', created_at: null, role: 'owner' },
        { id: 2, name: 'Holiday', first_month: '2026-01-01', created_at: null, role: 'member' },
      ],
    });
    await fixture.whenStable();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('Household');
    expect(rows[0].textContent).toContain('owner');
    expect(rows[0].textContent).toContain('September 2026');
    expect(rows[0].querySelector('a')?.getAttribute('href')).toBe('/budgets/1');
  });

  it('shows an error with a retry that refetches', async () => {
    const { fixture, http } = await setup();

    http
      .expectOne({ method: 'GET', url: '/api/v1/budgets' })
      .flush({ message: 'Server Error' }, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Could not load your budgets');
    expect(fixture.nativeElement.textContent).toContain('Server Error');

    fixture.componentInstance.retry();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));

    http.expectOne({ method: 'GET', url: '/api/v1/budgets' }).flush({ data: [] });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Could not load your budgets');
  });
});
