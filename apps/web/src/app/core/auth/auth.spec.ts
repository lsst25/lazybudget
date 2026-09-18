import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Auth, AUTH_TOKEN_STORAGE_KEY } from './auth';

/**
 * Tests drive the implementation one at a time (TDD).
 * HttpTestingController replaces the real backend: each test asserts the
 * request that went out and decides how it is answered.
 */
describe('Auth', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  /** Created lazily so a test can seed localStorage first. */
  function create() {
    return {
      auth: TestBed.inject(Auth),
      http: TestBed.inject(HttpTestingController),
    };
  }

  it('starts logged out when nothing is stored', () => {
    const { auth } = create();

    expect(auth.token()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('restores a stored token on startup', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|stored-token');

    const { auth } = create();

    expect(auth.token()).toBe('1|stored-token');
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('treats an empty stored value as logged out', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '');

    const { auth } = create();

    expect(auth.token()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('login posts the credentials and stores the returned token', () => {
    const { auth, http } = create();
    const next = vi.fn();

    auth.login('yurii@example.com', 'secret-password').subscribe(next);

    const req = http.expectOne({ method: 'POST', url: '/api/v1/auth/login' });
    expect(req.request.body).toEqual({ email: 'yurii@example.com', password: 'secret-password' });
    req.flush({ token: '2|fresh-token' });

    expect(next).toHaveBeenCalledExactlyOnceWith({ token: '2|fresh-token' });
    expect(auth.token()).toBe('2|fresh-token');
    expect(auth.isAuthenticated()).toBe(true);
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('2|fresh-token');
  });

  it('logout posts to the API while still holding the token, then forgets it', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '3|old-token');
    const { auth, http } = create();

    auth.logout().subscribe();

    const req = http.expectOne({ method: 'POST', url: '/api/v1/auth/logout' });
    // The interceptor reads the token when the request is created; it must still be there.
    expect(auth.token()).toBe('3|old-token');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(auth.token()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('logout forgets the token even when the API call fails', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '3|old-token');
    const { auth, http } = create();

    auth.logout().subscribe({ error: () => undefined });
    http
      .expectOne({ method: 'POST', url: '/api/v1/auth/logout' })
      .flush({ message: 'Unauthenticated.' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.token()).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });
});
