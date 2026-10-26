import { useEffect, useState } from "react";
import api from "../services/api";

export default function CheckIn() {
  const [passes, setPasses] = useState([]);
  const [selectedPass, setSelectedPass] = useState("");
  const [securityOfficer, setSecurityOfficer] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPasses, setLoadingPasses] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
      return value._id || value.id || "";
    }

    return String(value);
  };

  const getPassId = (pass) =>
    getId(pass._id || pass.id || pass.passId);

  const getVisitorId = (pass) =>
    getId(pass.visitorId || pass.visitor?._id || pass.visitor);

  const getVisitorName = (pass) =>
    pass.visitorName ||
    pass.visitorId?.fullName ||
    pass.visitorId?.name ||
    pass.visitor?.fullName ||
    pass.visitor?.name ||
    "Unknown Visitor";

  const loadPasses = async () => {
    try {
      setLoadingPasses(true);

      const response = await api.get("/passes");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.passes)
        ? data.passes
        : Array.isArray(data.data)
        ? data.data
        : [];

      setPasses(list);

      setSelectedPass((current) =>
        list.some((pass) => getPassId(pass) === current)
          ? current
          : ""
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load passes. Check the GET /api/passes endpoint."
      );
    } finally {
      setLoadingPasses(false);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const selectedPassObject = passes.find(
    (pass) => getPassId(pass) === selectedPass
  );

  const handleCheckIn = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedPassObject) {
      setError("Please select a valid visitor pass.");
      return;
    }

    const visitorId = getVisitorId(selectedPassObject);

    if (!visitorId) {
      setError("The selected pass has no visitor ID.");
      return;
    }

    if (!securityOfficer.trim()) {
      setError("Please enter the security officer's name.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/checkin", {
        visitorId,
        passId: selectedPass,
        securityOfficer: securityOfficer.trim(),
      });

      setMessage(
        response.data?.message || "Visitor checked in successfully."
      );

      setSelectedPass("");
      setSecurityOfficer("");

      await loadPasses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Check-in failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Visitor Check-In</h2>

        <p style={styles.subtitle}>
          Select a visitor pass and enter the security officer's name
          to record the visitor's arrival.
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

        <form onSubmit={handleCheckIn}>
          <label htmlFor="visitorPass" style={styles.label}>
            Select Visitor Pass
          </label>

          <select
            id="visitorPass"
            value={selectedPass}
            onChange={(event) => {
              setSelectedPass(event.target.value);
              setMessage("");
              setError("");
            }}
            style={styles.input}
            required
            disabled={loadingPasses || loading}
          >
            <option value="">
              {loadingPasses
                ? "Loading passes..."
                : "-- Select a visitor pass --"}
            </option>

            {passes.map((pass, index) => {
              const passId = getPassId(pass);
              const visitorId = getVisitorId(pass);

              if (!passId) return null;

              return (
                <option
                  key={passId || `pass-${index}`}
                  value={passId}
                  disabled={!visitorId}
                >
                  {getVisitorName(pass)} | Pass:{" "}
                  {pass.passNumber || passId}
                  {pass.status ? ` | ${pass.status}` : ""}
                </option>
              );
            })}
          </select>

          {selectedPassObject && (
            <div style={styles.details}>
              <h3>Visitor Pass Details</h3>

              <p>
                <strong>Visitor Name:</strong>{" "}
                {getVisitorName(selectedPassObject)}
              </p>

              <p>
                <strong>Pass Number:</strong>{" "}
                {selectedPassObject.passNumber || "N/A"}
              </p>

              <p>
                <strong>Visitor ID:</strong>{" "}
                {getVisitorId(selectedPassObject) || "Unavailable"}
              </p>

              <p>
                <strong>Appointment ID:</strong>{" "}
                {selectedPassObject.appointmentId?._id ||
                  selectedPassObject.appointmentId ||
                  "N/A"}
              </p>

              <p>
                <strong>Pass Status:</strong>{" "}
                {selectedPassObject.status || "Not specified"}
              </p>
            </div>
          )}

          <label htmlFor="securityOfficer" style={styles.label}>
            Security Officer
          </label>

          <input
            id="securityOfficer"
            type="text"
            value={securityOfficer}
            onChange={(event) => setSecurityOfficer(event.target.value)}
            placeholder="Enter security officer name"
            style={styles.input}
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading ||
              loadingPasses ||
              !selectedPassObject
            }
            style={{
              ...styles.primaryButton,
              opacity:
                loading || loadingPasses || !selectedPassObject
                  ? 0.65
                  : 1,
            }}
          >
            {loading ? "Checking In..." : "Check In Visitor"}
          </button>
        </form>

        {!loadingPasses && passes.length === 0 && (
          <p style={styles.subtitle}>
            No visitor passes found. Generate a pass first.
          </p>
        )}

        <button
          type="button"
          onClick={loadPasses}
          disabled={loadingPasses || loading}
          style={styles.secondaryButton}
        >
          {loadingPasses ? "Refreshing..." : "Refresh Passes"}
        </button>
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
    lineHeight: 1.6,
  },
  label: {
    display: "block",
    marginTop: 20,
    marginBottom: 8,
    fontWeight: 600,
  },
  input: {
    display: "block",
    width: "100%",
    padding: 12,
    border: "1px solid #ccd3df",
    borderRadius: 6,
    boxSizing: "border-box",
    background: "#fff",
  },
  details: {
    marginTop: 18,
    padding: 16,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflowWrap: "anywhere",
    lineHeight: 1.6,
  },
  primaryButton: {
    display: "block",
    width: "100%",
    padding: 12,
    marginTop: 22,
    background: "#16834a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    display: "block",
    width: "100%",
    padding: 11,
    marginTop: 12,
    background: "#eef4ff",
    color: "#174ea6",
    border: "1px solid #d5e3ff",
    borderRadius: 6,
    cursor: "pointer",
  },
  success: {
    color: "#16834a",
    background: "#ecfdf3",
    border: "1px solid #abefc6",
    borderRadius: 6,
    padding: 12,
  },
  error: {
    color: "#c62828",
    background: "#fef3f2",
    border: "1px solid #fecdca",
    borderRadius: 6,
    padding: 12,
  },
};