import { clientKey, jsonError, rejectCrossOrigin, tooMany } from "@/server/guard";
import { clearSessionCookie, emailAllowed, issueSession, passwordsMatch, readSession, sessionCookie } from "@/server/session";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(1).max(200),
});

export async function GET(request: Request): Promise<Response> {
  const email = readSession(request);
  return Response.json({ email });
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  if (tooMany(`login:${clientKey(request)}`, 8, 10 * 60 * 1000)) {
    return jsonError("Bạn thử đăng nhập quá nhiều lần. Đợi vài phút rồi thử lại.", 429);
  }
  const expected = process.env.APP_PASSWORD;
  if (!expected) return jsonError("Máy chủ chưa cấu hình mật khẩu.", 503);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Dữ liệu không đọc được.", 400);
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError("Email hoặc mật khẩu chưa đúng.", 401);
  if (!emailAllowed(parsed.data.email) || !passwordsMatch(parsed.data.password, expected)) {
    return jsonError("Email hoặc mật khẩu chưa đúng.", 401);
  }
  const response = Response.json({ email: parsed.data.email.trim().toLowerCase() });
  response.headers.set("Set-Cookie", sessionCookie(issueSession(parsed.data.email)));
  return response;
}

export async function DELETE(request: Request): Promise<Response> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const response = Response.json({ email: null });
  response.headers.set("Set-Cookie", clearSessionCookie());
  return response;
}
