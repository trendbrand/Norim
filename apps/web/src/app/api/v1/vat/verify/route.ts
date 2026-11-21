import { NextRequest, NextResponse } from "next/server";
import { verifyEuVatId } from "@norminvoice/einvoice-core";
import { persistViesLookupToPostgres } from "@/lib/pg-persistence";
import { requireTenantAuth } from "@/lib/security";

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as { vatId?: string; liveLookup?: boolean };
    if (!body.vatId?.trim()) {
      return NextResponse.json({ error: "Missing vatId parameter" }, { status: 400 });
    }
    const result = await verifyEuVatId(body.vatId, {
      liveLookup: body.liveLookup !== false,
      timeoutMs: Number(process.env.VIES_TIMEOUT_MS || 5000),
    });
    await persistViesLookupToPostgres(result);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "VIES lookup failed" },
      { status: 500 }
    );
  }
}
