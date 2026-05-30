/**
 * Server-side data access layer — wraps Drizzle queries used by page components.
 * All functions are async and run on the server (Server Components / Route Handlers).
 */

import { db } from "./db";
import { deals, agents } from "./schema";
import { eq, ilike, and, or, desc } from "drizzle-orm";
import type { Deal, Agent } from "./types";

// ─── Mappers — DB row → API shape ─────────────────────────────────────────────
// The DB stores seller fields flat (sellerName, sellerTelegram…).
// DealCard and the pages expect the nested `seller` shape from lib/types.ts.
// This mapper bridges the two so pages need zero changes.

type DbDeal = typeof deals.$inferSelect;
type DbAgent = typeof agents.$inferSelect;

function toDeal(row: DbDeal): Deal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    category: row.category,
    status: row.status,
    featured: row.featured,
    location: row.location,
    sellerName: row.sellerName,
    sellerTelegram: row.sellerTelegram,
    sellerPhone: row.sellerPhone ?? null,
    verified: row.sellerVerified,
    photos: row.photos ? row.photos.split(",").filter(Boolean) : undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function toAgent(row: DbAgent): Agent {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    division: row.division,
    landmark: row.landmark,
    mtn: row.mtnNumber ?? null,
    airtel: row.airtelNumber ?? null,
    telegram: row.telegramHandle,
    whatsapp: row.phone ?? "",
    verified: row.verified,
  };
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export async function getAllActiveDeals(): Promise<Deal[]> {
  const rows = await db
    .select()
    .from(deals)
    .where(eq(deals.status, "active"))
    .orderBy(desc(deals.createdAt));
  return rows.map(toDeal);
}

export async function getFeaturedDeals(limit = 6): Promise<Deal[]> {
  const rows = await db
    .select()
    .from(deals)
    .where(and(eq(deals.status, "active"), eq(deals.featured, true)))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  return rows.map(toDeal);
}

export async function searchDeals(query: string): Promise<Deal[]> {
  const rows = await db
    .select()
    .from(deals)
    .where(
      and(
        eq(deals.status, "active"),
        or(
          ilike(deals.title, `%${query}%`),
          ilike(deals.description, `%${query}%`),
          ilike(deals.location, `%${query}%`)
        )
      )
    )
    .orderBy(desc(deals.createdAt));
  return rows.map(toDeal);
}

export async function getDealsByCategory(category: string): Promise<Deal[]> {
  const rows = await db
    .select()
    .from(deals)
    .where(
      and(
        eq(deals.status, "active"),
        eq(deals.category, category as DbDeal["category"])
      )
    )
    .orderBy(desc(deals.createdAt));
  return rows.map(toDeal);
}

export async function getDealById(id: string): Promise<Deal | null> {
  const [row] = await db
    .select()
    .from(deals)
    .where(eq(deals.id, id))
    .limit(1);
  return row ? toDeal(row) : null;
}

export async function getAllDealIds(): Promise<string[]> {
  const rows = await db.select({ id: deals.id }).from(deals);
  return rows.map((r) => r.id);
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export async function getAllActiveAgents(): Promise<Agent[]> {
  const rows = await db
    .select()
    .from(agents)
    .where(eq(agents.active, true))
    .orderBy(agents.verified, agents.name);
  return rows.map(toAgent);
}

export async function findAgentsByArea(query: string): Promise<Agent[]> {
  const rows = await db
    .select()
    .from(agents)
    .where(
      and(
        eq(agents.active, true),
        or(
          ilike(agents.area, `%${query}%`),
          ilike(agents.division, `%${query}%`),
          ilike(agents.landmark, `%${query}%`)
        )
      )
    )
    .orderBy(agents.verified, agents.name);
  return rows.map(toAgent);
}

export async function getAgentAreas(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ area: agents.area })
    .from(agents)
    .where(eq(agents.active, true))
    .orderBy(agents.area);
  return rows.map((r) => r.area);
}

// ─── Bot-specific deal queries ─────────────────────────────────────────────────

export async function countActiveDeals(): Promise<number> {
  const rows = await db
    .select({ id: deals.id })
    .from(deals)
    .where(eq(deals.status, "active"));
  return rows.length;
}

export async function getDealsByTelegram(handle: string): Promise<Deal[]> {
  const rows = await db
    .select()
    .from(deals)
    .where(
      and(
        eq(deals.sellerTelegram, handle),
        eq(deals.status, "active")
      )
    )
    .orderBy(desc(deals.createdAt))
    .limit(10);
  return rows.map(toDeal);
}

// ─── MarkdownV2 formatting helpers ────────────────────────────────────────────
// Telegram MarkdownV2 requires escaping: _ * [ ] ( ) ~ ` > # + - = | { } . !

function escMd(s: string): string {
  return s.replace(/[_*[\]()~`>#+=|{}.!\-]/g, (c) => `\\${c}`);
}

export function formatDealMd(deal: Deal): string {
  const price = deal.price.toLocaleString("en-UG");
  const verified = deal.verified ? "✅" : "🔲";
  const desc =
    deal.description.length > 120
      ? deal.description.slice(0, 120) + "..."
      : deal.description;
  return (
    `*${escMd(deal.title)}*\n` +
    `💰 UGX ${escMd(price)}\n` +
    `📍 ${escMd(deal.location)}\n` +
    `👤 ${verified} ${escMd(deal.sellerName)} \\(@${escMd(deal.sellerTelegram)}\\)\n` +
    `📝 ${escMd(desc)}\n` +
    `🏷 ${escMd(deal.category)}`
  );
}

export function formatAgentMd(agent: Agent): string {
  const mtn = agent.mtn ? `MTN: ${escMd(agent.mtn)}` : "";
  const airtel = agent.airtel ? `Airtel: ${escMd(agent.airtel)}` : "";
  const numbers = [mtn, airtel].filter(Boolean).join(" \\| ");
  return (
    `👤 *${escMd(agent.name)}*\n` +
    `📍 ${escMd(agent.area)} — ${escMd(agent.landmark)}\n` +
    `💬 @${escMd(agent.telegram)}\n` +
    (numbers ? `📱 ${numbers}\n` : "") +
    `${agent.verified ? "✅ Verified agent" : "🔲 Pending verification"}`
  );
}
