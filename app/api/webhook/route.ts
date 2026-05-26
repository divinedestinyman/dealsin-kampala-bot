import { webhookCallback } from "grammy";
import { getBot } from "@/lib/bot";
import { NextRequest, NextResponse } from "next/server";

// Tell Next.js this route is always dynamic — never statically analyzed at build
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const handleUpdate = webhookCallback(getBot(), "std/http");
    return await handleUpdate(req);
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
