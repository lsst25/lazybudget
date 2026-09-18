import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Auth } from '@core/auth/auth';
import { Register } from './register';

describe('Register', () => {
  let fixture: ComponentFixture<Register>;
  let component: Register;
  let response$: Subject<{ token: string }>;
  let register: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  async function setup() {
    response$ = new Subject<{ token: string }>();
    register = vi.fn(() => response$.asObservable());

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: Auth, useValue: { register } }],
    }).compileComponents();

    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  function fillAndSubmit(
    name: string,
    email: string,
    password: string,
    password_confirmation = password,
  ) {
    component.form.setValue({ name, email, password, password_confirmation });
    component.submit();
  }

  it('renders the name, email, password and confirmation fields and a submit button', async () => {
    await setup();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('input#name')).not.toBeNull();
    expect(el.querySelector('input#email')).not.toBeNull();
    expect(el.querySelector('input#password')).not.toBeNull();
    expect(el.querySelector('input#password_confirmation')).not.toBeNull();
    expect(el.querySelector('button[type=submit]')?.textContent).toContain('Create account');
  });

  it('does not call the API when the form is invalid', async () => {
    await setup();

    fillAndSubmit('', 'not-an-email', 'short');

    expect(register).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('does not call the API when the passwords do not match', async () => {
    await setup();

    fillAndSubmit('Yurii', 'yurii@example.com', 'secret-password', 'other-password');

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.password_confirmation.hasError('mismatch')).toBe(true);
    expect(register).not.toHaveBeenCalled();
  });

  it('registers and navigates to /budget on success', async () => {
    await setup();

    fillAndSubmit('Yurii', 'yurii@example.com', 'secret-password');
    expect(register).toHaveBeenCalledExactlyOnceWith({
      name: 'Yurii',
      email: 'yurii@example.com',
      password: 'secret-password',
      password_confirmation: 'secret-password',
    });
    expect(component.register.isPending()).toBe(true);

    response$.next({ token: '1|t' });
    response$.complete();

    expect(navigateByUrl).toHaveBeenCalledExactlyOnceWith('/budget');
  });

  it("shows the API's validation message on 422", async () => {
    await setup();

    fillAndSubmit('Yurii', 'taken@example.com', 'secret-password');
    response$.error(
      new HttpErrorResponse({
        status: 422,
        error: { message: 'x', errors: { email: ['The email has already been taken.'] } },
      }),
    );
    await fixture.whenStable();

    expect(component.errorMessage()).toBe('The email has already been taken.');
    expect(fixture.nativeElement.textContent).toContain('The email has already been taken.');
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
