import Link from "next/link";
import { formatPrice, CATEGORIES } from "../lib/data";
import { getFeaturedDeals } from "../lib/queries";
import type { Deal } from "../lib/types";

// force-dynamic: DB is queried per-request; no build-time pre-render needed.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedDeals();

  return (
    <>
      <HeroSection />
      <StatsBar />
      <CategoriesSection />
      <FeaturedDealsSection deals={featured} />
      <HowItWorks />
      <AgentTeaser />
      <TelegramCTA />
    </>
  );
}

function HeroSection() {
  return (
    <section
      style={{
        backgroundColor: "var(--color-green-primary)",
        color: "#fff",
        padding: "5rem 1.25rem 4rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            display: "inline-block",
            backgroundColor: "rgba(232,94,0,0.25)",
            color: "var(--color-orange-light)",
            padding: "0.3rem 0.9rem",
            borderRadius: 20,
            fontSize: "0.8rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
            letterSpacing: "0.04em",
          }}
        >
          🛡️ ESCROW-PROTECTED DEALS
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "1.25rem",
          }}
        >
          Buy &amp; sell in Kampala —{" "}
          <span style={{ color: "var(--color-orange-light)" }}>safely.</span>
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            opacity: 0.85,
            lineHeight: 1.65,
            marginBottom: "2.5rem",
            maxWidth: 560,
            margin: "0 auto 2.5rem",
          }}
        >
          Every deal backed by a verified escrow agent. No more scams. No more
          stress. Your money is safe until the deal is done.
        </p>

        {/* Search bar */}
        <form
          action="/deals"
          method="get"
          style={{
            display: "flex",
            gap: "0",
            maxWidth: 560,
            margin: "0 auto 1.5rem",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          <input
            type="search"
            name="search"
            placeholder="Search phones, cars, property..."
            style={{
              flex: 1,
              padding: "1rem 1.25rem",
              border: "none",
              fontSize: "0.95rem",
              outline: "none",
              backgroundColor: "#fff",
              color: "var(--color-text)",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "var(--color-orange)",
              color: "#fff",
              border: "none",
              padding: "1rem 1.5rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/deals"
            style={{
              backgroundColor: "#fff",
              color: "var(--color-green-primary)",
              padding: "0.75rem 1.5rem",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            Browse All Deals
          </Link>
          <Link
            href="/submit"
            style={{
              backgroundColor: "transparent",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              border: "2px solid rgba(255,255,255,0.5)",
            }}
          >
            Submit a Deal
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { value: "12,000+", label: "Community Members" },
    { value: "100%", label: "Escrow Protected" },
    { value: "Free", label: "To List Your Deal" },
  ];

  return (
    <section
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          padding: "0 1.25rem",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              padding: "1.5rem 1rem",
              textAlign: "center",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--color-green-primary)",
              }}
            >
              {s.value}
            </div>
            <div
              style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: 4 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section style={{ maxWidth: 1200, margin: "4rem auto", padding: "0 1.25rem" }}>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          color: "var(--color-text)",
        }}
      >
        Browse by Category
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.75rem",
        }}
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/deals?category=${cat.value}`}
            style={{
              textDecoration: "none",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: "1.25rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{cat.emoji}</span>
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--color-text)",
              }}
            >
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedDealsSection({ deals }: { deals: Deal[] }) {
  return (
    <section
      style={{
        backgroundColor: "var(--color-bg)",
        padding: "3rem 1.25rem",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Featured Deals
          </h2>
          <Link
            href="/deals"
            style={{
              color: "var(--color-orange)",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            View all →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function DealCard({ deal }: { deal: Deal }) {
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

  return (
    <Link
      href={`/deals/${deal.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: 12,
          border: "1px solid var(--color-border)",
          overflow: "hidden",
          transition: "box-shadow 0.15s, transform 0.15s",
        }}
      >
        {/* Image placeholder */}
        <div
          style={{
            height: 160,
            backgroundColor: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "3.5rem",
          }}
        >
          {emoji}
        </div>

        <div style={{ padding: "1rem" }}>
          {/* Badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                backgroundColor: `${color}18`,
                color: color,
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "0.15rem 0.5rem",
                borderRadius: 4,
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
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: 4,
                }}
              >
                ✓ Verified
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: "0.5rem",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {deal.title}
          </h3>

          {/* Price */}
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              color: "var(--color-orange)",
              marginBottom: "0.5rem",
            }}
          >
            {formatPrice(deal.price)}
          </div>

          {/* Meta */}
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--color-muted)",
              display: "flex",
              flexDirection: "column",
              gap: "0.2rem",
            }}
          >
            <span>📍 {deal.location}</span>
            <span>👤 {deal.sellerName}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      emoji: "🔍",
      title: "Browse & find your deal",
      description:
        "Search deals or browse by category. Contact the seller directly via Telegram for details.",
    },
    {
      number: "02",
      emoji: "🤝",
      title: "Choose a verified agent",
      description:
        "Pick an escrow agent near you. The agent holds the payment in trust until both sides are happy.",
    },
    {
      number: "03",
      emoji: "✅",
      title: "Deal done. Safely.",
      description:
        "Buyer confirms receipt. Agent releases payment. No scams, no disputes, no stress.",
    },
  ];

  return (
    <section style={{ maxWidth: 1200, margin: "4rem auto", padding: "0 1.25rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          How it works
        </h2>
        <p style={{ color: "var(--color-muted)", fontSize: "1rem" }}>
          Simple, safe, and backed by real people in your city.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
        }}
      >
        {steps.map((step) => (
          <div
            key={step.number}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              padding: "1.75rem",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "var(--color-green-primary)",
                opacity: 0.4,
                letterSpacing: "0.1em",
                marginBottom: "0.75rem",
              }}
            >
              STEP {step.number}
            </div>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
              {step.emoji}
            </div>
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                marginBottom: "0.625rem",
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-muted)",
                lineHeight: 1.65,
              }}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AgentTeaser() {
  return (
    <section
      style={{
        backgroundColor: "#F0FDF4",
        border: "1px solid #BBF7D0",
        borderRadius: 16,
        maxWidth: 1200,
        margin: "0 auto 4rem",
        padding: "2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "2rem",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#065F46",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "0.75rem",
          }}
        >
          🛡️ VERIFIED ESCROW AGENTS
        </div>
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: "0.625rem",
          }}
        >
          Real people. Real trust. In your neighbourhood.
        </h2>
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.65,
            maxWidth: 500,
          }}
        >
          Our agents are verified community members who hold mobile money escrow
          for buyers and sellers. They earn a small commission only when deals
          complete — so their incentive is always your safety.
        </p>
      </div>
      <Link
        href="/agents"
        style={{
          backgroundColor: "var(--color-green-primary)",
          color: "#fff",
          padding: "0.875rem 1.75rem",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: "0.9rem",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Find an Agent →
      </Link>
    </section>
  );
}

function TelegramCTA() {
  return (
    <section
      style={{
        backgroundColor: "var(--color-orange)",
        color: "#fff",
        padding: "4rem 1.25rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📱</div>
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: "0.75rem",
            letterSpacing: "-0.02em",
          }}
        >
          Already on Telegram?
        </h2>
        <p
          style={{
            opacity: 0.9,
            fontSize: "1rem",
            lineHeight: 1.65,
            marginBottom: "2rem",
          }}
        >
          Join 12,000+ buyers and sellers. Use{" "}
          <strong>@DealsinKampalaBot</strong> to search deals, find agents,
          submit listings, and get alerts — all without leaving Telegram.
        </p>
        <a
          href="https://t.me/DealsinKampalaBot"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            backgroundColor: "#fff",
            color: "var(--color-orange)",
            padding: "0.875rem 2rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 800,
            fontSize: "1rem",
          }}
        >
          Open @DealsinKampalaBot
        </a>
      </div>
    </section>
  );
}
