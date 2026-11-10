import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Car, UserRound, Wifi, WifiOff, CalendarCheck, Navigation,
  Route, Wrench, TriangleAlert, UserX, UserCheck, Wallet, Clock,
  BellRing, ChartPie, ClipboardCheck, CalendarClock, Ban,
  ShieldCheck, BadgeCheck, Wind, FileText, Landmark, MapPin,
  User, CheckCircle2, Hourglass, ArrowUpRight, TrendingUp, Plus, Sun, ArrowUp, ArrowDown, Receipt, BarChart3,
} from "lucide-react";
import {
  drivers, bookings, payments,
  importantAlerts, onLeaveToday, attendanceToday, breakdownsToday,
} from "../data.js";
import { useVehicles } from "../vehicleStore.js";

const initials = (n) => String(n).split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

/* one blue colour for the Sales & Expenses bar graph */
const BAR_COLOR = "#0a3d8f";

/* ---- small reusable pieces ---- */
// tiny decorative bar sparkline (heights derived from the label so each card differs)
function Spark({ seed }) {
  const bars = Array.from({ length: 8 }, (_, i) => 6 + ((seed * (i + 3) * 7) % 15));
  return (
    <svg className="spark" viewBox="0 0 48 22" aria-hidden="true">
      {bars.map((h, i) => (
        <rect key={i} x={i * 6} y={22 - h} width="4" height={h} rx="2" fill="currentColor" opacity={0.25 + i * 0.1} />
      ))}
    </svg>
  );
}

function Stat({ icon: Icon, tone, value, label, sub }) {
  return (
    <div className={`stat tone-${tone}`}>
      <div className="stat-top">
        <span className="lbl">{label}</span>
        <div className="stat-ico"><Icon size={20} strokeWidth={2.1} /></div>
      </div>
      <div className="num">{value}</div>
      <div className="stat-foot">
        <span className="sub"><TrendingUp size={12} /> {sub}</span>
        <Spark seed={label.length} />
      </div>
    </div>
  );
}

// demo figures: January – December (₹ lakhs per month). Replace with API data.
const monthly = [
  { m: "Jan", sales: 88, expenses: 27 },
  { m: "Feb", sales: 92, expenses: 28 },
  { m: "Mar", sales: 101, expenses: 31 },
  { m: "Apr", sales: 108, expenses: 33 },
  { m: "May", sales: 112, expenses: 34 },
  { m: "Jun", sales: 118, expenses: 36 },
  { m: "Jul", sales: 131, expenses: 40 },
  { m: "Aug", sales: 142, expenses: 43 },
  { m: "Sep", sales: 150, expenses: 45 },
  { m: "Oct", sales: 158, expenses: 47 },
  { m: "Nov", sales: 126, expenses: 38.25 },
  { m: "Dec", sales: 0, expenses: 0 },
];

function PanelHead({ icon: Icon, tone, title, subtitle, count }) {
  return (
    <div className="panel-head">
      <div className={`ph-ico tone-${tone}`}><Icon size={18} /></div>
      <div className="ph-text">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {count !== undefined && <span className="count">{count}</span>}
    </div>
  );
}

const alertIcons = {
  "Insurance": ShieldCheck,
  "Fitness Certificate": BadgeCheck,
  "Pollution (PUC)": Wind,
  "Permit": FileText,
  "Road Tax": Landmark,
  "Service Due": Wrench,
};

function severity(days) {
  if (days < 0) return { tone: "red", text: `Expired ${Math.abs(days)}d ago` };
  if (days <= 7) return { tone: "red", text: `${days} days left` };
  if (days <= 15) return { tone: "amber", text: `${days} days left` };
  return { tone: "blue", text: `${days} days left` };
}

/* badge colour for a booking status */
const bookingBadge = (s) =>
  ({ Ongoing: "b-green", Confirmed: "b-blue", Pending: "b-amber", Completed: "b-green", Cancelled: "b-red" }[s] || "b-blue");

/* current state of a vehicle for the Bookings & Vehicles panel */
const vehicleState = (v) =>
  v.trip === "On Trip" ? { text: "On Trip", cls: "b-green" }
  : v.status === "Booked" ? { text: "Booked", cls: "b-amber" }
  : { text: "Available", cls: "b-blue" };

