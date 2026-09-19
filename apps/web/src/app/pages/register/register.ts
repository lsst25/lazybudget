import { Component, computed, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Auth } from '@core/auth/auth';
import { apiErrorMessage } from '@core/data/api-error';
import { mutation } from '@core/data/mutation';
import { FormField as AppFormField } from '@core/forms/form-field';

interface Registration {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

@Component({
  selector: 'app-register',
  imports: [
    FormField,
    AppFormField,
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

  readonly model = signal<Registration>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  readonly form = form(this.model, (path) => {
    required(path.name, { message: 'Enter your name' });
    required(path.email, { message: 'Enter your email address' });
    email(path.email, { message: 'Enter a valid email address' });
    required(path.password, { message: 'Choose a password' });
    minLength(path.password, 8, { message: 'Use at least 8 characters' });
    required(path.password_confirmation, { message: 'Repeat your password' });
    // Cross-field rule: lives on the confirmation so the error shows under that input.
    validate(path.password_confirmation, ({ value, valueOf }) =>
      value() !== valueOf(path.password)
        ? { kind: 'mismatch', message: 'The passwords do not match' }
        : null,
    );
  });

  readonly register = mutation<Registration, { token: string }>({
    mutationFn: (input) => this.#auth.register(input),
    onSuccess: () => {
      void this.#router.navigateByUrl('/');
    },
  });

  readonly errorMessage = computed(() => apiErrorMessage(this.register.error()));

  /** Marks every field touched; runs the mutation only when the form is valid. */
  submit(): Promise<boolean> {
    return submit(this.form, async () => {
      this.register.mutate(this.model());
    });
  }
}
