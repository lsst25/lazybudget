import { Component, computed, inject } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Auth } from '@core/auth/auth';
import { apiErrorMessage } from '@core/data/api-error';
import { mutation } from '@core/data/mutation';

interface Registration {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Group-level check that both passwords match. The error is mirrored onto the
 * confirmation control so nz-form can show it as an error tip under that field.
 */
export function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password');
  const confirmation = group.get('password_confirmation');
  if (!password || !confirmation) {
    return null;
  }

  const mismatch = confirmation.value !== '' && password.value !== confirmation.value;
  const { mismatch: _current, ...others } = confirmation.errors ?? {};

  if (mismatch) {
    confirmation.setErrors({ ...others, mismatch: true });
    return { mismatch: true };
  }

  confirmation.setErrors(Object.keys(others).length > 0 ? others : null);
  return null;
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  readonly #auth = inject(Auth);
  readonly #router = inject(Router);
  readonly #fb = inject(NonNullableFormBuilder);

  readonly form = this.#fb.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  readonly register = mutation<Registration, { token: string }>({
    mutationFn: (input) => this.#auth.register(input),
    onSuccess: () => {
      void this.#router.navigateByUrl('/budget');
    },
  });

  readonly errorMessage = computed(() => apiErrorMessage(this.register.error()));

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.register.mutate(this.form.getRawValue());
  }
}
