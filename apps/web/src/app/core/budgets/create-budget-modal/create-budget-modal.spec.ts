import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { BudgetDto } from '../budget.dto';
import { toBudget } from '../budget.mapper';
import { CreateBudgetModal } from './create-budget-modal';

describe('CreateBudgetModal', () => {
  const modalRef = { close: vi.fn() };
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();
    modalRef.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [CreateBudgetModal],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NzModalRef, useValue: modalRef },
      ],
    }).compileComponents();
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  async function setup() {
    const fixture = TestBed.createComponent(CreateBudgetModal);
    await fixture.whenStable();
    return { fixture, http: TestBed.inject(HttpTestingController) };
  }

  function typeName(fixture: { nativeElement: HTMLElement }, value: string) {
    const input = fixture.nativeElement.querySelector<HTMLInputElement>('#budget-name')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(fixture: { nativeElement: HTMLElement }) {
    fixture.nativeElement.querySelector('form')!.dispatchEvent(new Event('submit'));
  }

  it('does not post when the name is empty', async () => {
    const { fixture, http } = await setup();

    submit(fixture);
    await fixture.whenStable();

    http.expectNone({ method: 'POST', url: '/api/v1/budgets' });
    expect(fixture.componentInstance.form.name().touched()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Give the budget a name');
  });

  it('creates the budget, closes the dialog and opens the new budget', async () => {
    const { fixture, http } = await setup();

    typeName(fixture, 'Holiday');
    submit(fixture);
    await fixture.whenStable();

    const post = http.expectOne({ method: 'POST', url: '/api/v1/budgets' });
    expect(post.request.body).toEqual({ name: 'Holiday' });
    const budget: BudgetDto = {
      id: 9,
      name: 'Holiday',
      first_month: '2026-09-01',
      created_at: null,
      role: 'owner',
    };
    post.flush({ data: budget }, { status: 201, statusText: 'Created' });
    await fixture.whenStable();

    expect(modalRef.close).toHaveBeenCalledExactlyOnceWith(toBudget(budget));
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/budgets', 9]);
    // The service reloads the list after a create; the shell is logged out here, so nothing fires.
    http.expectNone({ method: 'GET', url: '/api/v1/budgets' });
  });

  it('shows the validation message from the API and stays open', async () => {
    const { fixture, http } = await setup();

    typeName(fixture, 'x'.repeat(10));
    submit(fixture);
    await fixture.whenStable();

    http.expectOne({ method: 'POST', url: '/api/v1/budgets' }).flush(
      {
        message: 'The name field is required.',
        errors: { name: ['The name field is required.'] },
      },
      { status: 422, statusText: 'Unprocessable Content' },
    );
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('The name field is required.');
    expect(modalRef.close).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('cancel closes without a result', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.cancel();

    expect(modalRef.close).toHaveBeenCalledExactlyOnceWith();
  });
});
