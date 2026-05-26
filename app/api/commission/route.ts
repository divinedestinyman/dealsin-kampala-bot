import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { commissionRecords } from "../../../lib/schema";
import type { ApiResponse, CommissionRecord } from "../../../lib/types";

export const dynamic = "force-dynamic";

// n8n POSTs here when a deal closes via the Agent Commission Tracker workflow.
// Validates the shared webhook secret, calculates the split, and persists to DB.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  const expectedSecret = process.env.WEBHOOK_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    const response: ApiResponse<null> = { success: false, error: "Unauthorized" };
    return NextResponse.json(response, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const record = body as Partial<CommissionRecord>;
  const required: (keyof CommissionRecord)[] = [
    "agentTelegramId",
    "agentName",
    "buyerName",
    "sellerName",
    "amountUgx",
    "dealDescription",
    "dealId",
    "dealType",
  ];

  const missing = required.filter((k) => !record[k]);
  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // Calculate commission split
  const dealType = record.dealType!;
  const amount = record.amountUgx!;
  const agentCommissionPct = 0.01;                                  // always 1%
  const africaTeamPct = dealType === "standard" ? 0.01 : 0.05;     // 1% or 5%

  const agentCommissionUgx = Math.round(amount * agentCommissionPct);
  const africaTeamCommissionUgx = Math.round(amount * africaTeamPct);
  const totalCommissionUgx = agentCommissionUgx + africaTeamCommissionUgx;

  try {
    const [inserted] = await db
      .insert(commissionRecords)
      .values({
        id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        dealId: record.dealId!,
        dealDescription: record.dealDescription!,
        dealType: dealType === "standard" ? "standard" : "high_value",
        agentTelegramId: record.agentTelegramId!,
        agentName: record.agentName!,
        buyerName: record.buyerName!,
        sellerName: record.sellerName!,
        amountUgx: amount,
        agentCommissionUgx,
        africaTeamCommissionUgx,
        totalCommissionUgx,
        paid: false,
      })
      .returning();

    console.log("[Commission] recorded:", inserted.id, `UGX ${totalCommissionUgx.toLocaleString()}`);

    const response: ApiResponse<typeof inserted> = { success: true, data: inserted };
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("[Commission] DB insert failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to record commission" },
      { status: 500 }
    );
  }
}

// Health check for n8n workflow testing
export async function GET() {
  return NextResponse.json({
    success: true,
    data: { status: "Commission endpoint active", version: "2.0.0", storage: "railway-postgres" },
  });
}
