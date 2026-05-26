import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { deals } from "../../../lib/schema";
import { eq, ilike, and, or } from "drizzle-orm";
import type { ApiResponse } from "../../../lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  try {
    let rows;

    if (search) {
      rows = await db
        .select()
        .from(deals)
        .where(
          and(
            eq(deals.status, "active"),
            or(
              ilike(deals.title, `%${search}%`),
              ilike(deals.description, `%${search}%`),
              ilike(deals.location, `%${search}%`)
            )
          )
        )
        .orderBy(deals.createdAt);
    } else if (category) {
      rows = await db
        .select()
        .from(deals)
        .where(
          and(
            eq(deals.status, "active"),
            eq(deals.category, category as typeof deals.$inferSelect["category"])
          )
        )
        .orderBy(deals.createdAt);
    } else if (featured === "true") {
      rows = await db
        .select()
        .from(deals)
        .where(and(eq(deals.status, "active"), eq(deals.featured, true)))
        .orderBy(deals.createdAt);
    } else {
      rows = await db
        .select()
        .from(deals)
        .where(eq(deals.status, "active"))
        .orderBy(deals.createdAt);
    }

    const response: ApiResponse<typeof rows> = {
      success: true,
      data: rows,
      meta: { total: rows.length, page: 1, limit: rows.length },
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/deals GET]", err);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch deals",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Validate webhook secret — only the Telegram bot / n8n may submit deals
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
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

  const input = body as Partial<typeof deals.$inferInsert>;
  const required = [
    "title",
    "description",
    "price",
    "category",
    "sellerName",
    "sellerTelegram",
    "location",
  ] as const;

  const missing = required.filter((k) => !input[k]);
  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, error: `Missing fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const [created] = await db
      .insert(deals)
      .values({
        id: `deal-${Date.now()}`,
        title: input.title!,
        description: input.description!,
        price: input.price!,
        category: input.category!,
        sellerName: input.sellerName!,
        sellerTelegram: input.sellerTelegram!,
        sellerPhone: input.sellerPhone ?? null,
        location: input.location!,
        status: "pending", // requires review before going active
        featured: false,
      })
      .returning();

    const response: ApiResponse<typeof created> = { success: true, data: created };
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("[/api/deals POST]", err);
    return NextResponse.json(
      { success: false, error: "Failed to create deal" },
      { status: 500 }
    );
  }
}
