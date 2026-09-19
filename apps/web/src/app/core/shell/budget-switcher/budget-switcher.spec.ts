import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AUTH_TOKEN_STORAGE_KEY } from '@core/auth/auth';
import { LAST_BUDGET_STORAGE_KEY } from '@core/budgets/budgets';
import { CreateBudgetModal } from '@core/budgets/create-budget-modal/create-budget-modal';
import { icons } from '../../../icons-provider';
import { BudgetSwitcher } from './budget-switcher';

describe('BudgetSwitcher', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|token');
    await TestBed.configureTestingModule({
      imports: [BudgetSwitcher],
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
    const fixture = TestBed.createComponent(BudgetSwitcher);
    // whenStable() would wait for the request we are about to answer, so render synchronously first.
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne({ method: 'GET', url: '/api/v1/budgets' }).flush({
      data: [
        { id: 1, name: 'Household', first_month: '2026-09-01', created_at: null, role: 'owner' },
        { id: 2, name: 'Holiday', first_month: '2026-09-01', created_at: null, role: 'member' },
      ],
    });
    await fixture.whenStable();
    return fixture;
  }

  it('shows the app name when no budget is open', async () => {
    const fixture = await setup();

    expect(fixture.nativeElement.querySelector('.switcher__name')?.textContent?.trim()).toBe(
      'lazybudget',
    );
  });

  it('shows the current budget name', async () => {
    localStorage.setItem(LAST_BUDGET_STORAGE_KEY, '2');
    const fixture = await setup();

    expect(fixture.nativeElement.querySelector('.switcher__name')?.textContent?.trim()).toBe(
      'Holiday',
    );
  });

  it('hides the name when collapsed', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('collapsed', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.switcher__name')).toBeNull();
    expect(fixture.nativeElement.querySelector('.switcher__logo')).not.toBeNull();
  });

  it('opens the create-budget dialog', async () => {
    const fixture = await setup();
    const create = vi.spyOn(TestBed.inject(NzModalService), 'create').mockReturnValue({} as never);

    fixture.componentInstance.newBudget();

    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0][0]).toMatchObject({ nzContent: CreateBudgetModal, nzFooter: null });
  });
});
