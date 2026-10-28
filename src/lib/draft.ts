import { isIsoDate } from "@/lib/dates";
import {
  AD_PLATFORMS,
  EXPENSE_CATEGORIES,
  REVENUE_CATEGORIES,
  type AdPlatform,
  type EntryCategory,
  type EntryDraft,
  type EntryKind,
} from "@/lib/types";
import { z } from "zod";

const platformSchema = z.enum(AD_PLATFORMS);

const draftSchema = z.object({
  kind: z.enum(["expense", "revenue"]),
  category: z.string(),
  platform: platformSchema.nullable(),
  amount: z.number(),
  occurredOn: z.string(),
  note: z.string(),
  invoiceCode: z.string(),
  vendor: z.string(),
});

function isExpenseCategory(value: string): boolean {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value);
}

function isRevenueCategory(value: string): boolean {
  return (REVENUE_CATEGORIES as readonly string[]).includes(value);
}

export function blankDraft(today: string): EntryDraft {
  return {
    kind: "expense",
    category: "ads",
    platform: "facebook",
    amount: 0,
    occurredOn: today,
    note: "",
    invoiceCode: "",
    vendor: "",
  };
}

export function coerceDraft(input: unknown): unknown {
  if (typeof input !== "object" || input === null) return input;
  const record = input as Record<string, unknown>;
  const amount = typeof record.amount === "number" ? Math.round(record.amount) : record.amount;
  return {
    kind: record.kind,
    category: record.category,
    platform: record.platform ?? null,
    amount,
    occurredOn: record.occurredOn,
    note: typeof record.note === "string" ? record.note : "",
    invoiceCode: typeof record.invoiceCode === "string" ? record.invoiceCode : "",
    vendor: typeof record.vendor === "string" ? record.vendor : "",
  };
}

export function parseDraft(input: unknown): EntryDraft | null {
  const parsed = draftSchema.safeParse(coerceDraft(input));
  if (!parsed.success) return null;
  const value = parsed.data;
  if (!Number.isInteger(value.amount) || value.amount <= 0 || value.amount > 1_000_000_000_000) return null;
  if (!isIsoDate(value.occurredOn)) return null;
  if (value.note.length > 400 || value.invoiceCode.length > 80 || value.vendor.length > 120) return null;
  const kind: EntryKind = value.kind;
  if (kind === "expense" && !isExpenseCategory(value.category)) return null;
  if (kind === "revenue" && !isRevenueCategory(value.category)) return null;
  const category = value.category as EntryCategory;
  const platform: AdPlatform | null = category === "ads" ? value.platform : null;
  if (category === "ads" && !platform) return null;
  return {
    kind,
    category,
    platform,
    amount: value.amount,
    occurredOn: value.occurredOn,
    note: value.note.trim(),
    invoiceCode: value.invoiceCode.trim(),
    vendor: value.vendor.trim(),
  };
}

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export function parseProjectInput(input: unknown): { name: string; description: string } | null {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return null;
  const name = parsed.data.name.trim();
  const description = parsed.data.description.trim();
  if (name.length === 0 || name.length > 80 || description.length > 400) return null;
  return { name, description };
}

export function isDocId(value: string): boolean {
  return /^[A-Za-z0-9]{8,40}$/.test(value);
}
