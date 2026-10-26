import { useEffect, useState } from "react";
import api from "../services/api";

const getId = (value) => {
  if (value && typeof value === "object") {
    return value._id || value.id || "";
  }

  return value || "";
};

const getAppointmentId = (appointment) =>
  appointment?.appointmentId ||
  appointment?._id ||
  appointment?.id ||
  "";

const getVisitorId = (appointment) =>
  getId(appointment?.visitorId || appointment?.visitor?._id || appointment?.visitor);

const getVisitorName = (appointment) =>
  appointment?.visitorName ||
  appointment?.visitorId?.fullName ||
  appointment?.visitorId?.name ||
  appointment?.visitor?.fullName ||
  appointment?.visitor?.name ||
  "Unknown Visitor";

export default function GeneratePass() {
  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState("");
  const [pass, setPass] = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [smsLoading, setSmsLoading] = useState(false);

  const selectedAppointment = appointments.find(
    (appointment) =>
      String(getAppointmentId(appointment)) === String(appointmentId)
  );

  // Load appointments for the dropdown.
  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      setError("");

      const response = await api.get("/appointments");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.appointments)
        ? data.appointments
        : Array.isArray(data.data)
        ? data.data
        : [];

      setAppointments(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load appointments. Check your login and backend."
      );
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleAppointmentChange = (event) => {
    setAppointmentId(event.target.value);
    setPass(null);
    setMessage("");
    setError("");
  };

  // Generate a pass for the selected appointment and visitor.
  const handleGeneratePass = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setPass(null);

    if (!selectedAppointment) {
      setError("Please select an appointment.");
      return;
    }

    const selectedVisitorId = getVisitorId(selectedAppointment);
    const selectedAppointmentId = getAppointmentId(selectedAppointment);

    if (!selectedVisitorId) {
      setError(
        "The selected appointment has no visitor ID. Check the appointment data returned by your backend."
      );
      return;
    }

    if (!selectedAppointmentId) {
      setError("The selected appointment has no appointment ID.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/passes/generate", {
        visitorId: selectedVisitorId,
        appointmentId: selectedAppointmentId,
      });

      const generatedPass = response.data?.pass || response.data;

      setPass({
        ...generatedPass,
        appointmentId:
          generatedPass.appointmentId || selectedAppointmentId,
        visitorName:
          generatedPass.visitorName || getVisitorName(selectedAppointment),
      });

      setMessage(
        response.data?.message || "Pass generated successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate pass. Check the backend pass-generation API."
      );
    } finally {
      setLoading(false);
    }
  };

  // Download the generated PDF.
  const handleDownloadPDF = async () => {
    if (!pass?.passId) {
      setError("Pass ID is missing, so the PDF cannot be downloaded.");
      return;
    }

    setError("");

    try {
      const response = await api.get(
        `/passes/${pass.passId}/pdf`,
        { responseType: "blob" }
      );

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${pass.passNumber || pass.passId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not download the PDF. Check the backend PDF endpoint."
      );
    }
  };

  // Send or resend the pass email.
  const handleSendEmail = async () => {
    if (!pass?.passId) {
      setError("Pass ID is missing, so the email cannot be sent.");
      return;
    }

    setEmailLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(`/passes/${pass.passId}/email`);

      setMessage(
        response.data?.message || "Pass email sent successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not send email. Check your backend email configuration."
      );
    } finally {
      setEmailLoading(false);
    }
  };

  
