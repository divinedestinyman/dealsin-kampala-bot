/**
 * Seed script — populates Railway PostgreSQL with initial deals and agents.
 * Run once after migrations: npm run db:seed
 *
 * Uses the mock data from lib/data.ts and lib/agents.ts as the source of truth.
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../lib/db";
import { deals, agents } from "../lib/schema";
import { DEALS } from "../lib/data";
import { AGENTS } from "../lib/agents";

async function seed() {
  console.log("🌱 Seeding database...\n");

  // ── Deals ──────────────────────────────────────────────────────────────────
  console.log(`Inserting ${DEALS.length} deals...`);
  for (const d of DEALS) {
    await db
      .insert(deals)
      .values({
        id: d.id,
        title: d.title,
        description: d.description,
        price: d.price,
        category: d.category as typeof deals.$inferInsert["category"],
        status: d.status as typeof deals.$inferInsert["status"],
        featured: d.featured ?? false,
        sellerName: d.sellerName,
        sellerTelegram: d.sellerTelegram,
        sellerPhone: d.sellerPhone ?? null,
        sellerVerified: d.verified ?? false,
        location: d.location,
        photos: null, // Phase 1 — no photo URLs yet
      })
      .onConflictDoNothing(); // idempotent — safe to re-run
    console.log(`  ✓ ${d.id}: ${d.title}`);
  }

  // ── Agents ─────────────────────────────────────────────────────────────────
  console.log(`\nInserting ${AGENTS.length} agents...`);
  for (const a of AGENTS) {
    await db
      .insert(agents)
      .values({
        id: a.id,
        name: a.name,
        telegramHandle: a.telegram.replace(/^@/, ""),
        phone: a.mtn ?? a.airtel ?? null,
        altPhone: a.mtn && a.airtel ? a.airtel : null,
        area: a.area,
        division: a.division,
        landmark: a.landmark,
        verified: a.verified ?? false,
        active: true,
        mtnNumber: a.mtn ?? null,
        airtelNumber: a.airtel ?? null,
      })
      .onConflictDoNothing();
    console.log(`  ✓ ${a.id}: ${a.name}`);
  }

  console.log("\n✅ Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
