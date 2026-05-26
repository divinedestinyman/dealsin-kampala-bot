export type DealCategory =
  | "phones"
  | "electronics"
  | "vehicles"
  | "property"
  | "fashion"
  | "home"
  | "services"
  | "other";

export type DealStatus = "active" | "sold" | "pending" | "expired";

export interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  currency?: "UGX";
  category: DealCategory;
  status: DealStatus;
  location: string;
  sellerName: string;
  sellerTelegram: string;
  sellerPhone?: string | null;
  photos?: string[];
  createdAt?: string;
  featured: boolean;
  verified: boolean;
}

export interface Agent {
  id: string;
  name: string;
  area: string;
  division: string;
  landmark: string;
  mtn: string | null;
  airtel: string | null;
  telegram: string;
  whatsapp: string;
  verified: boolean;
  dealsCompleted?: number;
}

export interface CommissionRecord {
  agentTelegramId: string;
  agentName: string;
  buyerName: string;
  sellerName: string;
  amountUgx: number;
  dealDescription: string;
  dealId: string;
  dealType: "standard" | "car" | "land" | "house";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
