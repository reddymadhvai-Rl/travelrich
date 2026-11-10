import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MoreHorizontal, Ban, Plus, Pencil, Eye, Trash2, Search, X, Check, Car, CircleCheck, CalendarClock, Wrench, FileWarning } from "lucide-react";
import { Menu } from "../components/DataPage.jsx";
import { useVehicles, deleteVehicle, updateVehicle, docState, maintenanceState, showDate } from "../vehicleStore.js";

const statusTone = (s) =>
  ({ Available: "st-teal", Booked: "st-orange", "Under Maintenance": "st-blue", Inactive: "st-gray", Blocked: "st-red", Retired: "st-gray" }[s] || "st-blue");

export default function VehiclesList() {
  const vehicles = useVehicles();
  const nav = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");
  const timer = useRef(null);

  const flash = (m) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 2600); };
  useEffect(() => {
    if (location.state?.toast) { flash(location.state.toast); nav(location.pathname, { replace: true, state: null }); }
  }, [location.state]); // eslint-disable-line

  const tabs = [
    { label: "All Vehicles", icon: Car, test: () => true },
    { label: "Available", icon: CircleCheck, test: (v) => v.status === "Available" },
    { label: "Booked", icon: CalendarClock, test: (v) => v.status === "Booked" },
    { label: "Under Maintenance", icon: Wrench, test: (v) => v.status === "Under Maintenance" },
    { label: "Documents Expired", icon: FileWarning, test: (v) => docState(v).expired.length > 0 },
  ];

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return vehicles.filter(tabs[tab].test).filter((v) => !t || JSON.stringify(v).toLowerCase().includes(t)); // eslint-disable-line
  }, [vehicles, tab, q]); // eslint-disable-line

  const cancelVehicle = (v) => {
    if (v.status === "Inactive") return;
    if (!window.confirm(`Cancel vehicle ${v.regNo}? Its status will be set to Inactive.`)) return;
    updateVehicle(v.id, { status: "Inactive" });
    flash("Vehicle cancelled (Inactive)");
  };
  const remove = (v) => {
    if (!window.confirm(`Delete vehicle ${v.regNo}?`)) return;
    deleteVehicle(v.id);
    flash("Vehicle deleted");
  };

  return (
    <div className="zpage">
      <div className="zhead">
        <p>Manage your fleet. Click a vehicle to view its details, drivers, bookings, expenses, payments and tracking.</p>
        <button className="zbtn" onClick={() => nav("/vehicles/new")}><Plus size={15} /> Add Vehicle</button>
      </div>

      <div className="zcard">
        <div className="ztabs">
          {tabs.map((t, i) => (
            <button key={t.label} className={tab === i ? "on" : ""} onClick={() => setTab(i)}>
              <t.icon size={16} />{t.label}
              <span style={{ marginLeft: 6, opacity: 0.7 }}>({vehicles.filter(t.test).length})</span>
            </button>
          ))}
        </div>

        <div className="zbar">
          <div className="zbar-l" />
          <div className="zbar-r">
            <div className="zsearch">
              <input placeholder="Search vehicles" value={q} onChange={(e) => setQ(e.target.value)} />
              {q && <button onClick={() => setQ("")} aria-label="Clear"><X size={15} /></button>}
            </div>
          </div>
        </div>

        <div className="zscroll">
          <table className="ztable">
            <thead>
              <tr>
                <th className="idcol">ID</th><th>Registration No</th><th>Type</th><th>Make / Model</th>
                <th>Seats</th><th>Fuel</th><th>Ownership</th><th>Status</th><th>Documents</th><th>Next Service</th>
                <th className="actcol">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((v) => {
                const d = docState(v);
                const m = maintenanceState(v);
                return (
                  <tr key={v.id}>
                    <td className="idcol"><span className="zchip">{v.id}</span></td>
                    <td className="prim"><button type="button" className="zlink" onClick={() => nav(`/vehicles/${v.id}`)}>{v.regNo}</button></td>
                    <td>{v.type}</td>
                    <td>{v.make} {v.model}{v.year ? <span className="vf-sub">{v.year}</span> : null}</td>
                    <td>{v.seats}</td>
                    <td>{v.fuel}</td>
                    <td>{v.ownership}</td>
                    <td className={`zst ${statusTone(v.status)}`}>{v.status}</td>
                    <td className={`zst ${d.tone}`} title={d.expired.length ? `Expired: ${d.expired.join(", ")}` : d.soon.length ? `Expiring: ${d.soon.join(", ")}` : ""}>{d.label}</td>
                    <td>{showDate(v.nextServiceDue) || <span className="zmuted">—</span>}{m !== "Normal" && <span className="vf-sub" style={{ color: m === "Overdue" ? "#dc2626" : "#d97706" }}>{m}</span>}</td>
                    <td className="actcol">
                      <span className="zacts">
                        <button onClick={() => nav(`/vehicles/${v.id}/edit`)} title="Edit" aria-label="Edit"><Pencil size={16} /></button>
                        <button className="cxl" disabled={v.status === "Inactive"} onClick={() => cancelVehicle(v)} title="Cancel" aria-label="Cancel"><Ban size={16} /></button>
                        <button className="del" onClick={() => remove(v)} title="Delete" aria-label="Delete"><Trash2 size={16} /></button>
                        <Menu align="right" fixed trigger={() => <button title="More" aria-label="More"><MoreHorizontal size={16} /></button>}>
                          <button onClick={() => nav(`/vehicles/${v.id}`)}><Eye size={15} /> View</button>
                        </Menu>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!list.length && <tr><td className="zempty" colSpan={11}>No vehicles found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="zfoot">Total Count: <b>{list.length}</b></div>
      </div>

      {toast && <div className="zsnack" role="status"><span><Check size={13} /></span>{toast}</div>}
    </div>
  );
}
