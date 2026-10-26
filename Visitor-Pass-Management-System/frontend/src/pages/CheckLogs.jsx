
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const getId = (value) => {
  if (value && typeof value === "object") {
    return value._id || value.id || value.visitorId || value.passId || "";
  }

  return value ? String(value) : "";
};

const getVisitorName = (log) =>
  log?.visitorName ||
  log?.visitorId?.fullName ||
  log?.visitorId?.name ||
  log?.visitor?.fullName ||
  log?.visitor?.name ||
  "Unknown Visitor";

const getVisitorEmail = (log) =>
  log?.visitorEmail ||
  log?.visitorId?.email ||
  log?.visitor?.email ||
  "—";

const getVisitorPhone = (log) =>
  log?.visitorPhone ||
  log?.visitorId?.phone ||
  log?.visitor?.phone ||
  "—";

const getCompany = (log) =>
  log?.company ||
  log?.visitorId?.company ||
  log?.visitor?.company ||
  "—";

const getAppointmentId = (log) =>
  getId(log?.appointmentId || log?.appointment?._id || log?.appointment);

const getPassId = (log) =>
  getId(log?.passId || log?.pass?._id || log?.pass);

const getSecurityOfficer = (log) => {
  const officer =
    log?.securityOfficerName ||
    log?.securityOfficer?.fullName ||
    log?.securityOfficer?.name ||
    log?.securityOfficer;

  return typeof officer === "object" ? getId(officer) || "—" : officer || "—";
};

const getCheckLogId = (log) =>
  log?.checkLogId || log?._id || log?.id || "";

const getStatus = (log) =>
  log?.checkOutTime || log?.checkOutAt ? "checked-out" : "checked-in";

