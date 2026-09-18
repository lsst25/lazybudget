import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable, Subscription } from 'rxjs';

export interface Mutation<TInput, TResult> {
  mutate: (input: TInput) => void;
  isPending: Signal<boolean>;
  error: Signal<HttpErrorResponse | null>;
  result: Signal<TResult | null>;
  reset: () => void;
}

export interface MutationOptions<TInput, TResult> {
  mutationFn: (input: TInput) => Observable<TResult>;
  onSuccess?: (result: TResult, input: TInput) => void;
  onError?: (error: HttpErrorResponse, input: TInput) => void;
}

export function mutation<TInput, TResult>(
  options: MutationOptions<TInput, TResult>,
): Mutation<TInput, TResult> {
  const destroyRef = inject(DestroyRef);
  const isPending = signal(false);
  const error = signal<HttpErrorResponse | null>(null);
  const result = signal<TResult | null>(null);

  const mutate = (input: TInput) => {
    if (isPending()) {
      return;
    }

    error.set(null);
    result.set(null);
    isPending.set(true);

    options
      .mutationFn(input)
      .pipe(
        takeUntilDestroyed(destroyRef),
        finalize(() => {
          isPending.set(false);
        }),
      )
      .subscribe({
        next: (value) => {
          result.set(value);
          options.onSuccess?.(value, input);
        },
        error: (e: HttpErrorResponse) => {
          error.set(e);
          options.onError?.(e, input);
        },
      });
  };
  const reset = () => {
    error.set(null);
    result.set(null);
  };

  return {
    mutate,
    isPending: isPending.asReadonly(),
    error: error.asReadonly(),
    result: result.asReadonly(),
    reset,
  };
}
