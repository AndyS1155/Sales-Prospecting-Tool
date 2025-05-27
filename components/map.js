"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

export default function Map({ businesses, selectedBusinessId, onMarkerClick }) {
  const selected = businesses.find((b) => b.id === selectedBusinessId);

  return (
    <MapContainer
      center={[51.5072, -0.1276]}
      zoom={12}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selected && <FlyTo lat={parseFloat(selected.latitude)} lng={parseFloat(selected.longitude)} />}
      {businesses.map((b, i) => {
        const lat = parseFloat(b.latitude);
        const lng = parseFloat(b.longitude);
        if (!lat || !lng) return null;

        return (
          <Marker key={b.id || i} position={[lat, lng]} eventHandlers={{
            click: () => onMarkerClick?.(b.id),
          }}>
            <Popup>
              <strong>{b.name}</strong><br />
              {b.full_address}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

