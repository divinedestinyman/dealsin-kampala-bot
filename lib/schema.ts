import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const dealStatusEnum = pgEnum("deal_status", [
  "active",
  "pending",
  "sold",
  "expired",
]);

export const dealCategoryEnum = pgEnum("deal_category", [
  "phones",
  "electronics",
  "vehicles",
  "property",
  "fashion",
  "home",
  "services",
  "other",
]);

export const dealTypeEnum = pgEnum("deal_type", ["standard", "high_value"]);

// ─── Deals ────────────────────────────────────────────────────────────────────

export const deals = pgTable(
  "deals",
  {
    id: text("id").primaryKey(), // e.g. "deal-001"
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(), // UGX, no decimals
    category: dealCategoryEnum("category").notNull(),
    status: dealStatusEnum("status").notNull().default("active"),
    featured: boolean("featured").notNull().default(false),

    // Seller info
    sellerName: text("seller_name").notNull(),
    sellerTelegram: text("seller_telegram").notNull(), // without @
    sellerPhone: text("seller_phone"),
    sellerVerified: boolean("seller_verified").notNull().default(false),

    // Location
    location: text("location").notNull(), // e.g. "Nakawa, Kampala"

    // Photos stored as comma-separated URLs; Phase 1 uses emoji placeholders
    photos: text("photos"), // nullable — may be empty in Phase 1

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at"),
  },
  (t) => [
    index("deals_category_idx").on(t.category),
    index("deals_status_idx").on(t.status),
    index("deals_featured_idx").on(t.featured),
  ]
);

// ─── Agents ───────────────────────────────────────────────────────────────────

export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey(), // e.g. "agent-001"
    name: text("name").notNull(),
    telegramHandle: text("telegram_handle").notNull(), // without @
    phone: text("phone"), // primary contact number (nullable — use mtn/airtel instead)
    altPhone: text("alt_phone"),
    area: text("area").notNull(), // e.g. "Nakawa"
    division: text("division").notNull(), // e.g. "Kampala Central"
    landmark: text("landmark").notNull(),
    verified: boolean("verified").notNull().default(false),
    active: boolean("active").notNull().default(true),
    mtnNumber: text("mtn_number"),
    airtelNumber: text("airtel_number"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => [
    index("agents_area_idx").on(t.area),
    index("agents_verified_idx").on(t.verified),
  ]
);

// ─── Commission Records ────────────────────────────────────────────────────────

export const commissionRecords = pgTable(
  "commission_records",
  {
    id: text("id").primaryKey(), // nanoid generated at insert time
    dealId: text("deal_id").notNull(),
    dealDescription: text("deal_description").notNull(),
    dealType: dealTypeEnum("deal_type").notNull(),

    // Parties
    agentTelegramId: text("agent_telegram_id").notNull(),
    agentName: text("agent_name").notNull(),
    buyerName: text("buyer_name").notNull(),
    sellerName: text("seller_name").notNull(),

    // Amounts (all UGX)
    amountUgx: integer("amount_ugx").notNull(),
    agentCommissionUgx: integer("agent_commission_ugx").notNull(), // always 1%
    africaTeamCommissionUgx: integer("africa_team_commission_ugx").notNull(), // 1% standard, 5% high_value
    totalCommissionUgx: integer("total_commission_ugx").notNull(),

    // Status
    paid: boolean("paid").notNull().default(false),
    paidAt: timestamp("paid_at"),

    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  },
  (t) => [
    index("commission_agent_idx").on(t.agentTelegramId),
    index("commission_deal_idx").on(t.dealId),
    index("commission_recorded_idx").on(t.recordedAt),
  ]
);

// ─── Type exports ─────────────────────────────────────────────────────────────

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type CommissionRecord = typeof commissionRecords.$inferSelect;
export type NewCommissionRecord = typeof commissionRecords.$inferInsert;
