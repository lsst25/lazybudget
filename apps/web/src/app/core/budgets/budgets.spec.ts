import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AUTH_TOKEN_STORAGE_KEY } from '@core/auth/auth';
import { BudgetDto } from './budget.dto';
import { toBudget } from './budget.mapper';
import { Budgets, LAST_BUDGET_STORAGE_KEY } from './budgets';

const household: BudgetDto = {
  id: 1,
  name: 'Household',
  first_month: '2026-09-01',
  created_at: '2026-09-18T18:00:00.000000Z',
  role: 'owner',
};
const holiday: BudgetDto = { ...household, id: 2, name: 'Holiday', role: 'member' };

describe('Budgets', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  function create() {
    const budgets = TestBed.inject(Budgets);
    const http = TestBed.inject(HttpTestingController);
    // Resources load in an effect; tick runs it so the request goes out.
    TestBed.tick();
    return { budgets, http };
  }

  /** The resource applies a response in a microtask; let those drain. */
  const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

  it('does not request the list while logged out', () => {
    const { budgets, http } = create();

    http.expectNone({ method: 'GET', url: '/api/v1/budgets' });
    expect(budgets.items()).toEqual([]);
    expect(budgets.current()).toBeNull();
  });

  it('loads and unwraps the list once logged in', async () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|token');
    const { budgets, http } = create();

    http.expectOne({ method: 'GET', url: '/api/v1/budgets' }).flush({ data: [household, holiday] });
    await settle();

    expect(budgets.items()).toEqual([toBudget(household), toBudget(holiday)]);
  });

  it('restores the last opened budget and resolves it from the list', async () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|token');
    localStorage.setItem(LAST_BUDGET_STORAGE_KEY, '2');
    const { budgets, http } = create();

    expect(budgets.currentId()).toBe(2);
    expect(budgets.current()).toBeNull();

    http.expectOne({ method: 'GET', url: '/api/v1/budgets' }).flush({ data: [household, holiday] });
    await settle();

    expect(budgets.current()).toEqual(toBudget(holiday));
  });

  it('ignores a garbage stored id', () => {
    localStorage.setItem(LAST_BUDGET_STORAGE_KEY, 'nope');
    const { budgets } = create();

    expect(budgets.currentId()).toBeNull();
  });

  it('open() remembers the budget for the next session', () => {
    const { budgets } = create();

    budgets.open(7);

    expect(budgets.currentId()).toBe(7);
    expect(localStorage.getItem(LAST_BUDGET_STORAGE_KEY)).toBe('7');
  });

  it('create() posts the name, returns the budget and reloads the list', async () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|token');
    const { budgets, http } = create();
    http.expectOne({ method: 'GET', url: '/api/v1/budgets' }).flush({ data: [household] });
    await settle();
    const next = vi.fn();

    budgets.create({ name: 'Holiday' }).subscribe(next);

    const post = http.expectOne({ method: 'POST', url: '/api/v1/budgets' });
    expect(post.request.body).toEqual({ name: 'Holiday' });
    post.flush({ data: holiday }, { status: 201, statusText: 'Created' });
    expect(next).toHaveBeenCalledExactlyOnceWith(toBudget(holiday));

    TestBed.tick();
    await settle();
    http.expectOne({ method: 'GET', url: '/api/v1/budgets' }).flush({ data: [holiday, household] });
    await settle();
    expect(budgets.items()).toEqual([toBudget(holiday), toBudget(household)]);
  });
});
