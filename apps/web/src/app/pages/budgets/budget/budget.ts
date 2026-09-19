import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Budget } from '@core/budgets/budget.model';
import { BudgetRepository } from '@core/budgets/budget.repository';
import { Budgets } from '@core/budgets/budgets';
import { apiErrorMessage } from '@core/data/api-error';

@Component({
  selector: 'app-budget',
  imports: [DatePipe, RouterLink, NzAlertModule, NzButtonModule, NzSpinModule, NzTagModule],
  templateUrl: './budget.html',
  styleUrl: './budget.scss',
})
export class BudgetPage {
  readonly #budgets = inject(Budgets);
  readonly #repository = inject(BudgetRepository);

  /** Bound from the `:budgetId` route parameter. */
  readonly budgetId = input.required<string>();

  /** `:budgetId` as a number, or null when the URL is not a valid id. */
  readonly id = computed<number | null>(() => {
    const id = Number(this.budgetId());
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  readonly budget = rxResource<Budget | null, number | null>({
    params: () => this.id(),
    stream: ({ params }) => this.#repository.find(params as number),
    defaultValue: null,
  });

  readonly errorMessage = computed(() => {
    const error = this.budget.error();
    return error ? apiErrorMessage(error as never) : null;
  });

  constructor() {
    // Whatever budget the URL points at becomes the one the shell is "in".
    effect(() => {
      const id = this.id();
      if (id !== null) {
        this.#budgets.open(id);
      }
    });
  }
}
