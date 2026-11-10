import { useMemo, useState } from "react";
import { UserCheck, UserX, UserMinus, Users, CalendarDays, Clock } from "lucide-react";
import { staff, attendanceToday } from "../data.js";

const initials = (n) => String(n).split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
const pad = (n) => String(n).padStart(2, "0");

/* ---------------- Today ---------------- */
export function TodayAttendance() {
  const [rows, setRows] = useState(() =>
    staff.map((s) => {
      const p = attendanceToday.present.find((x) => x.name === s.name);
      const l = attendanceToday.leave.find((x) => x.name === s.name);
      return { ...s, status: p ? "Present" : l ? "Leave" : "Absent", time: p ? p.time : "" };
    })
  );
  const [filter, setFilter] = useState("All");
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const setStatus = (id, status) =>
    setRows((p) => p.map((r) => r.id === id ? {
      ...r, status,
      time: status === "Present" ? (r.time || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })) : "",
    } : r));

  const count = (s) => rows.filter((r) => r.status === s).length;
  const cards = [
    { label: "Total Staff", value: rows.length, icon: Users, cls: "fin-blue" },
    { label: "Present", value: count("Present"), icon: UserCheck, cls: "fin-green" },
    { label: "On Leave", value: count("Leave"), icon: UserMinus, cls: "fin-peach" },
    { label: "Absent", value: count("Absent"), icon: UserX, cls: "fin-lav" },
  ];
  const list = rows.filter((r) => filter === "All" || r.status === filter);

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
        <div className="tabs">
          {["All", "Present", "Leave", "Absent"].map((f) => (
            <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f} ({f === "All" ? rows.length : count(f)})</button>
          ))}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Role</th><th>Phone</th><th>Check-in</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td><div className="cell-flex"><span className="pic tone-teal att-pic">{initials(r.name)}</span><b>{r.name}</b></div></td>
                  <td>{r.role}</td>
                  <td>{r.phone}</td>
                  <td>{r.time ? <span className="badge b-green"><Clock size={11} /> {r.time}</span> : "—"}</td>
                  <td>
                    <select className={`att-select s-${r.status}`} value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                      <option>Present</option><option>Leave</option><option>Absent</option>
                    </select>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={5} className="empty">No employees</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------------- Month ---------------- */
// deterministic demo data (P / A / L / W=weekly off). Replace with API data.
function mark(empIdx, day, dow) {
  if (dow === 0) return "W";
  const x = (empIdx * 31 + day * 17) % 23;
  return x === 0 ? "A" : x === 1 || x === 2 ? "L" : "P";
}

export function MonthAttendance() {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`);
  const [y, m] = month.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const isCurrent = y === now.getFullYear() && m === now.getMonth() + 1;
  const isFuture = new Date(y, m - 1, 1) > now;

  const data = useMemo(() => staff.map((s, i) => {
    const cells = Array.from({ length: days }, (_, d) => {
      const date = new Date(y, m - 1, d + 1);
      if (isFuture || (isCurrent && d + 1 > now.getDate())) return "";
      return mark(i, d + 1, date.getDay());
    });
    const c = (k) => cells.filter((x) => x === k).length;
    return { ...s, cells, P: c("P"), A: c("A"), L: c("L") };
  }), [month]); // eslint-disable-line

  return (
    <div className="panel">
      <div className="att-month-top">
        <h3><CalendarDays size={17} /> Monthly Attendance</h3>
        <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        <div className="att-legend">
          <span><i className="c-P">P</i> Present</span><span><i className="c-A">A</i> Absent</span>
          <span><i className="c-L">L</i> Leave</span><span><i className="c-W">W</i> Weekly off</span>
        </div>
      </div>
      <div className="att-scroll">
        <table className="att-table">
          <thead>
            <tr>
              <th className="sticky">Employee</th>
              {Array.from({ length: days }, (_, d) => <th key={d}>{d + 1}</th>)}
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
