import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, IndianRupee, Wallet, ArrowDownToLine, Receipt, X, Download } from "lucide-react";
import { paymentHistory, bookings } from "../data.js";
import { usePagination } from "../components/Pagination.jsx";

const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");
const pad = (n) => String(n).padStart(2, "0");
const toIso = (v) => { const d = new Date(v); return isNaN(d) ? "" : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const MODES = ["UPI", "Cash", "Bank Transfer", "Cheque", "Card"];

export default function PaymentHistory() {
  const nav = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [booking, setBooking] = useState("");
  const [mode, setMode] = useState("");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return paymentHistory
      .map((r) => ({ ...r, iso: toIso(r.date) }))
      .filter((r) => (!from || r.iso >= from) && (!to || r.iso <= to) && (!booking || r.booking === booking) && (!mode || r.mode === mode))
      .filter((r) => !t || JSON.stringify(r).toLowerCase().includes(t))
      .sort((a, b) => b.iso.localeCompare(a.iso) || b.id.localeCompare(a.id));
  }, [from, to, booking, mode, q]);

  const { rows: pageRows, pager } = usePagination(rows);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const adv = rows.filter((r) => r.type === "Advance").reduce((s, r) => s + r.amount, 0);
  const cards = [
    { label: "Total Received", value: money(total), icon: IndianRupee, cls: "fin-green" },
    { label: "Advances", value: money(adv), icon: ArrowDownToLine, cls: "fin-blue" },
    { label: "Payments", value: money(total - adv), icon: Wallet, cls: "fin-peach" },
    { label: "Transactions", value: rows.length, icon: Receipt, cls: "fin-lav" },
  ];
  const outstanding = bookings.reduce((s, b) => s + b.balance, 0);

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = ["Receipt No", "Date", "Booking", "Customer", "Type", "Mode", "Reference", "Received By", "Amount"];
    const csv = [head.join(","), ...rows.map((r) => [r.id, r.date, r.booking, r.customer, r.type, r.mode, r.ref, r.by, r.amount].map(esc).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "payment-history.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="zpage">
      <div className="zhead">
        <p>Every advance and payment received against bookings. Outstanding balance across bookings: <b>{money(outstanding)}</b></p>
        <div className="zhead-r">
          <button className="zbtn ghost" onClick={exportCsv}><Download size={15} /> Export CSV</button>
          <button className="zbtn ghost" onClick={() => nav("/payments")}><ArrowLeft size={15} /> Manage Payments</button>
        </div>
      </div>

      <div className="att-cards">
        {cards.map((c) => (
          <div className={`fin-card ${c.cls}`} key={c.label}>
            <span className="fin-lbl">{c.label}</span>
            <div className="fin-row"><b className="fin-num">{c.value}</b><span className="fin-ico"><c.icon size={18} /></span></div>
          </div>
        ))}
      </div>

      <div className="zcard">
        <div className="zfilters">
          <label>From date<input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></label>
          <label>To date<input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></label>
          <label>Booking
            <select value={booking} onChange={(e) => setBooking(e.target.value)}><option value="">All</option>{bookings.map((b) => <option key={b.id}>{b.id}</option>)}</select>
          </label>
          <label>Payment Mode
            <select value={mode} onChange={(e) => setMode(e.target.value)}><option value="">All</option>{MODES.map((m) => <option key={m}>{m}</option>)}</select>
          </label>
          <label>Search<input placeholder="Customer, ref…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          {(from || to || booking || mode || q) && <button type="button" className="zbtn ghost" onClick={() => { setFrom(""); setTo(""); setBooking(""); setMode(""); setQ(""); }}><X size={14} /> Clear</button>}
        </div>
        <div className="zscroll">
          <table className="ztable">
            <thead>
              <tr><th><History size={15} />Receipt No</th><th>Date</th><th>Booking</th><th>Customer</th><th>Type</th><th>Mode</th><th>Reference</th><th>Received By</th><th style={{ textAlign: "right" }}>Amount</th></tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td className="idcol"><span className="zchip">{r.id}</span></td>
                  <td>{r.date}</td>
                  <td>{r.booking}</td>
                  <td className="prim"><b>{r.customer}</b></td>
                  <td className={`zst ${r.type === "Advance" ? "st-blue" : "st-teal"}`}>{r.type}</td>
                  <td>{r.mode}</td>
                  <td>{r.ref}</td>
                  <td>{r.by}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{money(r.amount)}</td>
                </tr>
              ))}
              {!rows.length && <tr><td className="zempty" colSpan={9}>No payments found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="zfoot">Entries: <b>{rows.length}</b> &nbsp;·&nbsp; Total: <b>{money(total)}</b></div>
        {pager}
      </div>
    </div>
  );
}
