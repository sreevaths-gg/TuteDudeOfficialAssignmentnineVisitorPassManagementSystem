
import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../services/api";

const getId = (value) => {
  if (value && typeof value === "object") {
    return value._id || value.id || value.passId || "";
  }

  return value || "";
};

const getVisitorName = (pass) => {
  const visitor =
    pass?.visitorId && typeof pass.visitorId === "object" 
      ? pass.visitorId
      : pass?.visitor && typeof pass.visitor === "object"
      ? pass.visitor
      : null;

  return (
    pass?.visitorName ||
    visitor?.fullName ||
    visitor?.name ||
    "Unknown Visitor"
  );
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleString();
};

const getPassId = (pass) =>
  pass?.passId ||
  pass?._id ||
  pass?.id ||
  "";

const getScannedPassId = (decodedText) => {
  let scannedValue = decodedText.trim();

  // Handle JSON QR content.
  try {
    const parsed = JSON.parse(scannedValue);

    if (typeof parsed === "string") {
      scannedValue = parsed;
    } else if (parsed && typeof parsed === "object") {
      scannedValue =
        parsed.passId ||
        parsed._id ||
        parsed.id ||
        parsed.passNumber ||
        parsed.pass ||
        scannedValue;
    }
  } catch {
    // Keep the original value if it is not JSON.
  }

  // Handle QR content containing a URL.
  if (/^https?:\/\//i.test(scannedValue)) {
    try {
      const url = new URL(scannedValue);
      const segments = url.pathname.split("/").filter(Boolean);
      scannedValue = segments[segments.length - 1] || "";
    } catch {
      throw new Error("The QR code contains an invalid URL.");
    }
  }

  if (!scannedValue || typeof scannedValue !== "string") {
    throw new Error("The QR code does not contain a valid pass ID.");
  }

  return scannedValue.trim();
};

