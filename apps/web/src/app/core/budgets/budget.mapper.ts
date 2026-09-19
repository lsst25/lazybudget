import { BudgetDto, CreateBudgetDto } from './budget.dto';
import { Budget, CreateBudget } from './budget.model';

/** `YYYY-MM-DD` → local midnight. `new Date('2026-09-01')` would be UTC and shift a day in the west. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toBudget(dto: BudgetDto): Budget {
  return new Budget(
    dto.id,
    dto.name,
    parseDateOnly(dto.first_month),
    dto.created_at ? new Date(dto.created_at) : null,
    dto.role ?? null,
  );
}

export function toBudgets(dtos: BudgetDto[]): Budget[] {
  return dtos.map(toBudget);
}

export function toCreateBudgetDto(input: CreateBudget): CreateBudgetDto {
  return { name: input.name };
}
