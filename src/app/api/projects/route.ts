import { parseProjectInput } from "@/lib/draft";
import { jsonError, rejectCrossOrigin, requireUser } from "@/server/guard";
import { createProject } from "@/server/store";

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const user = requireUser(request);
  if (user instanceof Response) return user;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Dữ liệu không đọc được.", 400);
  }
  const parsed = parseProjectInput(body);
  if (!parsed) return jsonError("Tên project cần từ 1 đến 80 ký tự.", 400);
  try {
    await createProject(parsed);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("project create failed", { message: error instanceof Error ? error.message : "unknown" });
    return jsonError("Không tạo được project.", 500);
  }
}
