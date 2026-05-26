import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { agents } from "../../../lib/schema";
import { eq, ilike, or, and } from "drizzle-orm";
import type { ApiResponse } from "../../../lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get("area");
  const verified = searchParams.get("verified");

  try {
    let rows;

    if (area) {
      rows = await db
        .select()
        .from(agents)
        .where(
          and(
            eq(agents.active, true),
            or(
              ilike(agents.area, `%${area}%`),
              ilike(agents.division, `%${area}%`),
              ilike(agents.landmark, `%${area}%`)
            )
          )
        )
        .orderBy(agents.verified, agents.name);
    } else if (verified === "true") {
      rows = await db
        .select()
        .from(agents)
        .where(and(eq(agents.active, true), eq(agents.verified, true)))
        .orderBy(agents.name);
    } else {
      rows = await db
        .select()
        .from(agents)
        .where(eq(agents.active, true))
        .orderBy(agents.verified, agents.name);
    }

    const response: ApiResponse<typeof rows> = {
      success: true,
      data: rows,
      meta: { total: rows.length, page: 1, limit: rows.length },
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/agents GET]", err);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch agents",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
