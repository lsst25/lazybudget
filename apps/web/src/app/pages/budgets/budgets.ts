import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Budgets } from '@core/budgets/budgets';
import { openCreateBudgetModal } from '@core/budgets/create-budget-modal/create-budget-modal';
import { apiErrorMessage } from '@core/data/api-error';

@Component({
  selector: 'app-budgets',
  imports: [
    DatePipe,
    RouterLink,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class BudgetsPage {
  readonly budgets = inject(Budgets);
  readonly #modal = inject(NzModalService);

  readonly errorMessage = computed(() => {
    const error = this.budgets.list.error();
    return error ? apiErrorMessage(error as never) : null;
  });

  newBudget(): void {
    openCreateBudgetModal(this.#modal);
  }

  retry(): void {
    this.budgets.list.reload();
  }
}
