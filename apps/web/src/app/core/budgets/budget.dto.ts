/**
 * Wire shapes, exactly as the Laravel API sends and receives them (snake_case,
 * dates as strings). Nothing outside the mapper and repository should touch these.
 */
export interface BudgetDto {
  id: number;
  name: string;
  /** First day of the first month, `YYYY-MM-DD`. */
  first_month: string;
  created_at: string | null;
  /** Present only when the budget was fetched through the caller's membership. */
  role?: 'owner' | 'member';
}

export interface CreateBudgetDto {
  name: string;
  /** `YYYY-MM-DD`; the API defaults to the current month when omitted. */
  first_month?: string;
}

/** Laravel wraps every resource in `{ data: … }`. */
export interface Envelope<T> {
  data: T;
}
