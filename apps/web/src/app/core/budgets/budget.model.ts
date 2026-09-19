export type BudgetRole = 'owner' | 'member';

/** A budget the user is a member of. Immutable; build one with the mapper. */
export class Budget {
  constructor(
    readonly id: number,
    readonly name: string,
    /** First day of the first month, local midnight. */
    readonly firstMonth: Date,
    readonly createdAt: Date | null,
    /** The current user's role, or null when the budget was not loaded through their membership. */
    readonly role: BudgetRole | null,
  ) {}

  get isOwner(): boolean {
    return this.role === 'owner';
  }
}

export interface CreateBudget {
  name: string;
}
