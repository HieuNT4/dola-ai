import { isDocId, parseDraft } from "@/lib/draft";
import { jsonError, rejectCrossOrigin, requireUser } from "@/server/guard";
import { deleteEntry, updateEntry } from "@/server/store";

type RouteContext = { params: Promise<{ id: string; entryId: string }> };

async function ids(context: RouteContext): Promise<{ id: string; entryId: string } | Response> {
  const params = await context.params;
  if (!isDocId(params.id) || !isDocId(params.entryId)) return jsonError("Không tìm thấy khoản.", 404);
  return params;
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const user = requireUser(request);
  if (user instanceof Response) return user;
  const found = await ids(context);
  if (found instanceof Response) return found;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Dữ liệu không đọc được.", 400);
  }
  const draft = parseDraft(body);
  if (!draft) return jsonError("Khoản chưa đủ số tiền, ngày hoặc danh mục.", 400);
  try {
    const updated = await updateEntry(found.id, found.entryId, draft);
    if (!updated) return jsonError("Không tìm thấy khoản.", 404);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("entry update failed", { message: error instanceof Error ? error.message : "unknown" });
    return jsonError("Không lưu được khoản.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const user = requireUser(request);
  if (user instanceof Response) return user;
  const found = await ids(context);
  if (found instanceof Response) return found;
  try {
    const removed = await deleteEntry(found.id, found.entryId);
    if (!removed) return jsonError("Không tìm thấy khoản.", 404);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("entry delete failed", { message: error instanceof Error ? error.message : "unknown" });
    return jsonError("Không xoá được khoản.", 500);
  }
}
