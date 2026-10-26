
import { useEffect, useState } from "react";
import api from "../services/api";

const getId = (value) => {
  if (value && typeof value === "object") {
    return value._id || value.id || value.appointmentId || "";
  }

  return value || "";
};

export default function Passes() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

const loadPasses = async () => {
  console.log("loadPasses started");

  try {
    setLoading(true);
    setError("");
    setMessage("");

    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    let response;

    if (user?.role?.toLowerCase() === "visitor") {
      response = await api.get("/passes/me");

      const pass = response.data?.pass;
      const list = pass ? [pass] : [];

      setPasses(list);
      console.log("Visitor passes:", list);

      return; // Prevents overwriting the visitor's pass
    }

    // Admin, security, and employee
    response = await api.get("/passes");

    const data = response.data;

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.passes)
      ? data.passes
      : Array.isArray(data?.data)
      ? data.data
      : [];

    setPasses(list);
    console.log("All passes:", list);

  } catch (err) {
    console.error(
      "Load passes error:",
      err.response?.data || err.message
    );

    setPasses([]);

    setError(
      err.response?.data?.message ||
        "Unable to load passes. Check your login and backend API."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadPasses();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "-"
      : parsedDate.toLocaleDateString();
  };

  const downloadCSV = async () => {
    try {
      setCsvLoading(true);
      setError("");
      setMessage("");

          const user = JSON.parse(localStorage.getItem("user"));
    let response;

    if (user?.role?.toLowerCase() === "visitor") {
      // Download only the logged-in visitor's details.
      response = await api.get("/reports/pass/me", {
        responseType: "blob",
      });
      
    } else {
      // Download all visitors for other roles.
      response = await api.get("/reports/passes", {
        responseType: "blob",
      });
    }

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "passes.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("Passes CSV downloaded successfully.");
    } catch (err) {
      setError(
        "Unable to download passes CSV. Check your login and /api/reports/passes route."
      );
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Visitor Passes</h2>
            <p style={styles.subtitle}>
              View generated passes and their appointment details.
            </p>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={loadPasses}
              disabled={loading}
              style={styles.secondaryButton}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={downloadCSV}
              disabled={csvLoading}
              style={styles.csvButton}
            >
              {csvLoading ? "Downloading..." : "Download Passes CSV"}
            </button>
          </div>
        </div>

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

        {loading && passes.length === 0 ? (
          <p style={styles.subtitle}>Loading passes...</p>
        ) : passes.length === 0 ? (
          <p style={styles.empty}>No visitor passes found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Visitor Name</th>
                  <th style={styles.th}>Appointment ID</th>
                  <th style={styles.th}>Pass Number</th>
                  <th style={styles.th}>Issue Date</th>
                  <th style={styles.th}>Expiry Date</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {passes.map((pass, index) => {
                  const id = pass._id || pass.passId || index;

                  const appointmentId =
                    getId(pass.appointmentId) || "-";

                  const visitorName =
                    pass.visitorName ||
                    pass.visitorId?.fullName ||
                    pass.visitorId?.name ||
                    pass.visitor?.fullName ||
                    "-";

                  const status = pass.status || "active";

                  const isActive =
                    String(status).toLowerCase() === "active";

                  return (
                    <tr key={id}>
                      <td style={styles.td}>{index + 1}</td>

                      <td style={styles.td}>{visitorName}</td>

                      <td style={styles.td}>{appointmentId}</td>

                      <td style={styles.td}>
                        {pass.passNumber || "-"}
                      </td>

                      <td style={styles.td}>
                        {formatDate(pass.issueDate)}
                      </td>

                      <td style={styles.td}>
                        {formatDate(pass.expiryDate)}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.status,
                            ...(isActive
                              ? styles.activeStatus
                              : styles.otherStatus),
                          }}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && passes.length > 0 && (
          <p style={styles.count}>
            Total passes: {passes.length}
          </p>
        )}
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
    fontFamily: "Arial, sans-serif",
    color: "#1f2937",
  },
  card: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 28,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 26,
  },
  subtitle: {
    color: "#667085",
    fontSize: 14,
    marginTop: 8,
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  secondaryButton: {
    padding: "11px 16px",
    background: "#eef4ff",
    color: "#174ea6",
    border: "1px solid #d5e3ff",
    borderRadius: 6,
    cursor: "pointer",
  },
  csvButton: {
    padding: "11px 16px",
    background: "#16834a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    marginTop: 20,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
  },
  table: {
    width: "100%",
    minWidth: 850,
    borderCollapse: "collapse",
    background: "#fff",
    textAlign: "left",
  },
  th: {
    padding: 14,
    background: "#f3f6fb",
    borderBottom: "1px solid #dfe3e8",
    whiteSpace: "nowrap",
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    overflowWrap: "anywhere",
    verticalAlign: "middle",
  },
  status: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 12,
    fontSize: 13,
    textTransform: "capitalize",
  },
  activeStatus: {
    background: "#dcfce7",
    color: "#166534",
  },
  otherStatus: {
    background: "#f3f4f6",
    color: "#374151",
  },
  empty: {
    padding: 24,
    textAlign: "center",
    background: "#f9fafb",
    borderRadius: 8,
    color: "#667085",
  },
  count: {
    marginTop: 16,
    color: "#667085",
  },
  error: {
    color: "#c62828",
    background: "#fff1f0",
    padding: 12,
    borderRadius: 6,
  },
  success: {
    color: "#16834a",
    background: "#f0fdf4",
    padding: 12,
    borderRadius: 6,
  },
};
