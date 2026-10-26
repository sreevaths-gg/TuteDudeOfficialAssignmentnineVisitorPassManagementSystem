
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load registered visitors.
 
const loadVisitors = async () => {
  try {
    setLoading(true);
    setError("");
    setMessage("");

    const user = JSON.parse(localStorage.getItem("user"));
    let response;

    if (user?.role?.toLowerCase() === "visitor") {
      response = await api.get("/visitors/me");
    } else {
      response = await api.get("/visitors");
    }

    const data = response.data;

    let list = [];

    if (user?.role?.toLowerCase() === "visitor") {
      // API returns { visitor: { ...details } }
      list = data.visitor ? [data.visitor] : [];
    } else if (Array.isArray(data)) {
      list = data;
    } else if (Array.isArray(data.visitors)) {
      list = data.visitors;
    } else if (Array.isArray(data.data)) {
      list = data.data;
    }

    setVisitors(list);
  } catch (err) {
    console.error("Load visitors error:", err);

    setError(
      err.response?.data?.message ||
        "Unable to load visitors. Check your login and backend API."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadVisitors();
}, []);


  // Download visitors as CSV.
  const downloadVisitorsCSV = async () => {
    try {
      setCsvLoading(true);
      setError("");
      setMessage("");

       const user = JSON.parse(localStorage.getItem("user"));
    let response;

    if (user?.role?.toLowerCase() === "visitor") {console.log("dycsg");
      // Download only the logged-in visitor's details.
      response = await api.get("/reports/visitor/me", {
        responseType: "blob",
      });
      console.log(response);
    } else {
      // Download all visitors for other roles.
      response = await api.get("/reports/visitors", {
        responseType: "blob",
      });
    }


      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "visitors.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("Visitors CSV downloaded successfully.");
    } catch (err) {
      console.error("CSV download error:", err);
  console.error("Response status:", err.response?.status);
  console.error("Response data:", err.response?.data);
      setError(
        "Unable to download visitors CSV. Check your login and backend report route."
      );
    } finally {
      setCsvLoading(false);
    }
  };

  // Build a photo URL from a saved photo path or URL.
  const getPhotoUrl = (visitor) => {
    const photo =
      visitor.photo ||
      visitor.photoPath ||
      visitor.photoUrl;

    if (!photo || typeof photo !== "string") {
      return "";
    }

    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://")
    ) {
      return photo;
    }

    const normalizedPath = photo.replace(/\\/g, "/");

    // If the stored path already includes "uploads/".
    if (normalizedPath.includes("uploads/")) {
      const uploadPath = normalizedPath.substring(
        normalizedPath.indexOf("uploads/")
      );

      return `http://localhost:5000/${uploadPath}`;
    }

    const filename = normalizedPath.split("/").pop();

    return filename
      ? `http://localhost:5000/uploads/visitors/${filename}`
      : "";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "-"
      : parsedDate.toLocaleDateString();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Visitors</h2>

            <p style={styles.subtitle}>
              View registered visitor details and photos.
            </p>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={loadVisitors}
              disabled={loading}
              style={styles.refreshButton}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={downloadVisitorsCSV}
              disabled={csvLoading}
              style={styles.csvButton}
            >
              {csvLoading
                ? "Downloading..."
                : "Download Visitors CSV"}
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

        {loading && visitors.length === 0 ? (
          <p style={styles.subtitle}>Loading visitors...</p>
        ) : visitors.length === 0 ? (
          <p style={styles.empty}>
            No visitors registered yet.
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Photo</th>
                  <th style={styles.th}>Visitor ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Company</th>
                   <th style={styles.th}>Role</th>
                  <th style={styles.th}>Registered On</th>
                </tr>
              </thead>

              <tbody>
                {visitors.map((visitor, index) => {
                  const id =
                    visitor.visitorId ||
                    visitor._id ||
                    visitor.id ||
                    "";

                  const photoUrl = getPhotoUrl(visitor);

                  return (
                    <tr key={id || index}>
                      <td style={styles.td}>
                        <div style={styles.photoContainer}>
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={`${visitor.fullName || "Visitor"} photo`}
                              style={styles.photo}
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";

                                const placeholder =
                                  event.currentTarget
                                    .nextElementSibling;

                                if (placeholder) {
                                  placeholder.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}

                          <div
                            style={{
                              ...styles.photoPlaceholder,
                              display: photoUrl ? "none" : "flex",
                            }}
                          >
                            No Photo
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>
                        {id || "-"}
                      </td>

                      <td style={styles.td}>
                        {visitor.fullName || "-"}
                      </td>

                      <td style={styles.td}>
                        {visitor.email || "-"}
                      </td>

                      <td style={styles.td}>
                        {visitor.phone || "-"}
                      </td>

                      <td style={styles.td}>
                        {visitor.company || "-"}
                      </td>

                      <td style={styles.td}>
                        {visitor.role || "-"}
                      </td>
                      <td style={styles.td}>
                        {formatDate(visitor.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && visitors.length > 0 && (
          <p style={styles.count}>
            Total visitors: {visitors.length}
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

  refreshButton: {
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
    minWidth: 950,
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
    verticalAlign: "middle",
    overflowWrap: "anywhere",
  },

  photoContainer: {
    width: 64,
    height: 64,
  },

  photo: {
    width: 64,
    height: 64,
    objectFit: "cover",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    display: "block",
  },

  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    background: "#eef2f7",
    color: "#667085",
    fontSize: 11,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    boxSizing: "border-box",
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
    overflowWrap: "anywhere",
  },

  success: {
    color: "#16834a",
    background: "#f0fdf4",
    padding: 12,
    borderRadius: 6,
  },
};


//export default Visitors;