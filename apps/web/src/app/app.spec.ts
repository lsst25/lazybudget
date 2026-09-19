import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { AUTH_TOKEN_STORAGE_KEY } from '@core/auth/auth';
import { App } from './app';
import { icons } from './icons-provider';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideNzIcons(icons),
        provideHttpClient(),
        provideHttpClientTesting(),
        importProvidersFrom(NzModalModule),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the shell with the app name when logged in', async () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, '1|stored-token');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    // Logged in, so the shell asks for the budgets straight away.
    TestBed.inject(HttpTestingController).expectOne('/api/v1/budgets').flush({ data: [] });
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    // The sider may auto-collapse in a narrow test window, hiding the name; the logo is always there.
    expect(el.querySelector('.sidebar-logo .switcher__logo')).not.toBeNull();
    expect(el.querySelector('.header-logout')).not.toBeNull();
  });

  it('renders only the router outlet when logged out', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.sidebar-logo')).toBeNull();
    expect(el.querySelector('router-outlet')).not.toBeNull();
  });
});
