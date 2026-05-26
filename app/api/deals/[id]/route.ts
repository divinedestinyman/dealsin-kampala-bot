import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { deals } from "../../../../lib/schema";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "../../../../lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [deal] = await db
      .select()
      .from(deals)
      .where(eq(deals.id, id))
      .limit(1);

    if (!deal) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Deal "${id}" not found`,
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<typeof deal> = { success: true, data: deal };
    return NextResponse.json(response);
  } catch (err) {
    console.error(`[/api/deals/${id} GET]`, err);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch deal",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
