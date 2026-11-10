import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Car, UserRound, CalendarCheck, Receipt, CreditCard, MapPin,
  Users, KeyRound, LogOut, Menu, Plane, Search, Bell, CalendarDays, Mic, X,
  ChevronDown, User, Settings, ShieldCheck, TriangleAlert, UserX, Wallet,
  Globe, Clock, CheckCheck, Wrench, List, Plus, Tag, ClipboardCheck, UserCheck, MoreVertical, Printer, RefreshCw, Home,
} from "lucide-react";
import { drivers, bookings } from "../data.js";
import { useVehicles } from "../vehicleStore.js";
import logo from "../assets/travel-rich-logo.png";

// const items = [
//   { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
//   { to: "/vehicles", label: "Vehicles", icon: Car },
//   { to: "/drivers", label: "Drivers", icon: UserRound },
//   { to: "/bookings", label: "Bookings", icon: CalendarCheck },
//   { to: "/expenses", label: "Expenses", icon: Receipt },
//   { to: "/payments", label: "Payments", icon: CreditCard },
//   { to: "/tracking", label: "Tracking", icon: MapPin },
//   { to: "/users", label: "Users", icon: Users },
//   { to: "/change-password", label: "Change Password", icon: KeyRound },
// ];
const manageAdd = (base, singular, addTo) => [
  { label: `Manage ${base.label}`, to: base.to, icon: List },
  { label: `Add ${singular}`, to: addTo || base.to, icon: Plus, add: !addTo },
];

// sidebar structure: groups get a dropdown (Manage / Add); Users & others stay single links
const menu = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { label: "Vehicles", icon: Car, children: manageAdd({ label: "Vehicles", to: "/vehicles" }, "Vehicle", "/vehicles/new") },
  { label: "Drivers", icon: UserRound, children: manageAdd({ label: "Drivers", to: "/drivers" }, "Driver") },
  { label: "Bookings", icon: CalendarCheck, children: manageAdd({ label: "Bookings", to: "/bookings" }, "Booking") },
  {
    label: "Expenses", icon: Receipt, children: [
      { label: "Expense Heads", to: "/expense-heads", icon: Tag },
      { label: "Manage Expenses", to: "/expenses", icon: List },
      { label: "Add Expense", to: "/expenses", icon: Plus, add: true },
    ],
  },
  { label: "Payments", icon: CreditCard, children: manageAdd({ label: "Payments", to: "/payments" }, "Payment") },
  { to: "/tracking", label: "Tracking", icon: MapPin },
  {
    label: "Attendance", icon: ClipboardCheck, children: [
      { label: "Today Attendance", to: "/attendance/today", icon: UserCheck },
      { label: "Month Attendance", to: "/attendance/month", icon: CalendarDays },
    ],
  },
  { to: "/users", label: "Users", icon: Users },
  { to: "/change-password", label: "Change Password", icon: KeyRound },
];
// flat list of real pages (for search + page title)
const items = menu.flatMap((m) => (m.children ? m.children.filter((c) => !c.add) : [m]));

const initialNotifs = [
  { id: 1, tone: "red", icon: ShieldCheck, title: "Insurance expired", text: "TS 10 UC 3344 insurance expired 3 days ago.", time: "10 min ago", unread: true },
  { id: 2, tone: "red", icon: TriangleAlert, title: "Vehicle breakdown", text: "TS 06 UH 1100 – engine overheating at Shamshabad ORR.", time: "35 min ago", unread: true },
  { id: 3, tone: "pink", icon: UserX, title: "Employee on leave", text: "Anil Yadav and Kiran Kumar are on leave today.", time: "2 hrs ago", unread: true },
  { id: 4, tone: "amber", icon: Wrench, title: "Fitness certificate due", text: "TS 08 UB 4521 fitness expires in 4 days.", time: "3 hrs ago", unread: false },
  { id: 5, tone: "emerald", icon: Wallet, title: "Payment pending", text: "BK-1023 – TechNova Pvt Ltd ₹4,200 is pending.", time: "Yesterday", unread: false },
];

