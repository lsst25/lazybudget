import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { Auth } from '@core/auth/auth';
import { Budgets } from '@core/budgets/budgets';
import { BudgetSwitcher } from '@core/shell/budget-switcher/budget-switcher';
import { mutation } from '@core/data/mutation';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterOutlet,
    NzButtonModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    BudgetSwitcher,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly auth = inject(Auth);
  readonly budgets = inject(Budgets);
  readonly #router = inject(Router);

  isCollapsed = false;

  /** Whatever the API says, the client ends up logged out; go to the login page either way. */
  readonly logout = mutation<void, void>({
    mutationFn: () => this.auth.logout(),
    onSuccess: () => this.#goToLogin(),
    onError: () => this.#goToLogin(),
  });

  #goToLogin(): void {
    void this.#router.navigateByUrl('/login');
  }
}
