export const EXPENSE_CATEGORIES = ["ads", "server", "resources", "other"] as const;
export const REVENUE_CATEGORIES = ["sales", "subscription", "other"] as const;
export const AD_PLATFORMS = ["facebook", "google", "tiktok", "other"] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type RevenueCategory = (typeof REVENUE_CATEGORIES)[number];
export type AdPlatform = (typeof AD_PLATFORMS)[number];
export type EntryKind = "expense" | "revenue";
export type EntryCategory = ExpenseCategory | RevenueCategory;

export type ProjectRecord = {
  id: string;
  name: string;
  description: string;
  createdAt: number;
};

export type EntryDraft = {
  kind: EntryKind;
  category: EntryCategory;
  platform: AdPlatform | null;
  amount: number;
  occurredOn: string;
  note: string;
  invoiceCode: string;
  vendor: string;
};

export type EntryRecord = EntryDraft & {
  id: string;
  createdAt: number;
};

export type EntryView = EntryRecord & {
  projectId: string;
  projectName: string;
};
