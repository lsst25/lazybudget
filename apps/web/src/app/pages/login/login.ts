import { Component, computed, inject, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Auth } from '@core/auth/auth';
import { apiErrorMessage } from '@core/data/api-error';
import { mutation } from '@core/data/mutation';
import { FormField as AppFormField } from '@core/forms/form-field';

interface Credentials {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [
    FormField,
    AppFormField,
    RouterLink,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  readonly #auth = inject(Auth);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  readonly model = signal<Credentials>({ email: '', password: '' });

  readonly form = form(this.model, (path) => {
    required(path.email, { message: 'Enter your email address' });
    email(path.email, { message: 'Enter a valid email address' });
    required(path.password, { message: 'Enter your password' });
  });

  readonly login = mutation<Credentials, { token: string }>({
    mutationFn: ({ email, password }) => this.#auth.login(email, password),
    onSuccess: () => {
      const redirect = this.#route.snapshot.queryParamMap.get('redirect') ?? '/';
      void this.#router.navigateByUrl(redirect);
    },
  });

  readonly errorMessage = computed(() => apiErrorMessage(this.login.error()));

  /** Marks every field touched; runs the mutation only when the form is valid. */
  submit(): Promise<boolean> {
    return submit(this.form, async () => {
      this.login.mutate(this.model());
    });
  }
}