/* Animated banner illustration: bus driving on a road, clouds + trees passing by */
function BusIllustration() {
  return (
    <svg viewBox="0 0 360 170" className="banner-art" aria-hidden="true">
      <circle cx="302" cy="34" r="20" fill="#fde68a" opacity=".9" className="sun" />
      <g className="cloud c1" fill="#fff" opacity=".55"><ellipse cx="60" cy="38" rx="26" ry="10" /><ellipse cx="80" cy="32" rx="18" ry="9" /></g>
      <g className="cloud c2" fill="#fff" opacity=".4"><ellipse cx="210" cy="60" rx="22" ry="8" /><ellipse cx="226" cy="55" rx="14" ry="7" /></g>
      <g className="trees">
        <g transform="translate(0 0)"><rect x="40" y="100" width="4" height="16" fill="#0b3b2e" /><circle cx="42" cy="96" r="12" fill="#10b981" /></g>
        <g transform="translate(150 0)"><rect x="40" y="104" width="4" height="12" fill="#0b3b2e" /><circle cx="42" cy="100" r="9" fill="#34d399" /></g>
        <g transform="translate(300 0)"><rect x="40" y="100" width="4" height="16" fill="#0b3b2e" /><circle cx="42" cy="96" r="12" fill="#10b981" /></g>
        <g transform="translate(450 0)"><rect x="40" y="104" width="4" height="12" fill="#0b3b2e" /><circle cx="42" cy="100" r="9" fill="#34d399" /></g>
      </g>
      <rect x="0" y="130" width="360" height="40" fill="#0f2742" opacity=".55" />
      <path className="road" d="M0 150h720" stroke="rgba(255,255,255,.7)" strokeWidth="3" strokeDasharray="16 14" />
      <g className="bus-body">
        <g transform="translate(96 62)">
          <rect x="0" y="0" width="170" height="64" rx="14" fill="#fff" />
          <rect x="0" y="40" width="170" height="10" fill="#f59e0b" />
          <rect x="14" y="10" width="26" height="22" rx="4" fill="#bae6fd" />
          <rect x="46" y="10" width="26" height="22" rx="4" fill="#bae6fd" />
          <rect x="78" y="10" width="26" height="22" rx="4" fill="#bae6fd" />
          <rect x="110" y="10" width="26" height="22" rx="4" fill="#bae6fd" />
          <rect x="142" y="10" width="20" height="30" rx="4" fill="#7dd3fc" />
          <circle cx="166" cy="54" r="3.5" fill="#fde047" />
          <g className="wheel" style={{ transformOrigin: "38px 66px" }}><circle cx="38" cy="66" r="12" fill="#0f2742" /><circle cx="38" cy="66" r="5" fill="#cbd5e1" /><path d="M38 58v16M30 66h16" stroke="#64748b" strokeWidth="2" /></g>
          <g className="wheel" style={{ transformOrigin: "132px 66px" }}><circle cx="132" cy="66" r="12" fill="#0f2742" /><circle cx="132" cy="66" r="5" fill="#cbd5e1" /><path d="M132 58v16M124 66h16" stroke="#64748b" strokeWidth="2" /></g>
        </g>
      </g>
    </svg>
  );
}

