import { jsonError, requireUser } from "@/server/guard";
import { listLedger } from "@/server/store";

export async function GET(request: Request): Promise<Response> {
  const user = requireUser(request);
  if (user instanceof Response) return user;
  try {
    const ledger = await listLedger();
    return Response.json(ledger);
  } catch (error) {
    console.error("ledger list failed", { message: error instanceof Error ? error.message : "unknown" });
    return jsonError("Không tải được sổ.", 500);
  }
}
