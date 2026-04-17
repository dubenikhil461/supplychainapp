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
    <div className="mt-6 rounded-lg bg-white p-4 shadow">
      <h3 className="mb-3 text-lg font-semibold text-slate-800">QR Scanner</h3>
      <video className="w-full rounded-md border border-slate-300" ref={videoRef} />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <button
        className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        onClick={isScanning ? stopScan : startScan}
        type="button"
      >
        {isScanning ? "Stop Scanning" : "Start Scanning"}
      </button>
    </div>
  );
}

export default QRScanner;
