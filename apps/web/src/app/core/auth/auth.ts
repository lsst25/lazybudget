import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';

export const AUTH_TOKEN_STORAGE_KEY = 'lazybudget.token';

@Service()
export class Auth {
  private httpClient = inject(HttpClient);
  #token = signal<string | null>(this.#getToken());
  readonly token = this.#token.asReadonly();

  readonly isAuthenticated = computed(() => {
    return this.token() !== null;
  });

  public login(email: string, password: string): Observable<{ token: string }> {
    return this.httpClient.post<{ token: string }>('/api/v1/auth/login', { email, password }).pipe(
      tap(({ token }) => {
        this.#setToken(token);
      }),
    );
  }

  public logout(): Observable<void> {
    return this.httpClient.post<void>('/api/v1/auth/logout', {}).pipe(
      finalize(() => {
        this.#setToken(null);
      }),
    );
  }

  public forget(): void {
    this.#setToken(null);
  }

  #getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || null;
  }

  #setToken(token: string | null): void {
    this.#token.set(token);
    if (token === null) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    }
  }
}
