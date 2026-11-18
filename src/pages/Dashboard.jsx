import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Car, UserRound, Wifi, WifiOff, CalendarCheck, Navigation,
  Route, Wrench, TriangleAlert, UserX, UserCheck, Wallet, Clock,
  BellRing, ChartPie, ClipboardCheck, CalendarClock, Ban,
  ShieldCheck, BadgeCheck, Wind, FileText, Landmark, MapPin,
  User, CheckCircle2, Hourglass, ArrowUpRight, ArrowRight, TrendingUp, Plus, Sun, ArrowUp, ArrowDown, Receipt, BarChart3,
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
function Stat({ icon: Icon, tone, value, label, sub }) {
  return (
    <div className={`stat tone-${tone}`}>
      <svg className="stat-wave" viewBox="0 0 120 50" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50 C25 46 35 14 70 18 C95 21 108 8 120 0 L120 50 Z" fill="currentColor" />
      </svg>
      <div className="stat-body">
        <div className="stat-ico"><Icon size={20} strokeWidth={1.9} /></div>
        <div className="stat-txt">
          <span className="lbl">{label}</span>
          <div className="num">{value}</div>
        </div>
      </div>
      <span className="sub">{sub}</span>
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
      { icon: Route, tone: "cyan", value: onTrip, label: "Vehicles On Trip", sub: "Running now" },
    { icon: Navigation, tone: "amber", value: todayTrips, label: "Today's Trips", sub: "In progress" },
    { icon: TriangleAlert, tone: "red", value: breakdownsToday.length, label: "Today's Breakdowns", sub: "Reported today" },
    { icon: UserX, tone: "pink", value: onLeaveToday.length, label: "Employees On Leave", sub: "Today" },
    { icon: Wallet, tone: "emerald", value: "₹" + pending.toLocaleString("en-IN"), label: "Pending Payments", sub: "To collect" },
  ];
  // const row2 = [
  
  // ];

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
          <span className="banner-chip"><Sun size={20} /> {greet}, Admin</span>
          <div className="banner-info">
            <h2>Your fleet at a Glance</h2>
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
      </section>

      <div className="stat-grid">{row1.map((s) => <Stat key={s.label} {...s} />)}</div>
      {/* <div className="stat-grid">{row2.map((s) => <Stat key={s.label} {...s} />)}</div> */}

      <div className="grid-2">
        {/* Important vehicle alerts */}
        <div className="panel">
          <PanelHead icon={BellRing} tone="red" title="Important Vehicle Alerts"
            subtitle="Documents & services due soon" count={importantAlerts.length} />
          <div className="table-wrap">
            <table>
              <thead><tr><th>Vehicle</th><th>Alert</th><th>Due date</th><th>Status</th></tr></thead>
              <tbody>
                {importantAlerts.map((a) => {
                  const sev = severity(a.daysLeft);
                  return (
                    <tr key={a.id}>
                      <td>{a.vehicle}</td>
                      <td>{a.type}</td>
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
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={68} outerRadius={96} paddingAngle={0} stroke="none">
                  {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <Car size={20} />
              <b>{totalVehicles}</b>
              <span>Vehicles</span>
            </div>
          </div>
          <div className="legend-list">
            {pie.map((p) => (
              <div className="legend-row" key={p.name}>
                <i className="l-dot" style={{ background: p.color }} />
                <span className="l-name">{p.name}</span>
                <b>{p.value}</b>
                <span className="l-pct">{totalVehicles ? Math.round((p.value / totalVehicles) * 100) : 0}%</span>
              </div>
            ))}
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

          <button className="view-all" onClick={() => nav(bvTab === "bookings" ? "/bookings" : "/vehicles")}>
            View all <ArrowRight size={17} />
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
          <button className="view-all" onClick={() => nav("/attendance/today")}>
            View all <ArrowRight size={17} />
          </button>
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
              <BarChart data={monthly} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barCategoryGap="14%">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a7de0" />
                    <stop offset="100%" stopColor="#0657b5" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d7dee9" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={10} interval={0} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} {...(bkTab === "sales" ? { domain: [0, 180], ticks: [0, 40, 80, 120, 160, 180] } : {})} />
                <Tooltip cursor={{ fill: "rgba(0,29,81,.06)" }} formatter={(v) => [`₹ ${v} L`, bkTab === "sales" ? "Sales" : "Expenses"]} />
                <Bar dataKey={bkTab} fill="url(#barGrad)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button className="view-all" onClick={() => nav(bkTab === "sales" ? "/payments" : "/expenses")}>
            View all <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </>
  );
}