import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "../../../lib/data";
import { getDealById, getAllDealIds } from "../../../lib/queries";

// ISR — deal pages update within 60s when DB changes
export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDealById(id);
  if (!deal) return { title: "Deal not found" };
  return {
    title: deal.title,
    description: deal.description.slice(0, 160),
  };
}

// Pre-render existing DB deals at build time; new deals render on first request.
// Wrapped in try/catch so the build succeeds even when the DB is unreachable
// (e.g. CI environment). ISR (revalidate=60) handles serving all pages.
export async function generateStaticParams() {
  try {
    const ids = await getAllDealIds();
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export default async function DealDetailPage({ params }: PageProps) {
  const { id } = await params;
  const deal = await getDealById(id);

  if (!deal) notFound();

  const categoryColors: Record<string, string> = {
    phones: "#3B82F6",
    electronics: "#8B5CF6",
    vehicles: "#10B981",
    property: "#0EA5E9",
    clothing: "#EC4899",
    furniture: "#92400E",
    services: "#D97706",
    other: "#6B7280",
  };

  const categoryEmojis: Record<string, string> = {
    phones: "📱",
    electronics: "💻",
    vehicles: "🚗",
    property: "🏠",
    clothing: "👗",
    furniture: "🛋️",
    services: "🔧",
    other: "📦",
  };

  const color = categoryColors[deal.category] ?? "#6B7280";
  const emoji = categoryEmojis[deal.category] ?? "📦";

  const postedDate = new Date(deal.createdAt ?? Date.now()).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--color-muted)" }}>
        <Link href="/" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
          Home
        </Link>
        {" / "}
        <Link href="/deals" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
          Deals
        </Link>
        {" / "}
        <Link
          href={`/deals?category=${deal.category}`}
          style={{ color: "var(--color-muted)", textDecoration: "none" }}
        >
          {deal.category.charAt(0).toUpperCase() + deal.category.slice(1)}
        </Link>
        {" / "}
        <span style={{ color: "var(--color-text)" }}>{deal.title.slice(0, 40)}…</span>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* Left: Image + Description */}
        <div>
          {/* Image placeholder */}
          <div
            style={{
              backgroundColor: `${color}18`,
              borderRadius: 12,
              height: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "6rem",
              marginBottom: "1.5rem",
              border: "1px solid var(--color-border)",
            }}
          >
            {emoji}
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <span
              style={{
                backgroundColor: `${color}18`,
                color: color,
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.25rem 0.625rem",
                borderRadius: 5,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {deal.category}
            </span>
            {deal.verified && (
              <span
                style={{
                  backgroundColor: "#D1FAE5",
                  color: "#065F46",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.625rem",
                  borderRadius: 5,
                }}
              >
                ✓ Verified Seller
              </span>
            )}
            {deal.featured && (
              <span
                style={{
                  backgroundColor: "#FEF3C7",
                  color: "#92400E",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.625rem",
                  borderRadius: 5,
                }}
              >
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: "0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            {deal.title}
          </h1>

          {/* Price + location */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--color-orange)",
              }}
            >
              {formatPrice(deal.price)}
            </span>
            <span style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
              📍 {deal.location}
            </span>
          </div>

          {/* Description */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              About this deal
            </h2>
            <p
              style={{
                fontSize: "0.925rem",
                lineHeight: 1.75,
                color: "var(--color-text)",
                whiteSpace: "pre-line",
              }}
            >
              {deal.description}
            </p>
          </div>

          {/* Meta */}
          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.8rem",
              color: "var(--color-muted)",
            }}
          >
            Listed on {postedDate} · Deal #{deal.id}
          </div>
        </div>

        {/* Right: Seller card + escrow info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Seller card */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>
              Seller Information
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-green-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {deal.sellerName.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {deal.sellerName}
                </div>
                {deal.verified && (
                  <div style={{ fontSize: "0.75rem", color: "#065F46", fontWeight: 600 }}>
                    ✓ Verified seller
                  </div>
                )}
              </div>
            </div>

            {/* Contact buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <a
                href={`https://t.me/${deal.sellerTelegram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  backgroundColor: "var(--color-green-primary)",
                  color: "#fff",
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textAlign: "center",
                }}
              >
                📩 Message on Telegram
              </a>
              <a
                href={`tel:${deal.sellerPhone}`}
                style={{
                  display: "block",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textAlign: "center",
                  border: "1px solid var(--color-border)",
                }}
              >
                📞 Call {deal.sellerPhone}
              </a>
            </div>
          </div>

          {/* Escrow CTA */}
          <div
            style={{
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 12,
              padding: "1.25rem",
            }}
          >
            <div style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>🛡️</div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.375rem" }}>
              Use an escrow agent
            </h4>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--color-muted)",
                lineHeight: 1.6,
                marginBottom: "0.875rem",
              }}
            >
              Protect yourself. A verified agent holds your payment until you
              confirm the item is as described.
            </p>
            <Link
              href="/agents"
              style={{
                display: "block",
                backgroundColor: "var(--color-green-primary)",
                color: "#fff",
                padding: "0.625rem 1rem",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.8rem",
                textAlign: "center",
              }}
            >
              Find a Verified Agent →
            </Link>
          </div>

          {/* Safety tip */}
          <div
            style={{
              backgroundColor: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: 10,
              padding: "1rem",
              fontSize: "0.8rem",
              color: "#92400E",
              lineHeight: 1.6,
            }}
          >
            <strong>Safety tip:</strong> Never pay anyone before seeing the
            item. Always use a verified escrow agent for cash transactions.
          </div>
        </div>
      </div>

      {/* Back link */}
      <div style={{ marginTop: "2rem" }}>
        <Link
          href="/deals"
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          ← Back to all deals
        </Link>
      </div>
    </div>
  );
}
