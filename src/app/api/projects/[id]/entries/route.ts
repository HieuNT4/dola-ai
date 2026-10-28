import { isDocId, parseDraft } from "@/lib/draft";
import type { EntryDraft } from "@/lib/types";
import { jsonError, rejectCrossOrigin, requireUser } from "@/server/guard";
import { createEntries } from "@/server/store";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  entries: z.array(z.unknown()).min(1).max(12),
});

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const user = requireUser(request);
  if (user instanceof Response) return user;
  const { id } = await context.params;
  if (!isDocId(id)) return jsonError("Không tìm thấy project.", 404);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Dữ liệu không đọc được.", 400);
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Danh sách khoản chưa đúng.", 400);
  const drafts: EntryDraft[] = [];
  for (const item of parsed.data.entries) {
    const draft = parseDraft(item);
    if (!draft) return jsonError("Có khoản chưa đủ số tiền, ngày hoặc danh mục.", 400);
    drafts.push(draft);
  }
  try {
    const created = await createEntries(id, drafts);
    if (!created) return jsonError("Không tìm thấy project.", 404);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("entry create failed", { message: error instanceof Error ? error.message : "unknown" });
    return jsonError("Không ghi được khoản.", 500);
  }
}
