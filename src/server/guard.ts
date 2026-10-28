import { readSession } from "@/server/session";

const hits = new Map<string, number[]>();

export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export function rejectCrossOrigin(request: Request): Response | null {
  if (request.method === "GET") return null;
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return jsonError("Thiếu nguồn yêu cầu.", 403);
  try {
    if (new URL(origin).host !== host) return jsonError("Nguồn yêu cầu không hợp lệ.", 403);
  } catch {
    return jsonError("Nguồn yêu cầu không hợp lệ.", 403);
  }
  return null;
}

export function requireUser(request: Request): string | Response {
  const email = readSession(request);
  if (!email) return jsonError("Phiên đăng nhập đã hết. Đăng nhập lại giúp mình.", 401);
  return email;
}

export function tooMany(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0]?.trim() || "local";
}
