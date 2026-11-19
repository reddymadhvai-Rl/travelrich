import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, IndianRupee, Wallet, ArrowDownToLine, Receipt, X, Download } from "lucide-react";
import { paymentHistory, bookings } from "../data.js";
import { usePagination } from "../components/Pagination.jsx";
import SearchBar from "../components/SearchBar.jsx";
import SearchSelect from "../components/SearchSelect.jsx";
import DateField from "../components/DateField.jsx";

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
  const [showFilters, setShowFilters] = useState(false);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return paymentHistory
      .map((r) => ({ ...r, iso: toIso(r.date) }))
      .filter((r) => (!from || r.iso >= from) && (!to || r.iso <= to) && (!booking || r.booking === booking) && (!mode || r.mode === mode))
      .filter((r) => !t || JSON.stringify(r).toLowerCase().includes(t))
      .sort((a, b) => b.iso.localeCompare(a.iso) || b.id.localeCompare(a.id));
  }, [from, to, booking, mode, q]);

  const { rows: pageRows, pager } = usePagination(rows);
  const activeFilters = [from, to, booking, mode].filter(Boolean).length;
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
        <div className="zbar">
          <div className="zbar-l" />
          <div className="zbar-r">
            <SearchBar value={q} onSearch={setQ} placeholder="Search customer, ref…" filterOpen={showFilters} filterCount={activeFilters} onFilter={() => setShowFilters((v) => !v)} />
          </div>
        </div>
        {showFilters && (
          <div className="zfpanel">
            <div className="zfpanel-head"><span>Filters</span>
              <button type="button" className="zbtn ghost" onClick={() => setShowFilters(false)}><X size={14} /> Close</button>
            </div>
            <div className="zfpanel-grid">
              <div className="zfl"><span className="zfl-t">Date</span>
                <span className="zfpanel-range">
                  <DateField value={from} max={to || undefined} placeholder="From" onChange={setFrom} />
                  <DateField value={to} min={from || undefined} placeholder="To" onChange={setTo} />
                </span>
              </div>
              <div className="zfl"><span className="zfl-t">Booking</span><SearchSelect value={booking} options={bookings.map((b) => b.id)} placeholder="All" onChange={setBooking} /></div>
              <div className="zfl"><span className="zfl-t">Payment Mode</span><SearchSelect value={mode} options={MODES} placeholder="All" onChange={setMode} /></div>
              <div className="zfpanel-clear">
              <button type="button" className="zbtn ghost" disabled={!activeFilters} onClick={() => { setFrom(""); setTo(""); setBooking(""); setMode(""); }}><X size={14} /> Clear filters</button>
              </div>
            </div>
          </div>
        )}
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
                  <td className="zst"><span className={`zpill ${r.type === "Advance" ? "st-blue" : "st-teal"}`}>{r.type}</span></td>
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
