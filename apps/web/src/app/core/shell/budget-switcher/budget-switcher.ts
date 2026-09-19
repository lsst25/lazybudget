import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Budgets } from '@core/budgets/budgets';
import { openCreateBudgetModal } from '@core/budgets/create-budget-modal/create-budget-modal';

/**
 * Logo block at the top of the sider. Clicking it opens a menu to start a new
 * budget, jump to another one, or see them all (like the plan menu in YNAB).
 */
@Component({
  selector: 'app-budget-switcher',
  imports: [RouterLink, NzDropdownModule, NzIconModule, NzMenuModule],
  templateUrl: './budget-switcher.html',
  styleUrl: './budget-switcher.scss',
})
export class BudgetSwitcher {
  readonly budgets = inject(Budgets);
  readonly #modal = inject(NzModalService);

  /** Sider is collapsed: show the logo only. */
  readonly collapsed = input(false);

  newBudget(): void {
    openCreateBudgetModal(this.#modal);
  }
}
