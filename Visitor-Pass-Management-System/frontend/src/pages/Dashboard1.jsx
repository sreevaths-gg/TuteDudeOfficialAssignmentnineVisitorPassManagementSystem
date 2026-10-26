import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalAppointments: 0,
    totalPasses: 0,
    checkedInVisitors: 0,
    checkedOutVisitors: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/stats");

      // Support both { stats: {...} } and direct statistics responses.
      const data = response.data?.stats || response.data || {};

      setStats({
        totalVisitors: data.totalVisitors ?? 0,
        totalAppointments: data.totalAppointments ?? 0,
        totalPasses: data.totalPasses ?? 0,
        checkedInVisitors: data.checkedInVisitors ?? 0,
        checkedOutVisitors: data.checkedOutVisitors ?? 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard statistics. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Visitors",
      value: stats.totalVisitors,
      icon: "👥",
      color: "#2563eb",
    },
    {
      title: "Appointments",
      value: stats.totalAppointments,
      icon: "📅",
      color: "#7c3aed",
    },
    {
      title: "Total Passes",
      value: stats.totalPasses,
      icon: "🎫",
      color: "#0891b2",
    },
    {
      title: "Checked In",
      value: stats.checkedInVisitors,
      icon: "✅",
      color: "#16a34a",
    },
    {
      title: "Checked Out",
      value: stats.checkedOutVisitors,
      icon: "🚪",
      color: "#ea580c",
    },
  ];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>Dashboard</h1>
          <p style={styles.subtitle}>
            Overview of visitor registrations and pass activity
          </p>
        </div>
 
        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
          style={styles.refreshButton}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div role="alert" style={styles.error}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={styles.loading}>Loading dashboard statistics...</p>
      ) : (
        <section style={styles.grid} aria-label="Dashboard statistics">
          {cards.map((card) => (
            <article
              key={card.title}
              style={{
                ...styles.card,
                borderTop: `4px solid ${card.color}`,
              }}
            >
              <div style={styles.cardTop}>
                <span style={styles.cardTitle}>{card.title}</span>
                <span style={styles.icon} aria-hidden="true">
                  {card.icon}
                </span>
              </div>

              <p style={styles.value}>{card.value}</p>
              <p style={styles.cardFooter}>Current total</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    background: "#f3f6fb",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 28,
  },
  heading: {
    margin: 0,
    fontSize: 30,
    color: "#172033",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 0,
    color: "#667085",
    fontSize: 15,
  },
  refreshButton: {
    padding: "10px 16px",
    background: "#ffffff",
    color: "#1d4ed8",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 22,
    boxShadow: "0 3px 12px rgba(15, 23, 42, 0.06)",
    minWidth: 0,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: {
    color: "#475467",
    fontSize: 15,
    fontWeight: 600,
  },
  icon: {
    fontSize: 25,
  },
  value: {
    fontSize: 36,
    fontWeight: 700,
    color: "#172033",
    margin: "22px 0 8px",
  },
  cardFooter: {
    color: "#98a2b3",
    fontSize: 13,
    margin: 0,
  },
  loading: {
    padding: 20,
    color: "#475467",
  },
  error: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
};

export default Dashboard;