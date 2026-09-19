import { Component, computed, effect, inject, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { NzFormStatusService } from 'ng-zorro-antd/core/form';
import { NzFormModule } from 'ng-zorro-antd/form';

/**
 * One labelled form row for a Signal Forms field, rendered with ng-zorro.
 *
 * ng-zorro's `nz-form-control` only derives status and messages from reactive-forms
 * controls, so this component binds them from the field's signals instead: the row
 * turns red and shows the field's first error once the user has touched or edited it.
 * The required marker follows the schema (`required(path.x)`), so it is never out of sync.
 *
 * The projected input resolves ng-zorro's status service through this element, not the inner
 * `nz-form-control`, so this component provides its own instance and feeds it the status. That is
 * what turns the input border red.
 *
 * Usage:
 * ```html
 * <app-form-field [field]="form.email" label="Email" for="email">
 *   <input nz-input id="email" [formField]="form.email" />
 * </app-form-field>
 * ```
 */
@Component({
  selector: 'app-form-field',
  imports: [NzFormModule],
  providers: [NzFormStatusService],
  template: `
    <nz-form-item>
      @if (label(); as label) {
        <nz-form-label [nzFor]="for()" [nzRequired]="state().required()">{{ label }}</nz-form-label>
      }
      <nz-form-control [nzValidateStatus]="status()" [nzErrorTip]="errorTip()">
        <ng-content />
      </nz-form-control>
    </nz-form-item>
  `,
})
export class FormField {
  readonly field = input.required<FieldTree<unknown>>();
  readonly label = input<string>();
  /** `id` of the input inside, so the label focuses it. */
  readonly for = input<string>();

  protected readonly state = computed(() => this.field()());

  protected readonly status = computed(() => {
    const state = this.state();
    const interacted = state.touched() || state.dirty();
    return interacted && state.invalid() ? 'error' : '';
  });

  protected readonly errorTip = computed(() => this.state().errors()[0]?.message ?? '');

  readonly #statusService = inject(NzFormStatusService);

  constructor() {
    effect(() => {
      this.#statusService.formStatusChanges.next({ status: this.status(), hasFeedback: false });
    });
  }
}
