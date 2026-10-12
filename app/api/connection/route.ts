import { env } from "cloudflare:workers";
import { actor, checkOrigin, connectionStatus, saveConnection, disconnect, errorPayload, AppError } from "@/lib/nextdns-core.mjs";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
async function handle(request: Request) {
  try {
    const user = actor(request);
    checkOrigin(request, request.method !== "GET");
    if (request.method === "GET") return Response.json(await connectionStatus(env, user), { headers });
    if (request.method === "DELETE") return Response.json(await disconnect(env, user), { headers });
    if (!request.headers.get("content-type")?.includes("application/json")) throw new AppError("JSON is required.", 415);
    const raw = await request.text();
    if (raw.length > 2048) throw new AppError("The request is too large.", 413);
    let values;
    try { values = JSON.parse(raw); } catch { throw new AppError("Invalid JSON."); }
    return Response.json(await saveConnection(env, user, values), { headers });
  } catch (error) {
    return Response.json(errorPayload(error), { status: error instanceof AppError ? error.status : 500, headers });
  }
}
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
