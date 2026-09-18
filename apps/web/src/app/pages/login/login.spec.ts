import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Auth } from '@core/auth/auth';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let response$: Subject<{ token: string }>;
  let login: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  async function setup(queryParams: Record<string, string> = {}) {
    response$ = new Subject<{ token: string }>();
    login = vi.fn(() => response$.asObservable());

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: { login } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
      ],
    }).compileComponents();

    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  function fillAndSubmit(email: string, password: string) {
    component.form.setValue({ email, password });
    component.submit();
  }

  it('renders email and password fields and a submit button', async () => {
    await setup();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('input#email')).not.toBeNull();
    expect(el.querySelector('input#password')).not.toBeNull();
    expect(el.querySelector('button[type=submit]')?.textContent).toContain('Log in');
  });

  it('does not call the API when the form is invalid', async () => {
    await setup();

    fillAndSubmit('not-an-email', '');

    expect(login).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('logs in and navigates to the redirect target on success', async () => {
    await setup({ redirect: '/budget/2026-09' });

    fillAndSubmit('yurii@example.com', 'secret-password');
    expect(login).toHaveBeenCalledExactlyOnceWith('yurii@example.com', 'secret-password');
    expect(component.login.isPending()).toBe(true);

    response$.next({ token: '1|t' });
    response$.complete();

    expect(navigateByUrl).toHaveBeenCalledExactlyOnceWith('/budget/2026-09');
  });

  it('falls back to /budget when no redirect is given', async () => {
    await setup();

    fillAndSubmit('yurii@example.com', 'secret-password');
    response$.next({ token: '1|t' });
    response$.complete();

    expect(navigateByUrl).toHaveBeenCalledExactlyOnceWith('/budget');
  });

  it("shows the API's validation message on 422", async () => {
    await setup();

    fillAndSubmit('yurii@example.com', 'wrong-password');
    response$.error(
      new HttpErrorResponse({
        status: 422,
        error: { message: 'x', errors: { email: ['These credentials do not match our records.'] } },
      }),
    );
    await fixture.whenStable();

    expect(component.errorMessage()).toBe('These credentials do not match our records.');
    expect(fixture.nativeElement.textContent).toContain(
      'These credentials do not match our records.',
    );
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
