import { isDocId, parseProjectInput } from "@/lib/draft";
import { jsonError, rejectCrossOrigin, requireUser } from "@/server/guard";
import { deleteProject, updateProject } from "@/server/store";

type RouteContext = { params: Promise<{ id: string }> };

async function projectId(context: RouteContext): Promise<string | Response> {
  const { id } = await context.params;
  if (!isDocId(id)) return jsonError("Không tìm thấy project.", 404);
  return id;
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const user = requireUser(request);
  if (user instanceof Response) return user;
  const id = await projectId(context);
  if (id instanceof Response) return id;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Dữ liệu không đọc được.", 400);
  }
  const parsed = parseProjectInput(body);
  if (!parsed) return jsonError("Tên project cần từ 1 đến 80 ký tự.", 400);
  try {
    const updated = await updateProject(id, parsed);
    if (!updated) return jsonError("Không tìm thấy project.", 404);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("project update failed", { message: error instanceof Error ? error.message : "unknown" });
    return jsonError("Không lưu được project.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const user = requireUser(request);
  if (user instanceof Response) return user;
  const id = await projectId(context);
  if (id instanceof Response) return id;
  try {
    const removed = await deleteProject(id);
    if (!removed) return jsonError("Không tìm thấy project.", 404);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("project delete failed", { message: error instanceof Error ? error.message : "unknown" });
    return jsonError("Không xoá được project.", 500);
  }
}
