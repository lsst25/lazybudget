import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';

@Service()
export class Auth {
  private token = signal<string | null>(localStorage.getItem('token') ?? null);
  private httpClient = inject(HttpClient);

  public login(email: string, password: string): Observable<{ token: string }> {
    return this.httpClient.post<{ token: string }>('/api/v1/auth/login', { email, password }).pipe(
      tap(({ token }) => {
        this.token.set(token);
        localStorage.setItem('token', token);
      }),
    );
  }

  public logout(): Observable<void> {
    return this.httpClient.post<void>('/api/v1/auth/logout', {}).pipe(
      finalize(() => {
        this.token.set(null);
        localStorage.setItem('token', '');
      }),
    );
  }
}
