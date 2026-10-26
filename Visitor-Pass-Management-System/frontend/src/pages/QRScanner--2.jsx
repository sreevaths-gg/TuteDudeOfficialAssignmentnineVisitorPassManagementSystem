
import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../services/api";

export default function QRScanner() {
  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  const [message, setMessage] = useState(
    "Scan or upload a visitor pass QR code."
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "visitor-qr-reader",
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
      },
      false
    );

    scannerRef.current = scanner;

    const handleScanSuccess = async (decodedText) => {
      if (processingRef.current) return;

      processingRef.current = true;
      setBusy(true);
      setMessage("Verifying visitor pass...");

      try {
        let passId = decodedText.trim();

        // If the QR contains JSON, extract the passId.
        try {
          const parsed = JSON.parse(passId);

          if (parsed && typeof parsed === "object") {
            passId =
              parsed.passId ||
              parsed._id ||
              parsed.id ||
              "";
          }
        } catch {
          // QR contains plain text, so use it directly.
        }

        passId = String(passId).trim();

        // MongoDB ObjectIds contain 24 hexadecimal characters.
        if (!/^[a-fA-F0-9]{24}$/.test(passId)) {
          throw new Error(
            "Invalid QR code: a valid pass ID was not found."
          );
        }

        // Send only the extracted pass ID to the backend.
        const response = await api.post("/checkin", {
          passId: passId,
        });

        setMessage(
          response.data?.message ||
            "Visitor check-in completed successfully."
        );

        await scanner.clear();
        scannerRef.current = null;
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Could not verify or check in this pass."
        );

        // Permit another scan after a failed request.
        processingRef.current = false;
        setBusy(false);
      }
    };

    scanner.render(handleScanSuccess, () => {});

    return () => {
      if (scannerRef.current) {
        scanner.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <main
      style={{
        maxWidth: 700,
        margin: "24px auto",
        padding: 16,
      }}
    >
      <h1>QR Pass Scanner</h1>

      <p>{message}</p>

      {busy && <p>Processing pass...</p>}

      <div id="visitor-qr-reader" />

      <p>
        <small>
          Use localhost or HTTPS for camera access. The backend must
          validate the pass before recording a check-in.
        </small>
      </p>
    </main>
  );
}