export default function Dashboard() {
  const vehicles = useVehicles();
  const [tab, setTab] = useState("present");
  const [bvTab, setBvTab] = useState("bookings"); // Bookings & Vehicles panel tab
  const [bkTab, setBkTab] = useState("sales"); // Sales / Expenses panel tab
  const nav = useNavigate();

  const totalVehicles = vehicles.length;
  const online = vehicles.filter((v) => v.gpsStatus === "Active").length;
  const onTrip = vehicles.filter((v) => v.trip === "On Trip").length;
  const booked = vehicles.filter((v) => v.status === "Booked" && v.trip !== "On Trip").length;
  const noBooking = totalVehicles - onTrip - booked;
  const todayTrips = bookings.filter((b) => b.status === "Ongoing").length;
  const pending = payments.filter((p) => p.status !== "Paid").reduce((s, p) => s + p.amount, 0);

  // Bookings & Vehicles panel data
  const activeBookings = bookings
    .filter((b) => b.status !== "Completed" && b.status !== "Cancelled")
    .slice(0, 5);
  const vehicleRows = vehicles.slice(0, 5);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const row1 = [
    { icon: Car, tone: "blue", value: totalVehicles, label: "Total Vehicles", sub: "Fleet size" },
    { icon: UserRound, tone: "violet", value: drivers.length, label: "Total Drivers", sub: "Registered" },
    { icon: Wifi, tone: "green", value: online, label: "Online Vehicles", sub: "Live tracking" },
    { icon: WifiOff, tone: "slate", value: totalVehicles - online, label: "Offline Vehicles", sub: "Not reporting" },
    { icon: CalendarCheck, tone: "teal", value: bookings.length, label: "Total Bookings", sub: "All time" },
  ];
  const row2 = [
    { icon: Route, tone: "cyan", value: onTrip, label: "Vehicles On Trip", sub: "Running now" },
    { icon: Navigation, tone: "amber", value: todayTrips, label: "Today's Trips", sub: "In progress" },
    { icon: TriangleAlert, tone: "red", value: breakdownsToday.length, label: "Today's Breakdowns", sub: "Reported today" },
    { icon: UserX, tone: "pink", value: onLeaveToday.length, label: "Employees On Leave", sub: "Today" },
    { icon: Wallet, tone: "emerald", value: "₹" + pending.toLocaleString("en-IN"), label: "Pending Payments", sub: "To collect" },
  ];

  const pie = [
    { name: "On Trip", value: onTrip, color: "#0a3d8f", icon: Route },
    { name: "Booked", value: booked, color: "#f26b00", icon: CalendarClock },
    { name: "No Booking", value: noBooking, color: "#94a3b8", icon: Ban },
  ];

  const list = tab === "present" ? attendanceToday.present : attendanceToday.leave;

  return (
    <>
      {/* Welcome banner */}
      <section className="banner">
        <div className="banner-text">
          <span className="banner-chip"><Sun size={13} /> {greet}, Admin</span>
          <div className="banner-info">
            <h2>Your fleet at a glance</h2>
            <p>
              {online} of {totalVehicles} vehicles online · {onTrip} on trip ·{" "}
              {importantAlerts.filter((a) => a.daysLeft <= 7).length} urgent alerts need attention.
            </p>
          </div>
          <div className="banner-actions">
            <button className="btn light" onClick={() => nav("/bookings", { state: { openNew: true } })}><Plus size={15} /> New Booking</button>
            <button className="btn outline" onClick={() => nav("/tracking")}><MapPin size={15} /> Live Tracking</button>
          </div>
        </div>
        <BusIllustration />
      </section>

      <div className="stat-grid">{row1.map((s) => <Stat key={s.label} {...s} />)}</div>
      <div className="stat-grid">{row2.map((s) => <Stat key={s.label} {...s} />)}</div>

      <div className="grid-2">
        {/* Important vehicle alerts */}
        <div className="panel">
          <PanelHead icon={BellRing} tone="red" title="Important Vehicle Alerts"
            subtitle="Documents & services due soon" count={importantAlerts.length} />
          <div className="table-wrap">
            <table>
              <thead><tr><th>Vehicle</th><th>Alert</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {importantAlerts.map((a) => {
                  const Icon = alertIcons[a.type] || FileText;
                  const sev = severity(a.daysLeft);
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="cell-flex">
                          <span className="mini-ico tone-blue"><Car size={15} /></span>
                          <b>{a.vehicle}</b>
                        </div>
                      </td>
                      <td>
                        <div className="cell-flex">
                          <span className={`mini-ico tone-${sev.tone}`}><Icon size={15} /></span>
                          {a.type}
                        </div>
                      </td>
                      <td>{a.expiry}</td>
                      <td><span className={`badge dot b-${sev.tone}`}>{sev.text}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle trips pie chart */}
        <div className="panel">
          <PanelHead icon={ChartPie} tone="teal" title="Vehicle Trips" subtitle="Total vehicles vs bookings" />
          <div className="donut">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4} stroke="none">
                  {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <Car size={20} />
              <b>{totalVehicles}</b>
              <span>Total Vehicles</span>
            </div>
          </div>
          <div className="legend-list">
            {pie.map((p) => {
              const Icon = p.icon;
              return (
                <div className="legend-row" key={p.name}>
                  <span className="mini-ico" style={{ background: p.color + "22", color: p.color }}><Icon size={15} /></span>
                  <span className="l-name">{p.name}</span>
                  <b>{p.value}</b>
                  <span className="l-pct">{Math.round((p.value / totalVehicles) * 100)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid-3">
        {/* Bookings & vehicles (replaces Today On Leave) */}
        <div className="panel">
          <PanelHead icon={CalendarCheck} tone="teal" title="Bookings & Vehicles"
            subtitle="Active bookings and fleet status"
            count={bvTab === "bookings" ? activeBookings.length : vehicles.length} />
          <div className="tabs">
            <button className={bvTab === "bookings" ? "on" : ""} onClick={() => setBvTab("bookings")}>
              <CalendarCheck size={15} /> Bookings ({activeBookings.length})
            </button>
            <button className={bvTab === "vehicles" ? "on" : ""} onClick={() => setBvTab("vehicles")}>
              <Car size={15} /> Vehicles ({vehicles.length})
            </button>
          </div>

          {bvTab === "bookings" ? (
            activeBookings.length === 0 ? <div className="empty">No active bookings</div> :
              activeBookings.map((b, i) => {
                const customer = b.customer ?? b.customerName ?? b.name ?? "Customer";
                const from = b.from ?? b.pickup ?? "—";
                const to = b.to ?? b.drop ?? "—";
                return (
                  <div className="person" key={b.id ?? i}>
                    <div className="pic tone-teal">{initials(customer)}</div>
                    <div className="meta">
                      <b>{customer}</b>
                      <span><MapPin size={11} /> {from} → {to}</span>
                      <span><Car size={11} /> {b.vehicle ?? b.vehicleNo ?? "Not assigned"}{b.date ? ` · ${b.date}` : ""}</span>
                    </div>
                    <span className={`badge ${bookingBadge(b.status)}`}>{b.status}</span>
                  </div>
                );
              })
          ) : (
            vehicleRows.map((v, i) => {
              const st = vehicleState(v);
              return (
                <div className="person" key={v.id ?? i}>
                  <div className="pic tone-blue"><Car size={16} /></div>
                  <div className="meta">
                    <b>{v.number ?? v.regNo ?? v.vehicleNo ?? v.name}</b>
                    <span>{v.model ?? v.type ?? "Vehicle"}{v.driver ? ` · ${v.driver}` : ""}</span>
                    <span>
                      {v.gpsStatus === "Active" ? <Wifi size={11} /> : <WifiOff size={11} />}{" "}
                      {v.gpsStatus === "Active" ? "Online" : "Offline"}
                    </span>
                  </div>
                  <span className={`badge ${st.cls}`}>{st.text}</span>
                </div>
              );
            })
          )}

          <button className="btn outline" style={{ width: "100%", marginTop: 10 }}
            onClick={() => nav(bvTab === "bookings" ? "/bookings" : "/vehicles")}>
            View all {bvTab === "bookings" ? "bookings" : "vehicles"} <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Today attendance */}
        <div className="panel">
          <PanelHead icon={ClipboardCheck} tone="green" title="Today Attendance" subtitle="Present & on leave" />
          <div className="tabs">
            <button className={tab === "present" ? "on" : ""} onClick={() => setTab("present")}>
              <UserCheck size={15} /> Present ({attendanceToday.present.length})
            </button>
            <button className={tab === "leave" ? "on" : ""} onClick={() => setTab("leave")}>
              <UserX size={15} /> On Leave ({attendanceToday.leave.length})
            </button>
          </div>
          {list.map((p) => (
            <div className="person" key={p.id}>
              <div className={`pic tone-${tab === "leave" ? "pink" : "green"}`}>{initials(p.name)}</div>
              <div className="meta"><b>{p.name}</b><span>{p.role} · {p.phone}</span></div>
              {tab === "present"
                ? <span className="badge b-green"><Clock size={11} /> {p.time}</span>
                : <span className="badge b-red">Leave</span>}
            </div>
          ))}
        </div>

        {/* Sales + Expenses */}
        <div className="panel">
          <PanelHead icon={BarChart3} tone="green" title="Sales & Expenses" subtitle="January – December (₹ lakhs)" />
          <div className="tabs">
            <button className={bkTab === "sales" ? "on" : ""} onClick={() => setBkTab("sales")}><TrendingUp size={15} /> Sales</button>
            <button className={bkTab === "expenses" ? "on" : ""} onClick={() => setBkTab("expenses")}><Receipt size={15} /> Expenses</button>
          </div>

          <div className="mini-chart">
            <ResponsiveContainer>
              <BarChart data={monthly} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barCategoryGap="22%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5eaf1" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={10} interval={0} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip cursor={{ fill: "rgba(0,29,81,.06)" }} formatter={(v) => [`₹ ${v} L`, bkTab === "sales" ? "Sales" : "Expenses"]} />
                <Bar dataKey={bkTab} fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}