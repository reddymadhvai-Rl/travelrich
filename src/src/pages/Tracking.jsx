import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, Navigation, Gauge, Clock, UserRound, Car, RefreshCw, ExternalLink, Radio } from "lucide-react";
import { tracking as seed } from "../data.js";

const bboxFor = (lat, lng, d = 0.03) => `${lng - d},${lat - d},${lng + d},${lat + d}`;

export default function TrackingPage() {
  const [rows, setRows] = useState(seed.map((r) => ({ ...r })));
  const [params] = useSearchParams();
  const wanted = params.get("vehicle");
  const [sel, setSel] = useState(seed.find((r) => r.vehicle === wanted)?.id ?? seed[0].id);
  useEffect(() => {
    const m = seed.find((r) => r.vehicle === wanted);
    if (m) setSel(m.id);
  }, [wanted]);
  const [auto, setAuto] = useState(true);
  const [q, setQ] = useState("");

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

  const list = useMemo(() => rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase())), [rows, q]);
  const cur = rows.find((r) => r.id === sel) || rows[0];
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxFor(cur.lat, cur.lng)}&layer=mapnik&marker=${cur.lat},${cur.lng}`;

  return (
    <div className="track">
      <div className="track-list panel">
        <div className="track-head">
          <h3><Radio size={16} /> Live Vehicles <span className="count">{rows.length}</span></h3>
          <button className="icon-round" onClick={refresh} title="Refresh now"><RefreshCw size={16} /></button>
        </div>
        <input className="track-search" placeholder="Search vehicle or driver" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="track-auto"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto refresh (10 sec)</label>
        {list.map((r) => (
          <div key={r.id} role="button" tabIndex={0} className={`track-item ${r.id === sel ? "on" : ""}`} onClick={() => setSel(r.id)}
            onKeyDown={(e) => e.key === "Enter" && setSel(r.id)}>
            <span className="mini-ico tone-blue"><Car size={15} /></span>
            <span className="t-body">
              <b>{r.vehicle}</b>
              <small><UserRound size={11} /> {r.driver}</small>
              <small><MapPin size={11} /> {r.location}</small>
            </span>
            <span className="t-side"><b>{r.speed}</b><small><Clock size={10} /> {r.updated}</small></span>
            <button className="icon-round" title="Track on map" aria-label="Track on map"
              onClick={(e) => { e.stopPropagation(); setSel(r.id); document.querySelector(".track-map")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
              <MapPin size={16} />
            </button>
          </div>
        ))}
        {!list.length && <div className="empty">No vehicles found</div>}
      </div>

      <div className="track-map panel">
        <div className="track-map-top">
          <div>
            <b>{cur.vehicle}</b>
            <span><UserRound size={13} /> {cur.driver} · <Gauge size={13} /> {cur.speed} · <Clock size={13} /> {cur.updated}</span>
            <span><MapPin size={13} /> {cur.location} ({cur.lat}, {cur.lng})</span>
          </div>
          <a className="btn outline" href={`https://www.google.com/maps?q=${cur.lat},${cur.lng}`} target="_blank" rel="noreferrer">
            <Navigation size={14} /> Open in Google Maps <ExternalLink size={12} />
          </a>
        </div>
        <iframe key={src} title="Vehicle location" src={src} loading="lazy" />
      </div>
    </div>
  );
}
