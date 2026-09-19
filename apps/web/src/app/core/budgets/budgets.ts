import { computed, inject, Service, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, tap } from 'rxjs';
import { Auth } from '@core/auth/auth';
import { Budget, CreateBudget } from './budget.model';
import { BudgetRepository } from './budget.repository';

export const LAST_BUDGET_STORAGE_KEY = 'lazybudget.last-budget';

/** Application state around budgets: the loaded list and the one the user is working in. */
@Service()
export class Budgets {
  readonly #repository = inject(BudgetRepository);
  readonly #auth = inject(Auth);

  readonly #currentId = signal<number | null>(this.#getStoredId());
  /** The budget the user is working in (the last one opened). Survives reloads. */
  readonly currentId = this.#currentId.asReadonly();

  /**
   * Every budget the user is a member of. `params` is undefined while logged out,
   * which keeps the resource idle: no request, and any stale list is dropped.
   */
  readonly list = rxResource<Budget[], true | undefined>({
    params: () => (this.#auth.isAuthenticated() ? true : undefined),
    stream: () => this.#repository.list(),
    defaultValue: [],
  });

  /** The loaded budgets, or an empty list while idle, loading for the first time, or failed. */
  readonly items = computed<Budget[]>(() => (this.list.hasValue() ? this.list.value() : []));

  readonly current = computed<Budget | null>(() => {
    const id = this.#currentId();
    return this.items().find((budget) => budget.id === id) ?? null;
  });

  open(id: number): void {
    this.#currentId.set(id);
    localStorage.setItem(LAST_BUDGET_STORAGE_KEY, String(id));
  }

  create(input: CreateBudget): Observable<Budget> {
    return this.#repository.create(input).pipe(
      tap(() => {
        this.list.reload();
      }),
    );
  }

  #getStoredId(): number | null {
    const stored = Number(localStorage.getItem(LAST_BUDGET_STORAGE_KEY));
    return Number.isInteger(stored) && stored > 0 ? stored : null;
  }
}
