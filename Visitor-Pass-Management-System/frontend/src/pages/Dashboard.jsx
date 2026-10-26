
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalAppointments: 0,
    totalPasses: 0,
    checkedInVisitors: 0,
    checkedOutVisitors: 0,
  });

  const [passes, setPasses] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [statsLoading, setStatsLoading] = useState(true);
  const [passesLoading, setPassesLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [passesError, setPassesError] = useState("");

  // Load dashboard statistic cards.
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError("");

      const response = await api.get("/dashboard/stats");
      const data = response.data?.stats || {};

      setStats({
        totalVisitors: data.totalVisitors ?? 0,
        totalAppointments: data.totalAppointments ?? 0,
        totalPasses: data.totalPasses ?? 0,
        checkedInVisitors: data.checkedInVisitors ?? 0,
        checkedOutVisitors: data.checkedOutVisitors ?? 0,
      });
    } catch (err) {
      setStatsError(
        err.response?.data?.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load passes using backend search and filter parameters.
  const loadPasses = useCallback(async () => {
    try {
      setPassesLoading(true);
      setPassesError("");

      const response = await api.get("/dashboard/passes", {
        params: {
          search: search.trim(),
          status,
          fromDate,
          toDate,
          page,
          limit: 10,
        },
      });

      const result = response.data;

      setPasses(result.data || []);
      setTotalRecords(result.pagination?.total ?? 0);
      setTotalPages(
        Math.max(1, result.pagination?.totalPages ?? 1)
      );
    } catch (err) {
      setPasses([]);
      setTotalRecords(0);
      setTotalPages(1);

      setPassesError(
        err.response?.data?.message ||
          "Unable to load visitor passes."
      );
    } finally {
      setPassesLoading(false);
    }
  }, [search, status, fromDate, toDate, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Debounce text search. Filters and pagination also trigger
  // a new request using the latest values.
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPasses();
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [loadPasses, search]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setPage(1);
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
      {/* Dashboard header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>Dashboard</h1>
          <p style={styles.subtitle}>
            Overview of visitor registrations and pass activity
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadStats();
            loadPasses();
          }}
          disabled={statsLoading || passesLoading}
          style={styles.refreshButton}
        >
          {statsLoading || passesLoading
            ? "Loading..."
            : "↻ Refresh"}
        </button>
      </header>

      {statsError && (
        <div role="alert" style={styles.error}>
          {statsError}
        </div>
      )}

      {/* Statistics cards */}
      {statsLoading ? (
        <p style={styles.loading}>
          Loading dashboard statistics...
        </p>
      ) : (
        <section
          style={styles.grid}
          aria-label="Dashboard statistics"
        >
          {cards.map((card) => (
            <article
              key={card.title}
              style={{
                ...styles.card,
                borderTop: `4px solid ${card.color}`,
              }}
            >
              <div style={styles.cardTop}>
                <span style={styles.cardTitle}>
                  {card.title}
                </span>
                <span aria-hidden="true" style={styles.icon}>
                  {card.icon}
                </span>
              </div>

              <p style={styles.value}>{card.value}</p>
              <p style={styles.cardFooter}>Current total</p>
            </article>
          ))}
        </section>
      )}

      {/* Search and filter section */}
      <section style={styles.passSection}>
        <h2 style={styles.sectionHeading}>Visitor Passes</h2>

        <div style={styles.filters}>
          <input
            type="search"
            value={search}
            placeholder="Search visitor, email, phone..."
            aria-label="Search visitor passes"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={styles.input}
          />

          <select
            value={status}
            aria-label="Filter by status"
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            style={styles.input}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>

          <div style={styles.dateField}>
            <label htmlFor="fromDate">Issue date from</label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              style={styles.input}
            />
          </div>

          <div style={styles.dateField}>
            <label htmlFor="toDate">Issue date to</label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              style={styles.input}
            />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            style={styles.resetButton}
          >
            Reset Filters
          </button>
        </div>

        {passesError && (
          <div role="alert" style={styles.error}>
            {passesError}
            <button
              type="button"
              onClick={loadPasses}
              style={styles.retryButton}
            >
              Retry
            </button>
          </div>
        )}

        {/* Results table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Visitor</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Pass Number</th>
                <th style={styles.th}>Issue Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {passesLoading ? (
                <tr>
                  <td colSpan={7} style={styles.emptyCell}>
                    Loading visitor passes...
                  </td>
                </tr>
              ) : passesError ? (
                <tr>
                  <td colSpan={7} style={styles.emptyCell}>
                    Unable to display results.
                  </td>
                </tr>
              ) : passes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={styles.emptyCell}>
                    No visitor passes found.
                  </td>
                </tr>
              ) : (
                passes.map((pass) => (
                  <tr key={pass._id}>
                    <td style={styles.td}>
                      {pass.visitorName || "-"}
                    </td>
                    <td style={styles.td}>
                      {pass.email || "-"}
                    </td>
                    <td style={styles.td}>
                      {pass.phone || "-"}
                    </td>
                    <td style={styles.td}>
                      {pass.company || "-"}
                    </td>
                    <td style={styles.td}>
                      {pass.passNumber || "-"}
                    </td>
                    <td style={styles.td}>
                      {pass.issueDate
                        ? new Date(
                            pass.issueDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.status,
                          ...(pass.status === "active"
                            ? styles.activeStatus
                            : pass.status === "expired"
                            ? styles.expiredStatus
                            : pass.status === "revoked"
                            ? styles.revokedStatus
                            : {}),
                        }}
                      >
                        {pass.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={styles.pagination}>
          <span style={styles.recordCount}>
            Total records: {totalRecords}
          </span>

          <div style={styles.paginationControls}>
            <button
              type="button"
              disabled={page <= 1 || passesLoading}
              onClick={() => setPage((p) => p - 1)}
              style={styles.pageButton}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || passesLoading}
              onClick={() => setPage((p) => p + 1)}
              style={styles.pageButton}
            >
              Next
            </button>
          </div>
        </div>
      </section>
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
    background: "#fff",
    color: "#1d4ed8",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
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
  passSection: {
    marginTop: 36,
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 3px 12px rgba(15, 23, 42, 0.04)",
  },
  sectionHeading: {
    margin: "0 0 20px",
    color: "#172033",
    fontSize: 23,
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
    alignItems: "end",
    gap: 14,
    marginBottom: 20,
  },
  dateField: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    color: "#475467",
    fontSize: 13,
  },
  input: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: "10px 12px",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    color: "#172033",
    fontSize: 14,
  },
  resetButton: {
    padding: "11px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    fontSize: 14,
  },
  th: {
    padding: 12,
    textAlign: "left",
    background: "#f8fafc",
    color: "#475467",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: 12,
    color: "#344054",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  emptyCell: {
    padding: 24,
    textAlign: "center",
    color: "#667085",
  },
  pagination: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 20,
  },
  paginationControls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  recordCount: {
    color: "#667085",
    fontSize: 14,
  },
  pageButton: {
    padding: "8px 12px",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: 7,
    cursor: "pointer",
  },
  status: {
    display: "inline-block",
    padding: "4px 9px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: "#f1f5f9",
    color: "#334155",
  },
  activeStatus: {
    background: "#dcfce7",
    color: "#166534",
  },
  expiredStatus: {
    background: "#fef3c7",
    color: "#92400e",
  },
  revokedStatus: {
    background: "#fee2e2",
    color: "#991b1b",
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
  retryButton: {
    marginLeft: 12,
    padding: "5px 10px",
    border: "1px solid #fecaca",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
  },
};

export default Dashboard;
