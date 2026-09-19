import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { apiErrorMessage } from '@core/data/api-error';
import { mutation } from '@core/data/mutation';
import { FormField as AppFormField } from '@core/forms/form-field';
import { Budget, CreateBudget } from '../budget.model';
import { Budgets } from '../budgets';

/** Open the "new budget" dialog. On success it navigates to the new budget itself. */
export function openCreateBudgetModal(
  modal: NzModalService,
): NzModalRef<CreateBudgetModal, Budget> {
  return modal.create<CreateBudgetModal, undefined, Budget>({
    nzTitle: 'New budget',
    nzContent: CreateBudgetModal,
    nzFooter: null,
    nzAutofocus: null,
    nzWidth: 420,
  });
}

@Component({
  selector: 'app-create-budget-modal',
  imports: [FormField, AppFormField, NzAlertModule, NzButtonModule, NzFormModule, NzInputModule],
  templateUrl: './create-budget-modal.html',
  styleUrl: './create-budget-modal.scss',
})
export class CreateBudgetModal {
  readonly #budgets = inject(Budgets);
  readonly #router = inject(Router);
  readonly #modalRef = inject(NzModalRef<CreateBudgetModal, Budget>);
  readonly model = signal<CreateBudget>({ name: '' });

  readonly form = form(this.model, (path) => {
    required(path.name, { message: 'Give the budget a name' });
    maxLength(path.name, 255, { message: 'Keep the name under 255 characters' });
  });

  readonly create = mutation<CreateBudget, Budget>({
    mutationFn: (input) => this.#budgets.create(input),
    onSuccess: (budget) => {
      this.#modalRef.close(budget);
      void this.#router.navigate(['/budgets', budget.id]);
    },
  });

  readonly errorMessage = computed(() => apiErrorMessage(this.create.error()));

  /** Marks every field touched; runs the mutation only when the form is valid. */
  submit(): Promise<boolean> {
    return submit(this.form, async () => {
      this.create.mutate(this.model());
    });
  }

  cancel(): void {
    this.#modalRef.close();
  }
}
