import type { AdPlatform, EntryCategory, EntryKind } from "@/lib/types";

const EXPENSE_LABELS: Record<string, string> = {
  ads: "Quảng cáo",
  server: "Server",
  resources: "Tài nguyên",
  other: "Chi phí khác",
};

const REVENUE_LABELS: Record<string, string> = {
  sales: "Bán hàng",
  subscription: "Đăng ký",
  other: "Doanh thu khác",
};

const PLATFORM_LABELS: Record<AdPlatform, string> = {
  facebook: "Facebook",
  google: "Google",
  tiktok: "TikTok",
  other: "Nền tảng khác",
};

export const CATEGORY_COLOR: Record<string, string> = {
  ads: "#1D4ED8",
  server: "#64748B",
  resources: "#0F766E",
  other: "#B45309",
  sales: "#047857",
  subscription: "#6D28D9",
};

export function categoryLabel(kind: EntryKind, category: EntryCategory): string {
  const table = kind === "expense" ? EXPENSE_LABELS : REVENUE_LABELS;
  return table[category] ?? category;
}

export function platformLabel(platform: AdPlatform): string {
  return PLATFORM_LABELS[platform];
}

export function entryTitle(kind: EntryKind, category: EntryCategory, platform: AdPlatform | null): string {
  const label = categoryLabel(kind, category);
  if (!platform) return label;
  return `${label} · ${platformLabel(platform)}`;
}
