// No account data or API key: a fixed, unauthenticated read checks reachability.
// The diagnostic contains no user-specific information on a public Site either.
export const dynamic = "force-dynamic";
export async function GET() {
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  try {
    const response = await globalThis.fetch("https://api.nextdns.io/profiles/000000", {
      redirect: "manual", signal: AbortSignal.timeout(15000), headers: { Accept: "application/json" },
    });
    const status = response.status;
    if (response.body) await response.body.cancel();
    return Response.json({ reachable: true, http_status: status, authentication_expected: [401, 403].includes(status) }, { headers });
  } catch (error) {
    const name = error instanceof Error ? error.name : "NetworkError";
    return Response.json({ reachable: false, error: name }, { status: 502, headers });
  }
}
