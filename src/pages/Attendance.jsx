import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  UserCheck, UserX, UserMinus, Users, CalendarDays, Clock, Pencil, Check, Save, Settings2, Plus,
} from "lucide-react";
import { staff } from "../data.js";
import {
  STATUSES, CODE, todayIso, getRecord, setRecord, monthDates, nowTime, useAttendanceVersion,
} from "../attendanceStore.js";

const initials = (n) => String(n).split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const statusCls = { Present: "b-green", Leave: "b-amber", Absent: "b-red", "Weekly Off": "b-gray" };

function Legend() {
  return (
    <div className="att-legend">
      <span><i className="c-P">P</i> Present</span><span><i className="c-A">A</i> Absent</span>
      <span><i className="c-L">L</i> Leave</span><span><i className="c-W">W</i> Weekly off</span>
    </div>
  );
}

function StaffSelect({ value, onChange }) {
  return (
    <select className="att-input" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Employee">
      {staff.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
    </select>
  );
}

/* ---------------- Today ---------------- */
export function TodayAttendance() {
  useAttendanceVersion();
  const nav = useNavigate();
  const [filter, setFilter] = useState("All");
  const iso = todayIso();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const rows = staff.map((s) => ({ ...s, ...getRecord(s, iso) }));
  const count = (s) => rows.filter((r) => r.status === s).length;
  const leaveAbsent = count("Leave") + count("Absent");

  const mark = (r, status) => setRecord(r.id, iso, {
    ...getRecord(r, iso), status,
    in: status === "Present" ? (r.in || nowTime()) : "",
  });

  const cards = [
    { label: "Total Staff", value: rows.length, icon: Users, cls: "fin-blue" },
    { label: "Present", value: count("Present"), icon: UserCheck, cls: "fin-green" },
    { label: "On Leave", value: count("Leave"), icon: UserMinus, cls: "fin-peach" },
    { label: "Absent", value: count("Absent"), icon: UserX, cls: "fin-lav" },
  ];
  const tabs = [
    ["All", `All (${rows.length})`],
    ["Present", `Present (${count("Present")})`],
    ["LeaveAbsent", `Leave / Absent (${leaveAbsent})`],
  ];
  const list = rows.filter((r) => filter === "All" || (filter === "Present" ? r.status === "Present" : r.status === "Leave" || r.status === "Absent"));

  return (
    <>
      <div className="att-cards">
        {cards.map((c) => (
          <div className={`fin-card ${c.cls}`} key={c.label}>
            <span className="fin-lbl">{c.label}</span>
            <div className="fin-row"><b className="fin-num">{c.value}</b><span className="fin-ico"><c.icon size={18} /></span></div>
            <small className="fin-since">{today}</small>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="att-head-row">
          <div className="tabs">
            {tabs.map(([k, l]) => <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}</button>)}
          </div>
          <button className="btn att-add-btn" onClick={() => nav("/attendance/add")}><Plus size={15} /> Add Attendance</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Role</th><th>Phone</th><th>Check-in</th><th>Status</th><th><Settings2 size={13} style={{ verticalAlign: -2 }} /> Actions</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td><div className="cell-flex"><span className="pic tone-teal att-pic">{initials(r.name)}</span><b>{r.name}</b></div></td>
                  <td>{r.role}</td>
                  <td>{r.phone}</td>
                  <td>{r.in ? <span className="badge b-green"><Clock size={11} /> {r.in}</span> : "—"}</td>
                  <td><span className={`badge ${statusCls[r.status]}`}>{r.status}</span></td>
                  <td>
                    <span className="att-acts">
                      <button className={`a-p ${r.status === "Present" ? "on" : ""}`} title="Mark Present" onClick={() => mark(r, "Present")}>P</button>
                      <button className={`a-l ${r.status === "Leave" ? "on" : ""}`} title="Mark Leave" onClick={() => mark(r, "Leave")}>L</button>
                      <button className={`a-a ${r.status === "Absent" ? "on" : ""}`} title="Mark Absent" onClick={() => mark(r, "Absent")}>A</button>
                      <button className="a-e" title="Edit in Add Attendance" aria-label="Edit" onClick={() => nav(`/attendance/add?emp=${r.id}&date=${iso}`)}><Pencil size={14} /></button>
                    </span>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={6} className="empty">No employees</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------------- Add attendance ---------------- */
export function AddAttendance() {
  useAttendanceVersion();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [f, setF] = useState(() => {
    const emp = params.get("emp") || staff[0].id;
    const date = params.get("date") || todayIso();
    const cur = getRecord(staff.find((s) => s.id === emp) || staff[0], date);
    return { emp, date, status: cur?.status || "Present", in: cur?.in || "", out: cur?.out || "", remarks: cur?.remarks || "" };
  });
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const load = (emp, date) => {
    const cur = getRecord(staff.find((s) => s.id === emp), date);
    return { emp, date, status: cur?.status || "Present", in: cur?.in || "", out: cur?.out || "", remarks: cur?.remarks || "" };
  };
  const set = (k, v) => setF((p) => (k === "emp" || k === "date" ? load(k === "emp" ? v : p.emp, k === "date" ? v : p.date) : { ...p, [k]: v }));

  const save = (e) => {
    e.preventDefault();
    if (!f.date) return setErr("Select a date");
    if (f.date > todayIso()) return setErr("Attendance cannot be marked for a future date");
    setErr("");
    setRecord(f.emp, f.date, { status: f.status, in: f.status === "Present" ? f.in || nowTime() : "", out: f.status === "Present" ? f.out : "", remarks: f.remarks });
    setToast("Attendance saved");
    setTimeout(() => setToast(""), 2200);
  };

  const dayRows = staff.map((s) => ({ ...s, rec: getRecord(s, f.date) }));

  return (
    <div className="att-add-grid">
      <form className="panel" onSubmit={save} noValidate>
        <h3 className="att-h"><CalendarDays size={17} /> Add Attendance</h3>
        {err && <div className="err" style={{ marginBottom: 10 }}>{err}</div>}
        <div className="zf att-f"><label>Employee<span className="zreq">*</span></label><StaffSelect value={f.emp} onChange={(v) => set("emp", v)} /></div>
        <div className="zrow2 att-f">
          <div className="zf"><label>Date<span className="zreq">*</span></label><input type="date" max={todayIso()} value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
          <div className="zf"><label>Status<span className="zreq">*</span></label>
            <select value={f.status} onChange={(e) => set("status", e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
        </div>
        {f.status === "Present" && (
          <div className="zrow2 att-f">
            <div className="zf"><label>Check-in</label><input value={f.in} placeholder="09:00 AM" onChange={(e) => set("in", e.target.value)} /></div>
            <div className="zf"><label>Check-out</label><input value={f.out} placeholder="06:00 PM" onChange={(e) => set("out", e.target.value)} /></div>
          </div>
        )}
        <div className="zf att-f"><label>Remarks</label><input value={f.remarks} placeholder="Optional note" onChange={(e) => set("remarks", e.target.value)} /></div>
        <div className="att-form-btns">
          <button className="btn" type="submit"><Save size={15} /> Save Attendance</button>
          <button className="btn outline" type="button" onClick={() => nav("/attendance/today")}>Back to Today</button>
        </div>
        {toast && <div className="hint" style={{ marginTop: 10 }}><Check size={13} style={{ verticalAlign: -2 }} /> {toast}</div>}
      </form>

      <div className="panel">
        <h3 className="att-h"><Users size={17} /> Everyone on {new Date(`${f.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Status</th><th>In</th><th>Out</th></tr></thead>
            <tbody>
              {dayRows.map((r) => (
                <tr key={r.id} className={r.id === f.emp ? "att-sel" : ""} onClick={() => set("emp", r.id)} style={{ cursor: "pointer" }}>
                  <td><b>{r.name}</b><small className="att-sub">{r.role}</small></td>
                  <td>{r.rec ? <span className={`badge ${statusCls[r.rec.status]}`}>{r.rec.status}</span> : "—"}</td>
                  <td>{r.rec?.in || "—"}</td><td>{r.rec?.out || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Month attendance (table format, month + year dropdowns) ---------------- */
export function MonthAttendance() {
  useAttendanceVersion();
  const now = new Date();
  const [m, setM] = useState(now.getMonth() + 1);
  const [y, setY] = useState(now.getFullYear());
  const years = Array.from({ length: 7 }, (_, i) => now.getFullYear() - 5 + i);
  const isos = monthDates(y, m);

  const data = staff.map((s) => {
    const cells = isos.map((iso) => { const r = getRecord(s, iso); return r ? CODE[r.status] : ""; });
    const c = (k) => cells.filter((x) => x === k).length;
    return { ...s, cells, P: c("P"), A: c("A"), L: c("L") };
  });

  return (
    <div className="panel">
      <div className="att-month-top">
        <h3><CalendarDays size={17} /> Monthly Attendance</h3>
        <select className="att-input" value={m} onChange={(e) => setM(Number(e.target.value))} aria-label="Month">
          {MONTHS.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
        </select>
        <select className="att-input" value={y} onChange={(e) => setY(Number(e.target.value))} aria-label="Year">
          {years.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <Legend />
      </div>
      <div className="att-scroll">
        <table className="att-table">
          <thead>
            <tr>
              <th className="sticky">Employee</th>
              {isos.map((_, d) => <th key={d}>{d + 1}</th>)}
              <th>P</th><th>A</th><th>L</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td className="sticky"><b>{r.name}</b><small>{r.role}</small></td>
                {r.cells.map((c, i) => <td key={i}><i className={`att-cell c-${c || "none"}`}>{c}</i></td>)}
                <td className="tot g">{r.P}</td><td className="tot r">{r.A}</td><td className="tot o">{r.L}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
