import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AUTH_TOKEN_STORAGE_KEY } from './auth';
import { authGuard } from './auth-guard';

/**
 * Tests drive the implementation one at a time (TDD).
 * The guard is a plain function run in an injection context; the Auth
 * service behind it is driven through localStorage, as in auth.spec.ts.
 */
describe('authGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/budget' } as RouterStateSnapshot;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  function run() {
    return TestBed.runInInjectionContext(() => authGuard(route, state));
  }

  it('allows navigation when a token is present', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|stored-token');

    expect(run()).toBe(true);
  });

  it('redirects to /login, remembering the attempted URL, when there is no token', () => {
    const result = run();

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login?redirect=%2Fbudget');
  });
});
