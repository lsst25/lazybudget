import { Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Auth } from '@core/auth/auth';
import { apiErrorMessage } from '@core/data/api-error';
import { mutation } from '@core/data/mutation';

interface Credentials {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NzAlertModule, NzButtonModule, NzFormModule, NzInputModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  readonly #auth = inject(Auth);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #fb = inject(NonNullableFormBuilder);

  readonly form = this.#fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly login = mutation<Credentials, { token: string }>({
    mutationFn: ({ email, password }) => this.#auth.login(email, password),
    onSuccess: () => {
      const redirect = this.#route.snapshot.queryParamMap.get('redirect') ?? '/budget';
      void this.#router.navigateByUrl(redirect);
    },
  });

  readonly errorMessage = computed(() => apiErrorMessage(this.login.error()));

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.login.mutate(this.form.getRawValue());
  }
}
