import type { Deal } from "./types";

// Mock deal data — replace with Supabase DB in Phase 2
// Deals submitted via Telegram bot /submit command feed into this store

export const DEALS: Deal[] = [
  {
    id: "deal-001",
    title: "Samsung Galaxy S23 — 256GB Like New",
    description:
      "Bought 6 months ago, still in perfect condition. Full box with original charger, earphones, and screen protector still on. Battery health 97%. Reason for selling: upgrading to S24. Price is negotiable.",
    price: 2800000,
    currency: "UGX",
    category: "phones",
    status: "active",
    location: "Ntinda, Kampala",
    sellerName: "Brian K.",
    sellerTelegram: "@briank_ug",
    sellerPhone: "0772000001",
    photos: [],
    createdAt: "2026-05-24T08:00:00Z",
    featured: true,
    verified: true,
  },
  {
    id: "deal-002",
    title: "Toyota Premio 2010 — White, Low Mileage",
    description:
      "Clean car, full AC, leather seats, reverse camera installed. Engine serviced 2 months ago. Minor scratch on rear bumper (visible in photos). Log book in order. Viewing at Ntinda. Serious buyers only.",
    price: 32000000,
    currency: "UGX",
    category: "vehicles",
    status: "active",
    location: "Ntinda, Kampala",
    sellerName: "Moses T.",
    sellerTelegram: "@mosest_ug",
    sellerPhone: "0701000002",
    photos: [],
    createdAt: "2026-05-23T10:00:00Z",
    featured: true,
    verified: true,
  },
  {
    id: "deal-003",
    title: "HP Laptop Core i5, 8GB RAM, 512GB SSD",
    description:
      "HP EliteBook 840, purchased 2024, excellent condition. Windows 11 Pro activated. Keyboard has slight wear on spacebar but fully functional. Comes with bag and charger. Perfect for office work or programming.",
    price: 1650000,
    currency: "UGX",
    category: "electronics",
    status: "active",
    location: "Kawempe, Kampala",
    sellerName: "Sarah N.",
    sellerTelegram: "@sarahn_deals",
    sellerPhone: "0752000003",
    photos: [],
    createdAt: "2026-05-22T14:00:00Z",
    featured: false,
    verified: false,
  },
  {
    id: "deal-004",
    title: "3-Bedroom House — Kira, 12 Decimals",
    description:
      "Fully furnished 3-bedroom house on 12 decimals in Kira. 2 bathrooms, servant quarters, large compound with parking for 3 cars. 5 minutes from Kira Town. Title available. Ideal for family or rental investment.",
    price: 280000000,
    currency: "UGX",
    category: "property",
    status: "active",
    location: "Kira, Wakiso",
    sellerName: "Agent Mulinde",
    sellerTelegram: "@mulinde_property",
    sellerPhone: "0782000004",
    photos: [],
    createdAt: "2026-05-21T09:00:00Z",
    featured: true,
    verified: true,
  },
  {
    id: "deal-005",
    title: "Smart 65-inch 4K TV — LG OLED",
    description:
      "LG OLED C2 65 inch, 2023 model. Superb picture quality. Used in home cinema setup, no scratches. All remotes included. Selling because relocating. Delivery within Kampala available for extra 20K.",
    price: 4200000,
    currency: "UGX",
    category: "electronics",
    status: "active",
    location: "Kololo, Kampala",
    sellerName: "James P.",
    sellerTelegram: "@jamesp_kampala",
    sellerPhone: "0703000005",
    photos: [],
    createdAt: "2026-05-20T11:00:00Z",
    featured: false,
    verified: true,
  },
  {
    id: "deal-006",
    title: "Men's Office Suits — New, Size 42",
    description:
      "3 brand new Italian-cut suits. Dark navy, charcoal, and light grey. Size 42 jacket, 36 trousers. Bought for a wedding abroad, never worn after. Selling all 3 together or individually.",
    price: 350000,
    currency: "UGX",
    category: "fashion",
    status: "active",
    location: "Bugolobi, Kampala",
    sellerName: "Kevin M.",
    sellerTelegram: "@kevinm_fashion",
    sellerPhone: "0772000006",
    photos: [],
    createdAt: "2026-05-19T16:00:00Z",
    featured: false,
    verified: false,
  },
];

export function getDealById(id: string): Deal | undefined {
  return DEALS.find((d) => d.id === id);
}

export function getDealsByCategory(category: string): Deal[] {
  return DEALS.filter((d) => d.category === category && d.status === "active");
}

export function getFeaturedDeals(): Deal[] {
  return DEALS.filter((d) => d.featured && d.status === "active");
}

export function searchDeals(query: string): Deal[] {
  const q = query.toLowerCase();
  return DEALS.filter(
    (d) =>
      d.status === "active" &&
      (d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q))
  );
}

export function formatPrice(ugx: number): string {
  if (ugx >= 1000000) {
    return `UGX ${(ugx / 1000000).toFixed(1)}M`;
  }
  if (ugx >= 1000) {
    return `UGX ${(ugx / 1000).toFixed(0)}K`;
  }
  return `UGX ${ugx.toLocaleString()}`;
}

export const CATEGORIES = [
  { value: "phones", label: "Phones", emoji: "📱" },
  { value: "electronics", label: "Electronics", emoji: "💻" },
  { value: "vehicles", label: "Vehicles", emoji: "🚗" },
  { value: "property", label: "Property", emoji: "🏠" },
  { value: "clothing", label: "Clothing", emoji: "👗" },
  { value: "furniture", label: "Furniture", emoji: "🛋️" },
  { value: "services", label: "Services", emoji: "🔧" },
  { value: "other", label: "Other", emoji: "📦" },
] as const;
