import { NextRequest, NextResponse } from "next/server";
import {
  createRecurringScheduleForOrg,
  listRecurringSchedulesForOrg,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  return NextResponse.json({
    schedules: listRecurringSchedulesForOrg(access.ctx.orgId),
  });
}

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    if (!body.title?.trim() || !body.customerId || !body.lineName?.trim()) {
      return NextResponse.json(
        { error: "Title, customerId, and lineName are required." },
        { status: 400 }
      );
    }
    const schedule = createRecurringScheduleForOrg(access.ctx.orgId, {
      title: body.title,
      customerId: body.customerId,
      frequency: ["MONTHLY", "QUARTERLY", "YEARLY"].includes(body.frequency) ? body.frequency : "MONTHLY",
      nextRunDate: body.nextRunDate || new Date().toISOString().slice(0, 10),
      profile: body.profile,
      currency: body.currency || "EUR",
      lineName: body.lineName,
      quantity: Number(body.quantity) || 1,
      unitCode: body.unitCode || "MON",
      unitPrice: Number(body.unitPrice) || 0,
      vatCategory: body.vatCategory || "S",
      vatRate: Number(body.vatRate ?? 19),
      autoEmail: Boolean(body.autoEmail),
    });
    return NextResponse.json({ schedule }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create recurring schedule" },
      { status: 400 }
    );
  }
}