const handleSendSMS = async () => {
  if (!pass?.passId) {
    setError("Pass ID is missing, so SMS cannot be sent.");
    return;
  }

  if (!pass?.phone) {
    setError("Visitor phone number is missing.");
    return;
  }

  setSmsLoading(true);
  setError("");
  setMessage("");

  try {
    const response = await api.post(
      `/passes/${pass.passId}/sms`
    );

    setMessage(
      response.data?.message || "Pass SMS sent successfully."
    );
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Could not send SMS. Check your SMS provider configuration."
    );
  } finally {
    setSmsLoading(false);
  }
};


  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Generate Visitor Pass</h2>

        <p style={styles.subtitle}>
          Select an appointment to generate a pass for its visitor.
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

        <form onSubmit={handleGeneratePass}>
          <label htmlFor="appointment" style={styles.label}>
            Select Appointment
          </label>

          <select
            id="appointment"
            value={appointmentId}
            onChange={handleAppointmentChange}
            style={styles.input}
            required
            disabled={loadingAppointments}
          >
            <option value="">
              {loadingAppointments
                ? "Loading appointments..."
                : "-- Select an appointment --"}
            </option>

            {appointments.map((appointment, index) => {
              const id = getAppointmentId(appointment);
              const visitorName = getVisitorName(appointment);
              const status = appointment.status || "pending";

              return (
                <option
                  key={id || `appointment-${index}`}
                  value={id}
                  disabled={!id || !getVisitorId(appointment)}
                >
                  {visitorName} | Appointment ID: {id || "Unavailable"} |{" "}
                  {status}
                </option>
              );
            })}
          </select>

          {selectedAppointment && (
            <div style={styles.appointmentDetails}>
              <p>
                <strong>Visitor:</strong>{" "}
                {getVisitorName(selectedAppointment)}
              </p>

              <p>
                <strong>Appointment ID:</strong>{" "}
                {getAppointmentId(selectedAppointment)}
              </p>

              <p>
                <strong>Host:</strong>{" "}
                {selectedAppointment.hostName || "-"}
              </p>

              <p>
                <strong>Purpose:</strong>{" "}
                {selectedAppointment.purpose || "-"}
              </p>

              <p>
                <strong>Visit Date:</strong>{" "}
                {selectedAppointment.visitDate
                  ? new Date(
                      selectedAppointment.visitDate
                    ).toLocaleDateString()
                  : "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedAppointment.status || "pending"}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || loadingAppointments || !selectedAppointment}
            style={styles.primaryButton}
          >
            {loading ? "Generating..." : "Generate Pass"}
          </button>
        </form>

        {!loadingAppointments && appointments.length === 0 && (
          <p style={styles.subtitle}>
            No appointments found. Create an appointment first.
          </p>
        )}

        {pass && (
          <div style={styles.passSection}>
            <h3>Pass Generated</h3>

            <p>
              <strong>Pass Number:</strong> {pass.passNumber || "-"}
            </p>

            <p>
              <strong>Visitor:</strong> {pass.visitorName || "-"}
            </p>

            <p>
              <strong>Appointment ID:</strong>{" "}
              {pass.appointmentId || "-"}
            </p>

            <p>
              <strong>Email:</strong> {pass.email || "-"}
            </p>

            <p>
              <strong>Status:</strong> {pass.status || "-"}
            </p>

            <p>
              <strong>Pass ID:</strong> {pass.passId || "-"}
            </p>

            {pass.qrCode && (
              <div style={styles.qrSection}>
                <h4>Visitor QR Code</h4>

                <img
                  src={pass.qrCode}
                  alt="Generated visitor pass QR code"
                  style={styles.qrImage}
                />

                <p style={styles.subtitle}>
                  Scan this QR code using your QR scanner page.
                </p>

                <a
                  href={pass.qrCode}
                  download={`${pass.passNumber || "visitor-pass"}-qr.png`}
                  style={styles.secondaryButton}
                >
                  Download QR Image
                </a>
              </div>
            )}

            <div style={styles.actions}>
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={!pass.passId}
                style={styles.primaryButton}
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={emailLoading || !pass.passId}
                style={styles.emailButton}
              >
                {emailLoading ? "Sending..." : "Send Email"}
              </button>

<button
    type="button"
    onClick={handleSendSMS}
    disabled={smsLoading || !pass.passId || !pass.phone}
    style={styles.smsButton}
  >
    {smsLoading ? "Sending SMS..." : "Send SMS"}
</button>
            </div>
          </div>
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
  },
  card: {
    maxWidth: 650,
    margin: "0 auto",
    padding: 28,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  subtitle: {
    color: "#667085",
    fontSize: 14,
  },
  label: {
    display: "block",
    marginTop: 20,
    marginBottom: 8,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: 12,
    border: "1px solid #ccd3df",
    borderRadius: 6,
    boxSizing: "border-box",
  },
  appointmentDetails: {
    marginTop: 16,
    padding: 14,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    overflowWrap: "anywhere",
  },
  primaryButton: {
    padding: "11px 16px",
    marginTop: 16,
    background: "#1565c0",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  emailButton: {
    padding: "11px 16px",
    marginTop: 16,
    background: "#16834a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  smsButton: {
  padding: "11px 16px",
  marginTop: 16,
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
},
  secondaryButton: {
    display: "inline-block",
    padding: "10px 14px",
    marginTop: 8,
    background: "#eef4ff",
    color: "#174ea6",
    textDecoration: "none",
    borderRadius: 6,
  },
  passSection: {
    marginTop: 28,
    paddingTop: 20,
    borderTop: "1px solid #e5e7eb",
    overflowWrap: "anywhere",
  },
  qrSection: {
    textAlign: "center",
    padding: "20px 0",
  },
  qrImage: {
    display: "block",
    width: 220,
    maxWidth: "100%",
    height: "auto",
    margin: "10px auto",
    border: "1px solid #eee",
    padding: 8,
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  success: {
    color: "#16834a",
    marginTop: 16,
  },
  error: {
    color: "#c62828",
    marginTop: 16,
  },
};