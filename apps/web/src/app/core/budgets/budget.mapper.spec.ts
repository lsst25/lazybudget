import { BudgetDto } from './budget.dto';
import { parseDateOnly, toBudget, toCreateBudgetDto } from './budget.mapper';
import { Budget } from './budget.model';

describe('budget mapper', () => {
  const dto: BudgetDto = {
    id: 1,
    name: 'Household',
    first_month: '2026-09-01',
    created_at: '2026-09-18T18:00:00.000000Z',
    role: 'owner',
  };

  it('parses a date-only string as local midnight', () => {
    const date = parseDateOnly('2026-09-01');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(0);
  });

  it('builds a Budget model from the API shape', () => {
    const budget = toBudget(dto);

    expect(budget).toBeInstanceOf(Budget);
    expect(budget.id).toBe(1);
    expect(budget.name).toBe('Household');
    expect(budget.firstMonth).toEqual(new Date(2026, 8, 1));
    expect(budget.createdAt).toEqual(new Date('2026-09-18T18:00:00.000000Z'));
    expect(budget.role).toBe('owner');
    expect(budget.isOwner).toBe(true);
  });

  it('maps missing role and created_at to null', () => {
    const budget = toBudget({ ...dto, created_at: null, role: undefined });

    expect(budget.createdAt).toBeNull();
    expect(budget.role).toBeNull();
    expect(budget.isOwner).toBe(false);
  });

  it('maps the create input to the request body', () => {
    expect(toCreateBudgetDto({ name: 'Holiday' })).toEqual({ name: 'Holiday' });
  });
});
