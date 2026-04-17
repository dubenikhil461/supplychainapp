/**
 * filename: frontend/src/components/QRScanner.jsx
 * purpose: Camera-based QR scanner to open tracked product pages.
 * setup notes: Uses @zxing/browser BrowserQRCodeReader.
 */
import React from "react";
import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useNavigate } from "react-router-dom";

function QRScanner() {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  const stopScan = async () => {
    try {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
      setIsScanning(false);
    } catch (scanError) {
      setError(`Failed to stop scanner: ${scanError.message}`);
    }
  };

  const startScan = async () => {
    try {
      setError("");
      if (!readerRef.current) {
        readerRef.current = new BrowserQRCodeReader();
      }

      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, scanError) => {
          if (result) {
            const decodedText = result.getText();
            stopScan();
            try {
              const targetUrl = new URL(decodedText);
              if (targetUrl.origin === window.location.origin) {
                navigate(`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`);
              } else {
                window.location.href = decodedText;
              }
            } catch (_error) {
              setError("Invalid QR URL scanned.");
            }
          } else if (scanError && scanError.name !== "NotFoundException") {
            setError(`Scan error: ${scanError.message}`);
          }
        }
      );

      setIsScanning(true);
    } catch (scanError) {
      setError(`Camera access failed: ${scanError.message}`);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-xl shadow-black/30 backdrop-blur-md">
      <h3 className="mb-1 text-lg font-semibold text-white">Camera scanner</h3>
      <p className="mb-4 text-sm text-slate-400">Grant camera access, then aim at a product QR to open its page.</p>
      <video className="w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-inner" ref={videoRef} />
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      <button
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-teal-300 sm:w-auto"
        onClick={isScanning ? stopScan : startScan}
        type="button"
      >
        {isScanning ? "Stop scanning" : "Start scanning"}
      </button>
    </div>
  );
}

export default QRScanner;
