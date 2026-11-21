import { NextResponse } from "next/server";
import { pingPostgresHealth } from "@/lib/db-repository";

export async function GET() {
  const dbHealth = await pingPostgresHealth();
  return NextResponse.json({
    status: "ok",
    service: "norminvoice-web-api",
    standards: ["EN 16931", "ZUGFeRD 2.3", "Factur-X 1.07", "XRechnung 3.0.2", "Peppol BIS 3.0"],
    engineMode: process.env.EINVOICE_ENGINE_URL ? "sandboxed-kosit-verapdf" : "builtin-deterministic-en16931",
    database: dbHealth,
    euDataResidency: "Germany (EU-Central)",
    timestamp: new Date().toISOString(),
  });
}
