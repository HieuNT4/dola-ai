import { evaluateLedger, parseAiRequest, parseEntries } from "@/server/ai";
import { clientKey, jsonError, rejectCrossOrigin, requireUser, tooMany } from "@/server/guard";

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const user = requireUser(request);
  if (user instanceof Response) return user;
  if (tooMany(`ai:${clientKey(request)}`, 30, 10 * 60 * 1000)) {
    return jsonError("Mistral đang được gọi quá dày. Đợi một lát rồi thử lại.", 429);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Dữ liệu không đọc được.", 400);
  }
  const parsed = parseAiRequest(body);
  if (!parsed) return jsonError("Yêu cầu gửi cho Mistral chưa đúng.", 400);
  try {
    if (parsed.action === "parse") {
      const result = await parseEntries(parsed);
      return Response.json(result);
    }
    const result = await evaluateLedger(parsed);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "missing-key") return jsonError("Chưa có MISTRAL_API_KEY trên máy chủ.", 503);
    if (message === "mistral-rate") return jsonError("Mistral đang giới hạn lượt gọi. Đợi một lát rồi thử lại.", 429);
    console.error("ai request failed", { message });
    return jsonError("Mistral chưa trả lời được. Thử một câu cụ thể hơn.", 502);
  }
}
