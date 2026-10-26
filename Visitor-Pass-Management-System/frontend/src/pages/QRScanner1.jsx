import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';

export default function QRScanner() {
  const scannerRef = useRef(null);
  const [message, setMessage] = useState('Scan a visitor pass QR code.');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('visitor-qr-reader', { fps: 10, qrbox: { width: 240, height: 240 } }, false);
    scannerRef.current = scanner;
    scanner.render(async (decodedText) => {
      if (busy) return;
      setBusy(true);
      try {
        // Expected QR payload: pass ID. Backend endpoint must validate the pass before changing status.
        const passId = decodedText.trim();
        const result = await api.post('/checkin', { passId });
        setMessage(result.data?.message || 'Check-in request completed.');
        await scanner.clear();
      } catch (err) {
        setMessage(err.response?.data?.message || 'Could not verify/check in this pass. Check the API response and required visitorId fields.');
        setBusy(false);
      }
    }, () => {});
    return () => { scanner.clear().catch(() => {}); };
  }, []);

  return <main style={{ maxWidth: 700, margin: '24px auto', padding: 16 }}>
    <h1>QR Pass Scanner</h1>
    <p>{message}</p>
    <div id="visitor-qr-reader" ref={scannerRef} />
    <p><small>Camera access requires localhost or HTTPS. Confirm your backend check-in API payload before using this in production.</small></p>
  </main>;
}
