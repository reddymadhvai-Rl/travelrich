import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Gauge, Clock, UserRound, Car, RefreshCw, ExternalLink, Hash, Activity, Settings2, X, Route, CirclePause, ArrowLeft } from "lucide-react";
import { tracking as seed } from "../data.js";
import { usePagination } from "../components/Pagination.jsx";

const isMoving = (r) => parseInt(r.speed, 10) > 0;

/* ───── car marker icon (replaces the green pin) ───── */
const carSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
  fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/>
  <path d="M7 14h.01"/><path d="M17 14h.01"/>
  <rect width="18" height="8" x="3" y="10" rx="2"/>
  <path d="M5 18v2"/><path d="M19 18v2"/>
</svg>`;

const makeCarIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};width:42px;height:42px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.45);">${carSvg}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22],
  });

const movingIcon = makeCarIcon("#0f9d8a"); // teal  = moving
const stoppedIcon = makeCarIcon("#6b7280"); // gray = stopped

/* keeps the map centred on the car when its position changes */
function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function TrackingPage() {
  const [rows, setRows] = useState(seed.map((r) => ({ ...r })));
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState("");
  const [auto, setAuto] = useState(true);
  const nav = useNavigate();
  const [params] = useSearchParams();

  // /tracking?vehicle=TS 09 UA 1234 -> open that vehicle's map page
  useEffect(() => {
    const m = seed.find((r) => r.vehicle === params.get("vehicle"));
    if (m) nav(`/tracking/${m.id}`, { replace: true });
  }, [params]); // eslint-disable-line

  // demo: nudges positions slightly. Replace with a real GPS API call.
  const refresh = () =>
    setRows((p) => p.map((r) => ({
      ...r,
      lat: +(r.lat + (Math.random() - 0.5) * 0.004).toFixed(5),
      lng: +(r.lng + (Math.random() - 0.5) * 0.004).toFixed(5),
      speed: `${Math.round(Math.random() * 70)} km/h`,
      updated: "just now",
    })));

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(refresh, 10000);
    return () => clearInterval(t);
  }, [auto]);

  const tabs = [
    { label: "Live Vehicles", icon: Navigation, test: () => true },
    { label: "Moving", icon: Route, test: isMoving },
    { label: "Stopped", icon: CirclePause, test: (r) => !isMoving(r) },
  ];
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter(tabs[tab].test).filter((r) => !t || JSON.stringify(r).toLowerCase().includes(t));
  }, [rows, tab, q]); // eslint-disable-line

  const { rows: pageRows, pager } = usePagination(list);

  return (
    <div className="zpage">
      <div className="zhead">
        <p>Live location of vehicles on the road. Click the car icon to see a vehicle on the map.</p>
        <div className="trk-head-r">
          <label className="track-auto"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto refresh (10s)</label>
          <button className="zbtn" onClick={refresh}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="zcard">
        <div className="ztabs">
          {tabs.map((t, i) => (
            <button key={t.label} className={tab === i ? "on" : ""} onClick={() => setTab(i)}>
              <t.icon size={16} />{t.label}<span className="ztab-count">{rows.filter(t.test).length}</span>
            </button>
          ))}
        </div>

        <div className="zbar">
          <div className="zbar-l" />
          <div className="zbar-r">
            <div className="zsearch">
              <input placeholder="Search tracking" value={q} onChange={(e) => setQ(e.target.value)} />
              {q && <button onClick={() => setQ("")} aria-label="Clear"><X size={15} /></button>}
            </div>
          </div>
        </div>

        <div className="zscroll">
          <table className="ztable">
            <thead>
              <tr>
                <th className="idcol"><Hash size={15} />ID</th>
                <th><Car size={15} />Vehicle</th>
                <th><UserRound size={15} />Driver</th>
                <th><MapPin size={15} />Current Location</th>
                <th><Gauge size={15} />Speed</th>
                <th><Activity size={15} />Status</th>
                <th><Clock size={15} />Last Update</th>
                <th className="actcol"><Settings2 size={15} />Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td className="idcol"><span className="zchip">TR-{r.id}</span></td>
                  <td className="prim"><b>{r.vehicle}</b></td>
                  <td>{r.driver}</td>
                  <td>{r.location}</td>
                  <td>{r.speed}</td>
                  <td className={`zst ${isMoving(r) ? "st-teal" : "st-gray"}`}>{isMoving(r) ? "Moving" : "Stopped"}</td>
                  <td>{r.updated}</td>
                  <td className="actcol">
                    <span className="zacts">
<button
  className="trk"
  onClick={() => nav(`/tracking/${r.id}`)}
  title="Track on map"
  aria-label="Track on map"
  style={{ display: "inline-flex", alignItems: "center", gap: 6, width: "auto", padding: "0 10px" }}
>
  <MapPin size={16} /> Track
</button>                    </span>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td className="zempty" colSpan={8}>No records found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="zfoot">Total Count: <b>{list.length}</b></div>
        {pager}
      </div>

    </div>
  );
}

/* ---------- full page map for one vehicle ---------- */
export function TrackingMapPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const base = seed.find((r) => String(r.id) === id);
  const [cur, setCur] = useState(base ? { ...base } : null);
  const [auto, setAuto] = useState(true);

  // demo: nudges position slightly. Replace with a real GPS API call.
  const refresh = () =>
    setCur((r) => r && ({
      ...r,
      lat: +(r.lat + (Math.random() - 0.5) * 0.004).toFixed(5),
      lng: +(r.lng + (Math.random() - 0.5) * 0.004).toFixed(5),
      speed: `${Math.round(Math.random() * 70)} km/h`,
      updated: "just now",
    }));
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(refresh, 10000);
    return () => clearInterval(t);
  }, [auto]);

  if (!cur) {
    return <div className="zcard vf-empty">Vehicle not found. <button className="zbtn" onClick={() => nav("/tracking")}>Back to Tracking</button></div>;
  }

  const details = [
    [Car, "Vehicle", cur.vehicle], [UserRound, "Driver", cur.driver], [MapPin, "Location", cur.location],
    [Gauge, "Speed", cur.speed], [Activity, "Status", isMoving(cur) ? "Moving" : "Stopped"], [Clock, "Last Update", cur.updated],
  ];

  return (
    <div className="zpage">
      <div className="vf-top">
        <button type="button" className="zbtn ghost" onClick={() => nav("/tracking")}><ArrowLeft size={15} /> Back</button>
        <div>
          <h2>Track {cur.vehicle}</h2>
          <p>{cur.driver} · {cur.lat}, {cur.lng}</p>
        </div>
        <div className="trk-head-r vf-manage">
          <label className="track-auto"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto refresh (10s)</label>
          <button className="zbtn ghost" onClick={refresh}><RefreshCw size={14} /> Refresh</button>
          <a className="zbtn" href={`https://www.google.com/maps?q=${cur.lat},${cur.lng}`} target="_blank" rel="noreferrer"><Navigation size={14} /> Open in Google Maps <ExternalLink size={12} /></a>
        </div>
      </div>

      <div className="trk-cards">
        {details.map(([Icon, label, val]) => (
          <div className="trk-card" key={label}>
            <span className="mini-ico tone-blue"><Icon size={15} /></span>
            <div><small>{label}</small><b>{val}</b></div>
          </div>
        ))}
      </div>

      <div className="zcard trk-mapwrap">
        {/* Leaflet map with car marker (replaces the old iframe) */}
        <div style={{ height: "calc(100vh - 340px)", minHeight: 420, width: "100%" }}>
          <MapContainer
            center={[cur.lat, cur.lng]}
            zoom={15}
            scrollWheelZoom
            style={{ height: "100%", width: "100%", borderRadius: 10 }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recenter lat={cur.lat} lng={cur.lng} />
            <Marker position={[cur.lat, cur.lng]} icon={isMoving(cur) ? movingIcon : stoppedIcon}>
              <Popup>
                <b>{cur.vehicle}</b><br />
                {cur.driver}<br />
                {cur.location}<br />
                Speed: {cur.speed}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}