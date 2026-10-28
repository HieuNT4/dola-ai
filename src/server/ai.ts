import { coerceDraft, parseDraft } from "@/lib/draft";
import type { EntryDraft } from "@/lib/types";
import { z } from "zod";

const parseRequestSchema = z.object({
  action: z.literal("parse"),
  text: z.string().trim().min(1).max(2000),
  projectName: z.string().trim().min(1).max(80),
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const recentSchema = z.object({
  kind: z.enum(["expense", "revenue"]),
  label: z.string().max(80),
  amount: z.number(),
  occurredOn: z.string().max(10),
  note: z.string().max(200),
  vendor: z.string().max(120),
  invoiceCode: z.string().max(80),
});

const evaluateRequestSchema = z.object({
  action: z.literal("evaluate"),
  projectName: z.string().trim().min(1).max(80),
  revenue: z.number(),
  expense: z.number(),
  profit: z.number(),
  expenses: z.array(z.object({ label: z.string().max(80), amount: z.number() })).max(8),
  recent: z.array(recentSchema).max(30),
});

const aiRequestSchema = z.discriminatedUnion("action", [parseRequestSchema, evaluateRequestSchema]);

const modelParseSchema = z.object({
  message: z.string().max(500),
  entries: z.array(z.unknown()).max(12),
});

const modelEvaluationSchema = z.object({
  headline: z.string().min(1).max(240),
  points: z.array(z.string().min(1).max(400)).min(1).max(6),
});

export type AiRequest = z.infer<typeof aiRequestSchema>;

export function parseAiRequest(input: unknown): AiRequest | null {
  const parsed = aiRequestSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

type MistralResponse = {
  choices?: { message?: { content?: string } }[];
};

function extractJson(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse(fenced?.[1] ?? trimmed) as unknown;
}

async function complete(system: string, user: string): Promise<unknown> {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) {
    throw new Error("missing-key");
  }
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (response.status === 429) {
    throw new Error("mistral-rate");
  }
  if (!response.ok) {
    console.error("mistral request failed", { status: response.status });
    throw new Error("mistral-failed");
  }
  const payload = (await response.json()) as MistralResponse;
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("mistral-empty");
  return extractJson(content);
}

const PARSE_SYSTEM = [
  "Bạn là trợ lý sổ sách cho một startup web.",
  "Chuyển câu tiếng Việt thành JSON duy nhất, không markdown.",
  'Định dạng: {"message": string, "entries": Entry[]}.',
  "Entry gồm kind (expense|revenue), category, platform, amount (số nguyên VND), occurredOn (YYYY-MM-DD), note, invoiceCode, vendor.",
  "Chi phí category: ads, server, resources, other.",
  "Doanh thu category: sales, subscription, other.",
  "platform chỉ dùng khi category là ads: facebook, google, tiktok, other. Các category khác để platform null.",
  "ads mặc định facebook nếu người dùng không nói nền tảng.",
  "Nếu câu không chứa khoản tiền, entries là mảng rỗng và message giải thích ngắn.",
].join(" ");

const EVALUATE_SYSTEM = [
  "Bạn là cố vấn tài chính cho startup.",
  "Chỉ dùng số liệu được đưa. Không bịa khoản mới.",
  'Trả JSON: {"headline": string, "points": string[]}.',
  "points có 3 đến 5 ý tiếng Việt, mỗi ý một câu cụ thể kèm số tiền khi có.",
  "Nhận xét cơ cấu quảng cáo, server, tài nguyên, biên lợi nhuận, và một việc nên làm tiếp.",
].join(" ");

export async function parseEntries(input: {
  text: string;
  projectName: string;
  today: string;
}): Promise<{ message: string; entries: EntryDraft[] }> {
  const raw = await complete(
    PARSE_SYSTEM,
    `Hôm nay là ${input.today}. Project: ${input.projectName}. Câu người dùng: ${input.text}`,
  );
  const parsed = modelParseSchema.safeParse(raw);
  if (!parsed.success) throw new Error("mistral-shape");
  const entries = parsed.data.entries.flatMap((item) => {
    const draft = parseDraft(coerceDraft(item));
    return draft ? [draft] : [];
  });
  const message = entries.length > 0 ? parsed.data.message : parsed.data.message || "Mình chưa thấy khoản tiền nào trong câu này.";
  return { message, entries };
}

export async function evaluateLedger(input: z.infer<typeof evaluateRequestSchema>): Promise<{
  headline: string;
  points: string[];
}> {
  const raw = await complete(EVALUATE_SYSTEM, JSON.stringify(input));
  const parsed = modelEvaluationSchema.safeParse(raw);
  if (!parsed.success) throw new Error("mistral-shape");
  return parsed.data;
}
