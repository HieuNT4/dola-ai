import { categoryLabel } from "@/lib/labels";
import type { EntryRecord, ExpenseCategory } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/types";

export type Summary = {
  revenue: number;
  expense: number;
  profit: number;
  expenses: { category: ExpenseCategory; amount: number; label: string }[];
};

export function sortEntries<T extends EntryRecord>(entries: T[]): T[] {
  return [...entries].sort((left, right) => {
    if (left.occurredOn === right.occurredOn) return right.createdAt - left.createdAt;
    return left.occurredOn < right.occurredOn ? 1 : -1;
  });
}

export function entriesInMonth(entries: EntryRecord[], month: string): EntryRecord[] {
  if (month === "all") return entries;
  return entries.filter((entry) => entry.occurredOn.startsWith(month));
}

export function summarize(entries: EntryRecord[]): Summary {
  let revenue = 0;
  let expense = 0;
  const totals = new Map<ExpenseCategory, number>();
  for (const entry of entries) {
    if (entry.kind === "revenue") {
      revenue += entry.amount;
      continue;
    }
    expense += entry.amount;
    const category = entry.category as ExpenseCategory;
    if (!EXPENSE_CATEGORIES.includes(category)) continue;
    totals.set(category, (totals.get(category) ?? 0) + entry.amount);
  }
  const expenses = EXPENSE_CATEGORIES.flatMap((category) => {
    const amount = totals.get(category) ?? 0;
    if (amount <= 0) return [];
    return [{ category, amount, label: categoryLabel("expense", category) }];
  });
  return { revenue, expense, profit: revenue - expense, expenses };
}
