
import { useEffect, useState } from "react";
import api from "../services/api";

const getId = (value) => {
  if (value && typeof value === "object") {
    return value._id || value.id || value.checkLogId || "";
  }

  return value || "";
};

const getLogId = (log) =>
  getId(log?.checkLogId || log?._id || log?.id);

const getVisitorName = (log) =>
  log?.visitorName ||
  log?.visitorId?.fullName ||
  log?.visitorId?.name ||
  log?.visitor?.fullName ||
  log?.visitor?.name ||
  log?.passId?.visitorName ||
  "Unknown Visitor";

const getVisitorId = (log) =>
  getId(log?.visitorId || log?.visitor?._id || log?.visitor);

const getPassNumber = (log) =>
  log?.passId?.passNumber ||
  log?.passNumber ||
  log?.pass?.passNumber ||
  "N/A";

const getCheckInTime = (log) => {
  const time = log?.checkInTime || log?.checkIn;

  if (!time) return "N/A";

  const date = new Date(time);

  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleString();
};

const isStillInside = (log) => {
  const status = String(log?.status || "").toLowerCase();

  return (
    !log?.checkOutTime &&
    !log?.checkOut &&
    !["checked-out", "checkedout", "completed"].includes(status)
  );
};

export default function Checkout() {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadLogs = async () => {
    setLoadingLogs(true);
    setError("");

    try {
      const response = await api.get("/checklogs");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.checklogs)
        ? data.checklogs
        : Array.isArray(data?.logs)
        ? data.logs
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setLogs(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load check-in logs. Check your login and backend."
      );
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const activeLogs = logs.filter(isStillInside);

  const handleCheckout = async (logId) => {
    if (!logId) {
      setError("Check log ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to check out this visitor?"
    );

    if (!confirmed) return;

    setLoading(true);
    setSelectedLog(logId);
    setMessage("");
    setError("");

    try {
      const response = await api.put(`/checkout/${logId}`);

      setMessage(
        response.data?.message ||
          "Visitor checked out successfully."
      );

      await loadLogs();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Checkout failed. Please check the backend checkout API."
      );
    } finally {
      setLoading(false);
      setSelectedLog("");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Visitor Check-Out</h2>

        <p style={styles.subtitle}>
          View visitors who are currently inside and check them out when
          they leave.
        </p>

        {error && (
          <p role="alert" style={styles.error}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={styles.success}>
            {message}
          </p>
        )}

        <div style={styles.summary}>
          <span style={styles.summaryLabel}>
            Visitors Currently Inside
          </span>

          <strong style={styles.summaryCount}>
            {activeLogs.length}
          </strong>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          disabled={loadingLogs || loading}
          style={styles.refreshButton}
        >
          {loadingLogs ? "Refreshing..." : "Refresh Check-In Logs"}
        </button>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Visitor</th>
                <th style={styles.th}>Visitor ID</th>
                <th style={styles.th}>Pass Number</th>
                <th style={styles.th}>Check-In Time</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {activeLogs.map((log, index) => {
                const logId = getLogId(log);

                return (
                  <tr key={logId || `log-${index}`}>
                    <td style={styles.td}>
                      {getVisitorName(log)}
                    </td>

                    <td style={styles.td}>
                      {getVisitorId(log) || "N/A"}
                    </td>

                    <td style={styles.td}>
                      {getPassNumber(log)}
                    </td>

                    <td style={styles.td}>
                      {getCheckInTime(log)}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.status}>
                        Checked In
                      </span>
                    </td>

                    <td style={styles.td}>
                      <button
                        type="button"
                        disabled={
                          loading ||
                          loadingLogs ||
                          !logId
                        }
                        onClick={() => handleCheckout(logId)}
                        style={{
                          ...styles.checkoutButton,
                          opacity:
                            loading || loadingLogs || !logId
                              ? 0.6
                              : 1,
                          cursor:
                            loading || loadingLogs || !logId
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {loading && selectedLog === logId
                          ? "Checking Out..."
                          : "Check Out"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {activeLogs.length === 0 && (
                <tr>
                  <td colSpan={6} style={styles.emptyCell}>
                    {loadingLogs
                      ? "Loading check-in records..."
                      : "No visitors are currently checked in."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "30px 16px",
    background: "#f3f6fb",
    minHeight: "100vh",
  },

  card: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 28,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },

  heading: {
    marginTop: 0,
    marginBottom: 8,
    color: "#1f2937",
  },

  subtitle: {
    color: "#667085",
    fontSize: 14,
    lineHeight: 1.6,
  },

  summary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 22,
    marginBottom: 16,
    padding: 16,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
  },

  summaryLabel: {
    color: "#475467",
    fontWeight: 600,
  },

  summaryCount: {
    fontSize: 24,
    color: "#1565c0",
  },

  refreshButton: {
    padding: "11px 16px",
    marginBottom: 20,
    background: "#1565c0",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 800,
  },

  th: {
    padding: 12,
    textAlign: "left",
    background: "#f8fafc",
    color: "#344054",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    color: "#344054",
    fontSize: 13,
    overflowWrap: "anywhere",
  },

  status: {
    display: "inline-block",
    padding: "5px 9px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  checkoutButton: {
    padding: "9px 12px",
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    whiteSpace: "nowrap",
  },

  emptyCell: {
    padding: 24,
    textAlign: "center",
    color: "#667085",
  },

  success: {
    padding: 12,
    background: "#ecfdf3",
    color: "#16834a",
    borderRadius: 6,
    overflowWrap: "anywhere",
  },

  error: {
    padding: 12,
    background: "#fef2f2",
    color: "#c62828",
    borderRadius: 6,
    overflowWrap: "anywhere",
  },
};
