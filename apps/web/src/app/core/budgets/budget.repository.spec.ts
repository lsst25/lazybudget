import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BudgetDto } from './budget.dto';
import { Budget } from './budget.model';
import { BudgetRepository } from './budget.repository';

const dto: BudgetDto = {
  id: 1,
  name: 'Household',
  first_month: '2026-09-01',
  created_at: null,
  role: 'owner',
};

describe('BudgetRepository', () => {
  let repository: BudgetRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(BudgetRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() GETs the collection and returns models', () => {
    const next = vi.fn();

    repository.list().subscribe(next);
    http.expectOne({ method: 'GET', url: '/api/v1/budgets' }).flush({ data: [dto] });

    const budgets = next.mock.calls[0][0] as Budget[];
    expect(budgets).toHaveLength(1);
    expect(budgets[0]).toBeInstanceOf(Budget);
    expect(budgets[0].name).toBe('Household');
  });

  it('find() GETs one budget by id', () => {
    const next = vi.fn();

    repository.find(1).subscribe(next);
    http.expectOne({ method: 'GET', url: '/api/v1/budgets/1' }).flush({ data: dto });

    expect(next.mock.calls[0][0]).toBeInstanceOf(Budget);
  });

  it('create() POSTs the DTO and returns the created model', () => {
    const next = vi.fn();

    repository.create({ name: 'Holiday' }).subscribe(next);
    const req = http.expectOne({ method: 'POST', url: '/api/v1/budgets' });
    expect(req.request.body).toEqual({ name: 'Holiday' });
    req.flush({ data: { ...dto, id: 2, name: 'Holiday' } }, { status: 201, statusText: 'Created' });

    const budget = next.mock.calls[0][0] as Budget;
    expect(budget).toBeInstanceOf(Budget);
    expect(budget.id).toBe(2);
  });
});