function useOutside(ref, onOutside) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && onOutside();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onOutside]);
}

/* ---------- Google-style search bar ---------- */
function GoogleSearch() {
  const vehicles = useVehicles();
  const nav = useNavigate();
  const ref = useRef(null);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [idx, setIdx] = useState(-1);
  useOutside(ref, () => setFocus(false));

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const pool = [
      ...items.map((i) => ({ label: i.label, kind: "Page", to: i.to, icon: i.icon })),
      ...vehicles.map((v) => ({ label: `${v.regNo} – ${v.type}`, kind: "Vehicle", to: "/vehicles", icon: Car })),
      ...drivers.map((d) => ({ label: d.name, kind: "Driver", to: "/drivers", icon: UserRound })),
      ...bookings.map((b) => ({ label: `${b.id} – ${b.customer}`, kind: "Booking", to: "/bookings", icon: CalendarCheck })),
    ];
    return pool.filter((r) => r.label.toLowerCase().includes(t)).slice(0, 6);
  }, [q, vehicles]);

  const go = (r) => {
    nav(r.to);
    setQ("");
    setFocus(false);
  };
  const google = () => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank", "noopener");
    setFocus(false);
  };

  const rows = q.trim() ? [...results, { web: true }] : [];

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, rows.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && rows.length) {
      const r = rows[idx >= 0 ? idx : 0];
      r.web ? google() : go(r);
    } else if (e.key === "Escape") setFocus(false);
  };

  return (
    <div ref={ref} className={`gsearch ${focus ? "focus" : ""} ${focus && rows.length ? "has-results" : ""}`}>
      <div className="gsearch-box">
        <Search size={18} />
        <input
          value={q}
          placeholder="Search vehicles, drivers, bookings or Google..."
          onFocus={() => setFocus(true)}
          onChange={(e) => { setQ(e.target.value); setIdx(-1); }}
          onKeyDown={onKey}
        />
        {q && <button className="clear" onClick={() => setQ("")}><X size={18} /></button>}
        <Mic size={18} className="mic" />
      </div>
      {focus && rows.length > 0 && (
        <div className="gsearch-list">
          {rows.map((r, i) =>
            r.web ? (
              <button key="web" className={`gsearch-item web ${idx === i ? "on" : ""}`} onClick={google}>
                <Globe size={17} className="g-ico" /> Search Google for “{q}”
              </button>
            ) : (
              <button key={r.kind + r.label} className={`gsearch-item ${idx === i ? "on" : ""}`} onClick={() => go(r)}>
                <r.icon size={17} className="g-ico" /> {r.label} <small>{r.kind}</small>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Notifications dropdown ---------- */
function Notifications() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(initialNotifs);
  useOutside(ref, () => setOpen(false));
  const unread = list.filter((n) => n.unread).length;

  return (
    <div className="dd" ref={ref}>
      <button className="icon-round" title="Notifications" onClick={() => setOpen(!open)}>
        <Bell size={18} />
        {unread > 0 && (
          <span className="notif-badge" aria-label={`${unread} unread notifications`}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="dd-panel notif-panel">
          <div className="dd-head">
            <h4>Notifications {unread > 0 && <span className="count">{unread} new</span>}</h4>
            <button className="link-btn" onClick={() => setList(list.map((n) => ({ ...n, unread: false })))}>
              <CheckCheck size={14} style={{ verticalAlign: -3 }} /> Mark all read
            </button>
          </div>
          <div className="notif-list">
            {list.map((n) => (
              <div key={n.id} className={`notif ${n.unread ? "unread" : ""}`}
                onClick={() => setList(list.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}>
                <span className={`mini-ico tone-${n.tone}`}><n.icon size={16} /></span>
                <div className="n-body">
                  <b>{n.title}</b>
                  <p>{n.text}</p>
                  <span><Clock size={11} /> {n.time}</span>
                </div>
                {n.unread && <i className="n-dot" />}
              </div>
            ))}
          </div>
          <div className="dd-foot">
            <button className="link-btn" onClick={() => setList([])}>Clear all</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Profile dropdown ---------- */
function ProfileMenu({ onLogout }) {
  const ref = useRef(null);
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  useOutside(ref, () => setOpen(false));
  const go = (to) => { setOpen(false); nav(to); };

  return (
    <div className="dd" ref={ref}>
      <button className="user-btn" onClick={() => setOpen(!open)}>
        <div className="avatar">A</div>
        <div className="who"><b>Admin</b><span>Super Admin</span></div>
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: ".15s" }} />
      </button>
      {open && (
        <div className="dd-panel profile-panel">
          <div className="profile-top">
            <div className="avatar">A</div>
            <div><b>Admin</b><span>admin@travel.com</span></div>
          </div>
          <button className="dd-item" onClick={() => go("/users")}><User size={17} /> My Profile</button>
          <button className="dd-item" onClick={() => go("/change-password")}><KeyRound size={17} /> Change Password</button>
          <button className="dd-item" onClick={() => go("/users")}><Settings size={17} /> Account Settings</button>
          <div className="dd-sep" />
          <button className="dd-item danger" onClick={onLogout}><LogOut size={17} /> Logout</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Sidebar dropdown group ---------- */
function SidebarGroup({ item, close }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const inside = item.children.some((c) => pathname === c.to || pathname.startsWith(c.to + "/"));
  const [open, setOpen] = useState(inside);
  useEffect(() => { if (inside) setOpen(true); }, [inside]);
  const Icon = item.icon;
  return (
    <div className={`menu-group ${open ? "open" : ""}`}>
      <button className={`menu-item group-btn ${inside ? "active" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        <Icon size={17} /> {item.label}
        <ChevronDown size={15} className="chev" />
      </button>
      {open && (
        <div className="submenu">
          {item.children.map((c) => c.add ? (
            <button key={c.label} className="menu-item sub" onClick={() => { close(); nav(c.to, { state: { openNew: true } }); }}>
              <c.icon size={15} /> {c.label}
            </button>
          ) : (
            <NavLink key={c.label} to={c.to} end onClick={close} className={({ isActive }) => `menu-item sub ${isActive ? "active" : ""}`}>
              <c.icon size={15} /> {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Cancel (close page) + 3 dots menu shown on every page ---------- */
function PageActions() {
  const ref = useRef(null);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useOutside(ref, () => setOpen(false));
  if (pathname !== "/tracking") return null;
  return (
    <div className="page-actions">
      <button className="icon-round" title="Cancel / close page" aria-label="Cancel"         onClick={() => (window.history.length > 1 ? nav(-1) : nav("/"))}>
        <X size={18} />
      </button>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const title = (items.find((i) => pathname === i.to) || items.find((i) => i.to !== "/" && pathname.startsWith(i.to)))?.label || "Dashboard";

  const logout = () => {
    localStorage.removeItem("travel_admin_auth");
    nav("/login");
  };

  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="app">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand-plate">
          <img src={logo} alt="Travel Rich" />
          <small>Fleet Admin Panel</small>
        </div>
        <nav className="menu">
          <div className="menu-label">Main Menu</div>
          {menu.map((m) => m.children ? (
            <SidebarGroup key={m.label} item={m} close={() => setOpen(false)} />
          ) : (
            <NavLink key={m.to} to={m.to} end={m.end} onClick={() => setOpen(false)}
              className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
              <m.icon size={17} /> {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="menu-foot">
          <button onClick={logout}><LogOut size={17} /> Logout</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="burger" onClick={() => setOpen(!open)}><Menu /></button>
            <h1>{title}</h1>
            <PageActions />
          </div>
          <GoogleSearch />
          <div className="right">
            <span className="date-chip"><CalendarDays size={15} /> {today}</span>
            <Notifications />
            <ProfileMenu onLogout={logout} />
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}