import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BudgetDto, Envelope } from './budget.dto';
import { toBudget, toBudgets, toCreateBudgetDto } from './budget.mapper';
import { Budget, CreateBudget } from './budget.model';

/** The only place that knows the budget endpoints. Speaks DTOs to the API, models to the app. */
@Service()
export class BudgetRepository {
  readonly #http = inject(HttpClient);
  readonly #base = '/api/v1/budgets';

  list(): Observable<Budget[]> {
    return this.#http
      .get<Envelope<BudgetDto[]>>(this.#base)
      .pipe(map(({ data }) => toBudgets(data)));
  }

  find(id: number): Observable<Budget> {
    return this.#http
      .get<Envelope<BudgetDto>>(`${this.#base}/${id}`)
      .pipe(map(({ data }) => toBudget(data)));
  }

  create(input: CreateBudget): Observable<Budget> {
    return this.#http
      .post<Envelope<BudgetDto>>(this.#base, toCreateBudgetDto(input))
      .pipe(map(({ data }) => toBudget(data)));
  }
}
