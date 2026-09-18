import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Auth, AUTH_TOKEN_STORAGE_KEY } from './auth';
import { authInterceptor } from './auth-interceptor';

/**
 * Tests drive the implementation one at a time (TDD).
 * The interceptor is registered on a real HttpClient and exercised by
 * sending requests through it; HttpTestingController shows what went out.
 */
describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  /** Created lazily so a test can seed localStorage first. */
  function create() {
    return {
      http: TestBed.inject(HttpClient),
      backend: TestBed.inject(HttpTestingController),
      router: TestBed.inject(Router),
    };
  }

  it('adds a Bearer token to /api requests when logged in', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|stored-token');
    const { http, backend } = create();

    http.get('/api/v1/budgets').subscribe();

    const req = backend.expectOne('/api/v1/budgets');
    expect(req.request.headers.get('Authorization')).toBe('Bearer 1|stored-token');
    req.flush([]);
  });

  it('sends /api requests untouched when logged out', () => {
    const { http, backend } = create();

    http.post('/api/v1/auth/login', {}).subscribe();

    const req = backend.expectOne('/api/v1/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ token: 'x' });
  });

  it('never attaches the token to requests outside /api', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|stored-token');
    const { http, backend } = create();

    http.get('/assets/outline/wallet.svg', { responseType: 'text' }).subscribe();
    http.get('https://example.com/data.json').subscribe();

    for (const req of backend.match(() => true)) {
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush('');
    }
  });

  it('on a 401 from /api: forgets the token, redirects to /login and still surfaces the error', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|revoked-token');
    const { http, backend, router } = create();
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const error = vi.fn();

    http.get('/api/v1/budgets').subscribe({ error });
    backend
      .expectOne('/api/v1/budgets')
      .flush({ message: 'Unauthenticated.' }, { status: 401, statusText: 'Unauthorized' });

    expect(TestBed.inject(Auth).token()).toBeNull();
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/login');
    expect(error).toHaveBeenCalledOnce();
    expect(error.mock.calls[0][0].status).toBe(401);
  });

  it('leaves other error statuses alone', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|stored-token');
    const { http, backend, router } = create();
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    http.get('/api/v1/budgets').subscribe({ error: () => undefined });
    backend
      .expectOne('/api/v1/budgets')
      .flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });

    expect(TestBed.inject(Auth).token()).toBe('1|stored-token');
    expect(navigate).not.toHaveBeenCalled();
  });
});
