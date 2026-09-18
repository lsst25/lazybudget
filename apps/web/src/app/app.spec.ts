import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
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
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.sidebar-logo h1')?.textContent).toContain('lazybudget');
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
