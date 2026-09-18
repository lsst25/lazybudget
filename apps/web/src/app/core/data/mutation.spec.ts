import { HttpErrorResponse } from '@angular/common/http';
import {
  createEnvironmentInjector,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { mutation } from './mutation';

/**
 * Tests drive the implementation one at a time (TDD).
 * `mutationFn` is fed a Subject so each test decides exactly when and how
 * the "request" completes — no HttpClient involved.
 */
describe('mutation', () => {
  function setup<TInput = string, TResult = string>() {
    const response$ = new Subject<TResult>();
    const mutationFn = vi.fn((_input: TInput) => response$.asObservable());

    const m = TestBed.runInInjectionContext(() => mutation<TInput, TResult>({ mutationFn }));

    return { m, response$, mutationFn };
  }

  it('starts idle: not pending, no error, no result', () => {
    const { m } = setup();

    expect(m.isPending()).toBe(false);
    expect(m.error()).toBeNull();
    expect(m.result()).toBeNull();
  });

  it('calls mutationFn with the input and is pending until the response arrives', () => {
    const { m, mutationFn } = setup();

    m.mutate('payload');

    expect(mutationFn).toHaveBeenCalledExactlyOnceWith('payload');
    expect(m.isPending()).toBe(true);
  });

  it('on success: stores the result, stops pending and calls onSuccess(result, input)', () => {
    const response$ = new Subject<string>();
    const onSuccess = vi.fn();
    const m = TestBed.runInInjectionContext(() =>
      mutation<string, string>({ mutationFn: () => response$, onSuccess }),
    );

    m.mutate('payload');
    response$.next('created');
    response$.complete();

    expect(m.isPending()).toBe(false);
    expect(m.result()).toBe('created');
    expect(m.error()).toBeNull();
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith('created', 'payload');
  });

  it('on error: stores the error, stops pending, leaves result untouched and calls onError(error, input)', () => {
    const response$ = new Subject<string>();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const m = TestBed.runInInjectionContext(() =>
      mutation<string, string>({ mutationFn: () => response$, onSuccess, onError }),
    );
    const failure = new HttpErrorResponse({ status: 422, error: { errors: { email: ['taken'] } } });

    m.mutate('payload');
    response$.error(failure);

    expect(m.isPending()).toBe(false);
    expect(m.error()).toBe(failure);
    expect(m.result()).toBeNull();
    expect(onError).toHaveBeenCalledExactlyOnceWith(failure, 'payload');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('ignores mutate() while a previous call is still pending', () => {
    const { m, mutationFn, response$ } = setup();

    m.mutate('first');
    m.mutate('second');

    expect(mutationFn).toHaveBeenCalledExactlyOnceWith('first');

    response$.next('done');
    response$.complete();
    m.mutate('third');

    expect(mutationFn).toHaveBeenCalledTimes(2);
    expect(mutationFn).toHaveBeenLastCalledWith('third');
  });

  it('reset() clears error and result', () => {
    const { m, response$ } = setup();

    m.mutate('payload');
    response$.next('created');
    response$.complete();
    expect(m.result()).toBe('created');

    m.reset();

    expect(m.result()).toBeNull();
    expect(m.error()).toBeNull();
    expect(m.isPending()).toBe(false);
  });

  it('a new mutate() clears the previous error and result before running', () => {
    // A Subject that has errored replays the error to new subscribers,
    // so hand out a fresh one per call, like HttpClient does.
    let response$ = new Subject<string>();
    const m = TestBed.runInInjectionContext(() =>
      mutation<string, string>({ mutationFn: () => (response$ = new Subject<string>()) }),
    );

    m.mutate('first');
    response$.error(new HttpErrorResponse({ status: 500 }));
    expect(m.error()).not.toBeNull();

    m.mutate('second');

    expect(m.error()).toBeNull();
    expect(m.result()).toBeNull();
    expect(m.isPending()).toBe(true);
  });

  it('stops listening when the owning injection context is destroyed', () => {
    const response$ = new Subject<string>();
    const onSuccess = vi.fn();
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const m = runInInjectionContext(injector, () =>
      mutation<string, string>({ mutationFn: () => response$, onSuccess }),
    );

    m.mutate('payload');
    injector.destroy();
    response$.next('too late');
    response$.complete();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(m.result()).toBeNull();
    expect(response$.observed).toBe(false);
  });
});
