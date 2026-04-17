/**
 * filename: frontend/src/components/JourneyMap.jsx
 * purpose: Geocoded map visualization of product journey steps.
 * setup notes: Uses Nominatim geocoding and OpenStreetMap tiles.
 */
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

function MapBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [points, map]);

  return null;
}

function markerIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function JourneyMap({ steps, onLoadingChange }) {
  const [points, setPoints] = useState([]);
  const [polylinePhase, setPolylinePhase] = useState(0);

  useEffect(() => {
    const geocode = async () => {
      try {
        onLoadingChange?.(true);
        const settled = await Promise.all(
          steps.map(async (step, index) => {
            try {
              const query = encodeURIComponent(step.location);
              const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`);
              const data = await response.json();
              if (!Array.isArray(data) || data.length === 0) return null;
              return {
                ...step,
                index,
                lat: Number(data[0].lat),
                lng: Number(data[0].lon)
              };
            } catch (_error) {
              return null;
            }
          })
        );

        setPoints(settled.filter(Boolean));
      } catch (_error) {
        setPoints([]);
      } finally {
        onLoadingChange?.(false);
      }
    };

    geocode();
  }, [steps, onLoadingChange]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPolylinePhase((prev) => (prev + 1) % 24);
    }, 220);
    return () => clearInterval(timer);
  }, []);

  const polylinePositions = useMemo(() => points.map((point) => [point.lat, point.lng]), [points]);

  if (points.length < 2) return null;

  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200">
      <MapContainer center={[20.5937, 78.9629]} style={{ height: "400px", width: "100%" }} zoom={4}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds points={points} />
        <Polyline
          pathOptions={{ color: "#0ea5e9", weight: 4, opacity: 0.9, dashArray: "8 12", dashOffset: `${polylinePhase}` }}
          positions={polylinePositions}
        />
        {points.map((point, index) => {
          const color = index === 0 ? "#16a34a" : index === points.length - 1 ? "#dc2626" : "#2563eb";
          return (
            <Marker icon={markerIcon(color)} key={`${point.location}-${index}`} position={[point.lat, point.lng]}>
              <Popup>
                <div className="text-sm">
                  <p><strong>Step {point.index + 1}</strong></p>
                  <p>Status: {point.status}</p>
                  <p>Location: {point.location}</p>
                  <p>Timestamp: {new Date(point.timestamp).toLocaleString()}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default JourneyMap;