export default function QRScanner() {
  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const mountedRef = useRef(false);

  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    mountedRef.current = true;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        if (processingRef.current) return;

        processingRef.current = true;

        if (mountedRef.current) {
          setError("");
          setMessage("");
          setScanResult(null);
          setLoading(true);
        }

        try {
          const scannedPassId = getScannedPassId(decodedText);

          // This endpoint must exist in the backend.
          
         const response = await api.post("/qr/verify", {  qrCode: scannedPassId, });

          const data = response?.data;

          const pass =
            data?.pass ||
            data?.data?.pass ||
            data?.data ||
            data;

          if (!pass || typeof pass !== "object" || Array.isArray(pass)) {
            throw new Error("Pass details were not found in the server response.");
          }
          

          if (mountedRef.current) {
            setScanResult(pass);
            setMessage("QR code scanned successfully.");
          }
        } catch (err) {
          console.error(
            "QR scan error:",
            err.response?.data || err
          );

          if (mountedRef.current) {
            setError(
              err.response?.data?.message ||
                err.message ||
                "Unable to retrieve pass details. Check the QR code and backend API."
            );
          }
        } finally {
          processingRef.current = false;

          if (mountedRef.current) {
            setLoading(false);
          }
        }
      },
      () => {
        // Ignore normal camera scanning errors when no QR is detected.
      }
    );

    return () => {
      mountedRef.current = false;

      if (scannerRef.current) {
        const currentScanner = scannerRef.current;
        scannerRef.current = null;

        currentScanner.clear().catch((err) => {
          console.warn("Unable to clear QR scanner:", err);
        });
      }
    };
  }, []);

  const visitor =
    scanResult?.visitorId && typeof scanResult.visitorId === "object"
      ? scanResult.visitorId
      : scanResult?.visitor && typeof scanResult.visitor === "object"
      ? scanResult.visitor
      : null;

  const appointment =
    scanResult?.appointmentId &&
    typeof scanResult.appointmentId === "object"
      ? scanResult.appointmentId
      : null;

  const visitorId =
    getId(scanResult?.visitorId) ||
    getId(scanResult?.visitor) ||
    "N/A";

  const appointmentId =
    getId(scanResult?.appointmentId) || "N/A";

  const passId = getPassId(scanResult);

  const handleClearResult = () => {
    setScanResult(null);
    setError("");
    setMessage("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>QR Code Scanner</h2>

        <p style={styles.subtitle}>
          Scan a visitor pass QR code to retrieve its details.
        </p>

        {error && (
          <div role="alert" style={styles.error}>
            {error}
          </div>
        )}

        {message && (
          <div role="status" style={styles.success}>
            {message}
          </div>
        )}

        <div style={styles.scannerSection}>
          <h3 style={styles.sectionHeading}>Scan Visitor Pass</h3>

          <div id="qr-reader" style={styles.reader} />

          <p style={styles.helperText}>
            Allow camera access when prompted and position the QR code
            inside the scanning area.
          </p>
        </div>

        {loading && (
          <p style={styles.loading}>
            Checking pass details...
          </p>
        )}

        {scanResult && (
          <div style={styles.passSection}>
            <h3 style={styles.sectionHeading}>
              Visitor Pass Details
            </h3>

            <div style={styles.details}>
              <p>
                <strong>Visitor Name:</strong>{" "}
                {getVisitorName(scanResult)}
              </p>

              <p>
                <strong>Pass Number:</strong>{" "}
                {scanResult.passNumber || "N/A"}
              </p>

              <p>
                <strong>Pass ID:</strong> {passId || "N/A"}
              </p>

              <p>
                <strong>Visitor ID:</strong> {visitorId}
              </p>

              <p>
                <strong>Appointment ID:</strong>{" "}
                {appointmentId}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {scanResult.email || visitor?.email || "N/A"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {scanResult.phone || visitor?.phone || "N/A"}
              </p>

              <p>
                <strong>Company:</strong>{" "}
                {scanResult.company || visitor?.company || "N/A"}
              </p>

              <p>
                <strong>Issue Date:</strong>{" "}
                {formatDate(
                  scanResult.issueDate ||
                    scanResult.createdAt
                )}
              </p>

              <p>
                <strong>Expiry Date:</strong>{" "}
                {formatDate(scanResult.expiryDate)}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {scanResult.status || "Unknown"}
              </p>

              {appointment && (
                <>
                  <p>
                    <strong>Host:</strong>{" "}
                    {appointment.hostName || "N/A"}
                  </p>

                  <p>
                    <strong>Purpose:</strong>{" "}
                    {appointment.purpose || "N/A"}
                  </p>

                  <p>
                    <strong>Visit Date:</strong>{" "}
                    {formatDate(appointment.visitDate)}
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleClearResult}
              style={styles.secondaryButton}
            >
              Clear Result
            </button>
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
    boxSizing: "border-box",
  },

  card: {
    maxWidth: 650,
    margin: "0 auto",
    padding: 28,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
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

  scannerSection: {
    marginTop: 24,
    padding: 16,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
  },

  sectionHeading: {
    marginTop: 0,
    marginBottom: 16,
    color: "#1f2937",
  },

  reader: {
    width: "100%",
    maxWidth: 500,
    margin: "0 auto",
    overflow: "hidden",
  },

  helperText: {
    marginBottom: 0,
    color: "#667085",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 1.6,
  },

  loading: {
    marginTop: 16,
    color: "#1565c0",
    fontWeight: 600,
  },

  details: {
    padding: 16,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflowWrap: "anywhere",
    lineHeight: 1.7,
  },

  passSection: {
    marginTop: 28,
    paddingTop: 22,
    borderTop: "1px solid #e5e7eb",
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

  secondaryButton: {
    padding: "11px 16px",
    marginTop: 18,
    background: "#eef4ff",
    color: "#174ea6",
    border: "1px solid #dbe7ff",
    borderRadius: 6,
    cursor: "pointer",
  },

  error: {
    padding: 12,
    marginTop: 16,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 6,
    overflowWrap: "anywhere",
  },

  success: {
    padding: 12,
    marginTop: 16,
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 6,
  },
};
