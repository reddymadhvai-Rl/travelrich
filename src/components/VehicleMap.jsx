import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const carSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
  fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/>
  <path d="M7 14h.01"/><path d="M17 14h.01"/>
  <rect width="18" height="8" x="3" y="10" rx="2"/>
  <path d="M5 18v2"/><path d="M19 18v2"/>
</svg>`;

const carIcon = L.divIcon({
  className: "",
  html: `<div style="background:#0f9d8a;width:38px;height:38px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);">${carSvg}</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
});

/* moves the map when the position changes */
function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
    setTimeout(() => map.invalidateSize(), 100);
  }, [lat, lng, map]);
  return null;
}

/* Hyderabad (Gachibowli) default */
export default function VehicleMap({
  lat = 17.4401,
  lng = 78.3489,
  regNo = "Vehicle",
  location = "",
  height = 340,
}) {
  const la = Number(lat) || 17.4401;
  const ln = Number(lng) || 78.3489;

  return (
    <MapContainer
      center={[la, ln]}
      zoom={14}
      scrollWheelZoom
      style={{ height, width: "100%", borderRadius: 10 }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={la} lng={ln} />
      <Marker position={[la, ln]} icon={carIcon}>
        <Popup>
          <b>{regNo}</b>
          {location && <><br />{location}</>}
        </Popup>
      </Marker>
    </MapContainer>
  );
}