import type { Metadata } from "next";
import Link from "next/link";
import { formatPrice, CATEGORIES } from "../../lib/data";
import {
  searchDeals,
  getDealsByCategory,
  getAllActiveDeals,
} from "../../lib/queries";
import { DealCard } from "../page";

export const dynamic = "force-dynamic"; // DB-backed — render per-request, no build-time pre-render

export const metadata: Metadata = {
  title: "Browse Deals",
  description: "Browse all deals on DealsInKampala — phones, vehicles, property, electronics and more.",
};

interface PageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function DealsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { search, category } = params;

  let deals: import("../../lib/types").Deal[];
  let pageTitle = "All Deals";

  if (search) {
    deals = await searchDeals(search);
    pageTitle = `Results for "${search}"`;
  } else if (category) {
    deals = await getDealsByCategory(category);
    const cat = CATEGORIES.find((c) => c.value === category);
    pageTitle = cat ? `${cat.emoji} ${cat.label}` : "Deals";
  } else {
    deals = await getAllActiveDeals();
    pageTitle = "All Deals";
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem" }}>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          {pageTitle}
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
          {deals.length} deal{deals.length !== 1 ? "s" : ""} found
          {search ? ` for "${search}"` : ""}
        </p>
      </div>

      {/* Search + filter bar */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        {/* Search form */}
        <form
          action="/deals"
          method="get"
          style={{ display: "flex", gap: "0", flex: 1, minWidth: 260 }}
        >
          {category && (
            <input type="hidden" name="category" value={category} />
          )}
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search deals..."
            style={{
              flex: 1,
              padding: "0.625rem 1rem",
              border: "1px solid var(--color-border)",
              borderRight: "none",
              borderRadius: "8px 0 0 8px",
              fontSize: "0.9rem",
              outline: "none",
              backgroundColor: "var(--color-surface)",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "var(--color-green-primary)",
              color: "#fff",
              border: "none",
              padding: "0.625rem 1rem",
              borderRadius: "0 8px 8px 0",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            Search
          </button>
        </form>

        {/* Clear filters */}
        {(search || category) && (
          <Link
            href="/deals"
            style={{
              padding: "0.625rem 1rem",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              textDecoration: "none",
              color: "var(--color-muted)",
              fontSize: "0.875rem",
              backgroundColor: "var(--color-surface)",
              whiteSpace: "nowrap",
            }}
          >
            ✕ Clear filters
          </Link>
        )}
      </div>

      {/* Category filter chips */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href={search ? `/deals?search=${search}` : "/deals"}
          style={{
            padding: "0.375rem 0.875rem",
            borderRadius: 20,
            textDecoration: "none",
            fontSize: "0.8rem",
            fontWeight: 600,
            backgroundColor: !category
              ? "var(--color-green-primary)"
              : "var(--color-surface)",
            color: !category ? "#fff" : "var(--color-text)",
            border: "1px solid var(--color-border)",
          }}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.value;
          const href = search
            ? `/deals?category=${cat.value}&search=${search}`
            : `/deals?category=${cat.value}`;
          return (
            <Link
              key={cat.value}
              href={href}
              style={{
                padding: "0.375rem 0.875rem",
                borderRadius: 20,
                textDecoration: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                backgroundColor: isActive
                  ? "var(--color-green-primary)"
                  : "var(--color-surface)",
                color: isActive ? "#fff" : "var(--color-text)",
                border: "1px solid var(--color-border)",
                whiteSpace: "nowrap",
              }}
            >
              {cat.emoji} {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Deals grid */}
      {deals.length > 0 ? (
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
      ) : (
        <EmptyState search={search} category={category} />
      )}
    </div>
  );
}

function EmptyState({
  search,
  category,
}: {
  search?: string;
  category?: string;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "4rem 1rem",
        backgroundColor: "var(--color-surface)",
        borderRadius: 12,
        border: "1px solid var(--color-border)",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
      <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
        No deals found
      </h3>
      <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        {search
          ? `No active deals match "${search}".`
          : category
          ? `No active deals in this category yet.`
          : "No active deals at the moment."}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <Link
          href="/deals"
          style={{
            backgroundColor: "var(--color-green-primary)",
            color: "#fff",
            padding: "0.625rem 1.25rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          Browse all deals
        </Link>
        <a
          href="https://t.me/DealsinKampalaBot"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "var(--color-surface)",
            color: "var(--color-orange)",
            padding: "0.625rem 1.25rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            border: "1px solid var(--color-border)",
          }}
        >
          Submit a deal
        </a>
      </div>
    </div>
  );
}
