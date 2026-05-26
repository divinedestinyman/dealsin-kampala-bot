import type { Metadata } from "next";
import { getAllActiveAgents } from "../../lib/queries";
import type { Agent } from "../../lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verified Escrow Agents",
  description:
    "Find a verified escrow agent near you in Kampala. Our agents hold payment in trust so your deal is always safe.",
};

export default async function AgentsPage() {
  const allAgents = await getAllActiveAgents();
  const verifiedAgents = allAgents.filter((a) => a.verified);
  const pendingAgents = allAgents.filter((a) => !a.verified);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem" }}>
      {/* Hero */}
      <div
        style={{
          backgroundColor: "var(--color-green-primary)",
          borderRadius: 16,
          padding: "2.5rem",
          color: "#fff",
          marginBottom: "3rem",
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
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              opacity: 0.65,
              marginBottom: "0.75rem",
            }}
          >
            🛡️ ESCROW AGENT NETWORK
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              marginBottom: "0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            Verified Agents in Kampala
          </h1>
          <p style={{ opacity: 0.85, fontSize: "0.95rem", lineHeight: 1.65, maxWidth: 480 }}>
            Our agents are verified community members who hold mobile money
            escrow for P2P deals. They earn a 1% commission only when your
            deal completes — their incentive is always your safety.
          </p>
        </div>
        <a
          href="https://t.me/DealsinKampalaBot"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "var(--color-orange)",
            color: "#fff",
            padding: "0.875rem 1.5rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          📱 Find Agent via Bot
        </a>
      </div>

      {/* How escrow works */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem" }}>
          How agent escrow works
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
          }}
        >
          {[
            { step: "1", emoji: "🤝", title: "Agree on deal", desc: "Buyer and seller agree on price and terms via Telegram." },
            { step: "2", emoji: "💳", title: "Buyer pays agent", desc: "Buyer sends payment to the agent via MTN MoMo or Airtel Money." },
            { step: "3", emoji: "📦", title: "Item is delivered", desc: "Seller delivers the item. Buyer inspects and confirms." },
            { step: "4", emoji: "✅", title: "Agent releases funds", desc: "Agent pays the seller. Deal complete. Everyone happy." },
          ].map((s) => (
            <div
              key={s.step}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "var(--color-green-primary)",
                  opacity: 0.5,
                  letterSpacing: "0.1em",
                  marginBottom: "0.5rem",
                }}
              >
                STEP {s.step}
              </div>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.375rem" }}>{s.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Commission structure */}
      <section
        style={{
          backgroundColor: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: 12,
          padding: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>💰 Commission Structure</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "0.9rem" }}>
              Standard deals (electronics, phones, clothing…)
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
              Agent earns 1% · Africa Team earns 1% · Total: <strong>2% of deal value</strong>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "0.9rem" }}>
              High-value deals (car, land, house)
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
              Agent earns 1% · Africa Team earns 5% · Total: <strong>6% of deal value</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Agent grid */}
      {verifiedAgents.length > 0 ? (
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem" }}>
            ✅ Verified Agents ({verifiedAgents.length})
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
            }}
          >
            {verifiedAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Placeholder agents */}
      {pendingAgents.length > 0 && (
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            🔵 Agent Slots ({pendingAgents.length} areas covered)
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            These areas are actively being recruited. Use the Telegram bot to be matched with the nearest available agent.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
            }}
          >
            {pendingAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      {/* Become an agent CTA */}
      <section
        style={{
          backgroundColor: "var(--color-green-primary)",
          borderRadius: 16,
          padding: "2.5rem",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>💼</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          Become an Escrow Agent
        </h2>
        <p
          style={{
            opacity: 0.85,
            fontSize: "0.95rem",
            lineHeight: 1.65,
            maxWidth: 500,
            margin: "0 auto 1.75rem",
          }}
        >
          Earn commission on every deal in your area. We need verified agents
          in all divisions of Kampala and Greater Kampala. Mobile money account
          required.
        </p>
        <a
          href="https://t.me/DealsinKampalaBot"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            backgroundColor: "var(--color-orange)",
            color: "#fff",
            padding: "0.875rem 2rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          Apply via Telegram Bot
        </a>
      </section>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: `1px solid ${agent.verified ? "#BBF7D0" : "var(--color-border)"}`,
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            backgroundColor: agent.verified
              ? "var(--color-green-primary)"
              : "var(--color-muted)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {agent.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{agent.name}</div>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: agent.verified ? "#065F46" : "var(--color-muted)",
            }}
          >
            {agent.verified ? "✅ VERIFIED AGENT" : "🔵 PENDING VERIFICATION"}
          </div>
        </div>
      </div>

      {/* Details */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem",
          marginBottom: "1rem",
          fontSize: "0.8rem",
          color: "var(--color-muted)",
        }}
      >
        <span>📍 {agent.area}, {agent.division}</span>
        <span>🏢 {agent.landmark}</span>
        {agent.mtn && <span>📱 MTN: {agent.mtn}</span>}
        {agent.airtel && <span>📱 Airtel: {agent.airtel}</span>}
      </div>

      {/* Contact */}
      <a
        href={`https://t.me/${agent.telegram.replace("@", "")}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          backgroundColor: agent.verified
            ? "var(--color-green-primary)"
            : "var(--color-surface)",
          color: agent.verified ? "#fff" : "var(--color-muted)",
          border: `1px solid ${agent.verified ? "transparent" : "var(--color-border)"}`,
          padding: "0.625rem 1rem",
          borderRadius: 7,
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "0.8rem",
          textAlign: "center",
        }}
      >
        {agent.verified ? `📩 Contact ${agent.telegram}` : "📱 Contact via Bot"}
      </a>
    </div>
  );
}
