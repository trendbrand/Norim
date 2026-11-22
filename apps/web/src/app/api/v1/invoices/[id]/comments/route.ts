import { NextRequest, NextResponse } from "next/server";
import { addInvoiceComment, listInvoiceComments } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;
  const { id } = await context.params;
  return NextResponse.json({ comments: listInvoiceComments(access.ctx.orgId, id) });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowApiKey: false });
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const body = (await req.json()) as { body?: string };
  if (!body.body?.trim()) {
    return NextResponse.json({ error: "Comment text is required." }, { status: 400 });
  }
  const comment = addInvoiceComment(access.ctx.orgId, id, access.ctx.actorEmail, body.body);
  if (!comment) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json({ comment }, { status: 201 });
}
