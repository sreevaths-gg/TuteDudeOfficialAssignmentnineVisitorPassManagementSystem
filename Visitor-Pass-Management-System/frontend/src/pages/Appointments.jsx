
import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

const emptyForm = {
  visitorId: "",
  visitorName: "",
  hostName: "",
  purpose: "",
  visitDate: "",
};

const getId = (value) => {
  if (value && typeof value === "object") {
    return value._id || value.id || value.visitorId || "";
  }
  return value || "";
};

const getAppointmentId = (appointment) =>
  appointment?.appointmentId ||
  appointment?._id ||
  appointment?.id ||
  "";

const getVisitorId = (visitor) =>
  getId(visitor?.visitorId || visitor?._id || visitor?.id);

const getAppointmentVisitorName = (appointment) =>
  appointment?.visitorName ||
  appointment?.visitorId?.fullName ||
  appointment?.visitorId?.name ||
  appointment?.visitor?.fullName ||
  appointment?.visitor?.name ||
  "Unknown Visitor";

const normalizeList = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getStoredUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user && typeof user === "object" ? user : {};
  } catch {
    return {};
  }
};

export default function Appointments() {
  const [user] = useState(getStoredUser);
  const role = String(user.role || "").toLowerCase();

  const isVisitor = role === "visitor";
  const canCreateAppointment = ["admin", "employee", "visitor"].includes(role);
  const canManageStatus = ["admin", "security"].includes(role);

  const [appointments, setAppointments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(false);
  const [visitorsLoading, setVisitorsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/appointments");
      setAppointments(
        normalizeList(response.data, "appointments")
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVisitors = useCallback(async () => {
    if (!["admin", "employee", "visitor"].includes(role)) {
      setVisitors([]);
      return;
    }

    setVisitorsLoading(true);

    try {
      if (isVisitor) {
        // This endpoint must return only the logged-in visitor's profile.
        const response = await api.get("/visitors/me");
        const data = response.data;

        const ownVisitor =
          data?.visitor ||
          data?.data?.visitor ||
          data?.data ||
          (data?._id ? data : null);

        const list = ownVisitor ? [ownVisitor] : [];
        setVisitors(list);

        if (list.length > 0) {
          setForm((previous) => ({
            ...previous,
            visitorId: getVisitorId(list[0]),
            visitorName:
              list[0].fullName || list[0].name || "",
          }));
        }
      } else {
        const response = await api.get("/visitors");
        setVisitors(normalizeList(response.data, "visitors"));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load the permitted visitor records."
      );
    } finally {
      setVisitorsLoading(false);
    }
  }, [role, isVisitor]);

  useEffect(() => {
    fetchAppointments();
    fetchVisitors();
  }, [fetchAppointments, fetchVisitors]);

  const handleVisitorChange = (event) => {
    const selectedId = event.target.value;

    const visitor = visitors.find(
      (item) => String(getVisitorId(item)) === String(selectedId)
    );

    setForm((previous) => ({
      ...previous,
      visitorId: selectedId,
      visitorName: visitor
        ? visitor.fullName || visitor.name || ""
        : "",
    }));

    setError("");
    setSuccess("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.visitorId) {
      setError("Please select a visitor.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...form,
        // Backend must independently enforce ownership.
        ...(isVisitor ? { visitorId: form.visitorId } : {}),
      };

      await api.post("/appointments", payload);

      setForm((previous) => ({
        ...emptyForm,
        ...(isVisitor
          ? {
              visitorId: previous.visitorId,
              visitorName: previous.visitorName,
            }
          : {}),
      }));

      setSuccess("Appointment created successfully.");
      await fetchAppointments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create appointment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (appointmentId, action) => {
    setError("");
    setSuccess("");

    if (!appointmentId) {
      setError("Appointment ID is missing.");
      return;
    }

    try {
      setUpdatingId(appointmentId);

      const response = await api.put(
        `/appointments/${appointmentId}/${action}`
      );

      setSuccess(
        response.data?.message ||
          `Appointment ${action === "approve" ? "approved" : "rejected"}.`
      );

      await fetchAppointments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Unable to ${action} appointment.`
      );
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Manage Appointments</h2>

        <p style={styles.subtitle}>
          {isVisitor
            ? "Create appointments and view your own visit requests."
            : "Create and manage visitor appointments according to your role."}
        </p>

        {error && <p role="alert" style={styles.error}>{error}</p>}
        {success && <p role="status" style={styles.success}>{success}</p>}

        {canCreateAppointment && (
          <section>
            <h3 style={styles.sectionHeading}>Create Appointment</h3>

            <form onSubmit={handleSubmit}>
              <label htmlFor="visitorId" style={styles.label}>
                {isVisitor ? "Your Visitor Profile" : "Select Visitor"}
              </label>

              <select
                id="visitorId"
                name="visitorId"
                value={form.visitorId}
                onChange={handleVisitorChange}
                required
                disabled={visitorsLoading || submitting || isVisitor}
                style={styles.input}
              >
                <option value="">
                  {visitorsLoading
                    ? "Loading visitors..."
                    : "-- Select a visitor --"}
                </option>

                {visitors.map((visitor, index) => {
                  const id = getVisitorId(visitor);
                  const name =
                    visitor.fullName || visitor.name || "Unnamed Visitor";

                  return (
                    <option
                      key={id || `visitor-${index}`}
                      value={id}
                      disabled={!id}
                    >
                      {name}
                      {visitor.email ? ` (${visitor.email})` : ""}
                    </option>
                  );
                })}
              </select>

              {form.visitorName && (
                <div style={styles.selectedVisitor}>
                  <strong>Selected visitor:</strong> {form.visitorName}
                </div>
              )}

              <label htmlFor="hostName" style={styles.label}>
                Host Name
              </label>
              <input
                id="hostName"
                name="hostName"
                value={form.hostName}
                onChange={handleChange}
                placeholder="Enter host name"
                required
                style={styles.input}
              />

              <label htmlFor="purpose" style={styles.label}>
                Purpose of Visit
              </label>
              <input
                id="purpose"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="Enter purpose of visit"
                required
                style={styles.input}
              />

              <label htmlFor="visitDate" style={styles.label}>
                Visit Date
              </label>
              <input
                id="visitDate"
                name="visitDate"
                type="date"
                min={new Date().toLocaleDateString("en-CA")}
                value={form.visitDate}
                onChange={handleChange}
                required
                style={styles.input}
              />

              <button
                type="submit"
                disabled={
                  submitting ||
                  visitorsLoading ||
                  visitors.length === 0
                }
                style={{
                  ...styles.primaryButton,
                  ...((submitting ||
                    visitorsLoading ||
                    visitors.length === 0) &&
                    styles.disabledButton),
                }}
              >
                {submitting ? "Creating..." : "Create Appointment"}
              </button>

              {!visitorsLoading && visitors.length === 0 && (
                <p style={styles.subtitle}>
                  {isVisitor
                    ? "Your visitor profile was not found. Contact the administrator."
                    : "No permitted visitor records were found."}
                </p>
              )}
            </form>
          </section>
        )}

        <div style={styles.divider} />

        <section>
          <div style={styles.listHeader}>
            <div>
              <h3 style={styles.sectionHeading}>
                {isVisitor ? "My Appointments" : "Appointments List"}
              </h3>
              <p style={styles.subtitle}>
                Total appointments: {appointments.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                fetchAppointments();
              }}
              disabled={loading}
              style={styles.secondaryButton}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading && <p style={styles.subtitle}>Loading appointments...</p>}

          {!loading && appointments.length === 0 && (
            <div style={styles.emptyState}>
              No appointments found.
            </div>
          )}

          {appointments.length > 0 && (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Appointment ID</th>
                    <th style={styles.th}>Visitor</th>
                    <th style={styles.th}>Host</th>
                    <th style={styles.th}>Purpose</th>
                    <th style={styles.th}>Visit Date</th>
                    <th style={styles.th}>Status</th>
                    {canManageStatus && (
                      <th style={styles.th}>Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment, index) => {
                    const id = getAppointmentId(appointment);
                    const status = String(
                      appointment.status || "pending"
                    ).toLowerCase();

                    const isUpdating = String(updatingId) === String(id);

                    return (
                      <tr key={id || `appointment-${index}`}>
                        <td style={styles.td}>{id || "-"}</td>
                        <td style={styles.td}>
                          {getAppointmentVisitorName(appointment)}
                        </td>
                        <td style={styles.td}>
                          {appointment.hostName || "-"}
                        </td>
                        <td style={styles.td}>
                          {appointment.purpose || "-"}
                        </td>
                        <td style={styles.td}>
                          {appointment.visitDate
                            ? new Date(appointment.visitDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(status === "approved"
                                ? styles.approved
                                : status === "rejected"
                                ? styles.rejected
                                : styles.pending),
                            }}
                          >
                            {status}
                          </span>
                        </td>

                        {canManageStatus && (
                          <td style={styles.td}>
                            <div style={styles.actionButtons}>
                              <button
                                type="button"
                                disabled={!id || status !== "pending" || isUpdating}
                                onClick={() => updateStatus(id, "approve")}
                                style={styles.approveButton}
                              >
                                {isUpdating ? "Updating..." : "Approve"}
                              </button>

                              <button
                                type="button"
                                disabled={!id || status !== "pending" || isUpdating}
                                onClick={() => updateStatus(id, "reject")}
                                style={styles.rejectButton}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const styles = {
  page: {
    padding: "30px 16px",
    background: "#f3f6fb",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  card: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 28,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },
  heading: { marginTop: 0, marginBottom: 8, color: "#1d2939" },
  sectionHeading: { marginTop: 0, marginBottom: 8, color: "#1d2939" },
  subtitle: { color: "#667085", fontSize: 14, lineHeight: 1.5 },
  label: {
    display: "block",
    marginTop: 18,
    marginBottom: 8,
    fontWeight: 600,
    color: "#344054",
  },
  input: {
    display: "block",
    width: "100%",
    padding: 12,
    border: "1px solid #ccd3df",
    borderRadius: 6,
    boxSizing: "border-box",
    background: "#fff",
    fontSize: 14,
  },
  selectedVisitor: {
    marginTop: 10,
    padding: 12,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    color: "#475467",
    overflowWrap: "anywhere",
  },
  primaryButton: {
    display: "inline-block",
    padding: "11px 16px",
    marginTop: 20,
    background: "#1565c0",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    padding: "9px 14px",
    background: "#eef4ff",
    color: "#174ea6",
    border: "1px solid #d6e4ff",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
  disabledButton: { opacity: 0.55, cursor: "not-allowed" },
  divider: { margin: "30px 0", borderTop: "1px solid #e5e7eb" },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 },
  th: {
    padding: "13px 14px",
    background: "#f3f6fb",
    borderBottom: "1px solid #dfe3e8",
    color: "#344054",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "13px 14px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "middle",
    color: "#344054",
    overflowWrap: "anywhere",
  },
  statusBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  pending: { background: "#fff4e5", color: "#b54708" },
  approved: { background: "#e7f6ec", color: "#16834a" },
  rejected: { background: "#feeceb", color: "#c62828" },
  actionButtons: { display: "flex", gap: 8, flexWrap: "wrap" },
  approveButton: {
    padding: "8px 10px",
    background: "#16834a",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  rejectButton: {
    padding: "8px 10px",
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  emptyState: {
    padding: 20,
    background: "#f8fafc",
    border: "1px dashed #d0d5dd",
    borderRadius: 8,
    color: "#667085",
    textAlign: "center",
  },
  success: {
    padding: 12,
    background: "#ecfdf3",
    color: "#16834a",
    borderRadius: 6,
  },
  error: {
    padding: 12,
    background: "#fef3f2",
    color: "#c62828",
    borderRadius: 6,
  },
};