export default function CheckLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCheckLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/checklogs");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.logs)
        ? data.logs
        : Array.isArray(data?.checkLogs)
        ? data.checkLogs
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setLogs(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load check logs. Please check your login and backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckLogs();
  }, []);

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString();
  };

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const status = getStatus(log);

      const matchesStatus =
        statusFilter === "all" || statusFilter === status;

      const searchableValues = [
        getId(log.visitorId),
        getVisitorName(log),
        getVisitorEmail(log),
        getVisitorPhone(log),
        getCompany(log),
        getPassId(log),
        log.passNumber,
        getAppointmentId(log),
        getSecurityOfficer(log),
        getCheckLogId(log),
      ];

      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      return matchesStatus && matchesSearch;
    });
  }, [logs, search, statusFilter]);

  const checkedInCount = logs.filter(
    (log) => getStatus(log) === "checked-in"
  ).length;

  const checkedOutCount = logs.filter(
    (log) => getStatus(log) === "checked-out"
  ).length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.heading}>Visitor Check Logs</h2>
            <p style={styles.subtitle}>
              View and search visitor check-in and check-out records.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCheckLogs}
            disabled={loading}
            style={{
              ...styles.primaryButton,
              ...styles.refreshButton,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {loading ? "Loading..." : "Refresh Logs"}
          </button>
        </div>

        {error && (
          <div role="alert" style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Records</p>
            <h2 style={styles.statNumber}>{logs.length}</h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Currently Checked In</p>
            <h2 style={{ ...styles.statNumber, color: "#16834a" }}>
              {checkedInCount}
            </h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Checked Out</p>
            <h2 style={{ ...styles.statNumber, color: "#1565c0" }}>
              {checkedOutCount}
            </h2>
          </div>
        </div>

        <div style={styles.panel}>
          <h3 style={styles.sectionHeading}>Search Check Logs</h3>

          <div style={styles.filters}>
            <input
              type="text"
              placeholder="Search visitor, phone, email, pass or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={styles.input}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={styles.select}
            >
              <option value="all">All Records</option>
              <option value="checked-in">Currently Checked In</option>
              <option value="checked-out">Checked Out</option>
            </select>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.tableHeader}>
            <h3 style={styles.sectionHeading}>Check Log Records</h3>
            <span style={styles.recordCount}>
              {filteredLogs.length} of {logs.length} records
            </span>
          </div>

          {loading ? (
            <p style={styles.infoMessage}>Loading check logs...</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Visitor ID</th>
                    <th style={styles.th}>Visitor Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Company</th>
                    <th style={styles.th}>Appointment ID</th>
                    <th style={styles.th}>Pass Number / ID</th>
                    <th style={styles.th}>Security Officer</th>
                    <th style={styles.th}>Check-In Time</th>
                    <th style={styles.th}>Check-Out Time</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={styles.emptyCell}>
                        {error
                          ? "Check logs could not be loaded."
                          : "No matching check-in/check-out records found."}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => {
                      const checkedOut = getStatus(log) === "checked-out";

                      return (
                        <tr
                          key={getCheckLogId(log) || `check-log-${index}`}
                        >
                          <td style={styles.td}>{index + 1}</td>
                          <td style={styles.td}>
                            {getId(log.visitorId || log.visitor?._id) || "—"}
                          </td>
                          <td style={styles.td}>{getVisitorName(log)}</td>
                          <td style={styles.td}>{getVisitorEmail(log)}</td>
                          <td style={styles.td}>{getVisitorPhone(log)}</td>
                          <td style={styles.td}>{getCompany(log)}</td>
                          <td style={styles.td}>
                            {getAppointmentId(log) || "—"}
                          </td>
                          <td style={styles.td}>
                            {log.passNumber || getPassId(log) || "—"}
                          </td>
                          <td style={styles.td}>
                            {getSecurityOfficer(log)}
                          </td>
                          <td style={styles.td}>
                            {formatDateTime(
                              log.checkInTime || log.checkInAt
                            )}
                          </td>
                          <td style={styles.td}>
                            {formatDateTime(
                              log.checkOutTime || log.checkOutAt
                            )}
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(checkedOut
                                  ? styles.checkedOutBadge
                                  : styles.checkedInBadge),
                              }}
                            >
                              {checkedOut ? "Checked Out" : "Checked In"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          <p style={styles.footerNote}>
            Status is determined by whether a check-out time has been recorded.
          </p>
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
    boxSizing: "border-box",
    color: "#111827",
  },
  container: {
    maxWidth: 1400,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  heading: {
    margin: "0 0 8px",
    fontSize: 26,
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    color: "#667085",
    fontSize: 14,
    lineHeight: 1.6,
  },
  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 22,
  },
  statCard: {
    flex: "1 1 180px",
    minWidth: 0,
    padding: 20,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  statLabel: {
    margin: "0 0 10px",
    color: "#667085",
    fontSize: 14,
  },
  statNumber: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
  },
  panel: {
    background: "#ffffff",
    padding: 24,
    marginBottom: 22,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
    minWidth: 0,
  },
  sectionHeading: {
    margin: 0,
    fontSize: 18,
    fontWeight: 650,
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
  },
  input: {
    flex: "1 1 280px",
    minWidth: 0,
    padding: 12,
    border: "1px solid #ccd3df",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
    outlineColor: "#1565c0",
  },
  select: {
    flex: "0 1 230px",
    minWidth: 180,
    padding: 12,
    border: "1px solid #ccd3df",
    borderRadius: 6,
    fontSize: 14,
    background: "#ffffff",
    boxSizing: "border-box",
  },
  primaryButton: {
    padding: "11px 16px",
    background: "#1565c0",
    color: "#ffffff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  refreshButton: {
    marginTop: 0,
    whiteSpace: "nowrap",
  },
  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  error: {
    padding: 12,
    marginBottom: 18,
    background: "#fef2f2",
    color: "#b91c1c",
    borderRadius: 6,
    fontSize: 14,
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  recordCount: {
    color: "#667085",
    fontSize: 13,
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
  },
  table: {
    width: "100%",
    minWidth: 1200,
    borderCollapse: "collapse",
    background: "#ffffff",
  },
  th: {
    padding: 12,
    textAlign: "left",
    whiteSpace: "nowrap",
    background: "#f8fafc",
    color: "#344054",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 12,
    fontWeight: 700,
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    fontSize: 13,
    verticalAlign: "top",
    overflowWrap: "anywhere",
    color: "#344054",
  },
  emptyCell: {
    padding: 28,
    textAlign: "center",
    color: "#667085",
    fontSize: 14,
  },
  statusBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  checkedInBadge: {
    background: "#dcfce7",
    color: "#166534",
  },
  checkedOutBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  infoMessage: {
    padding: 18,
    color: "#667085",
    textAlign: "center",
  },
  footerNote: {
    color: "#667085",
    fontSize: 13,
    margin: "14px 0 0",
  },
};
