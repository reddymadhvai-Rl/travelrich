import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { usePagination } from "../components/Pagination.jsx";
import { ChevronLeft, ChevronRight, Wallet, Users, MinusCircle, IndianRupee, FileText, Printer, ArrowLeft, CircleCheck, Hourglass } from "lucide-react";
import { staff, salaries } from "../data.js";
import { summarize, monthDates, useAttendanceVersion } from "../attendanceStore.js";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* amount in words (Indian system) */
function words(n) {
  n = Math.round(n);
  if (n === 0) return "Zero";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x) => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : ""));
  const three = (x) => (x >= 100 ? a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + two(x % 100) : "") : two(x));
  const parts = [];
  const cr = Math.floor(n / 1e7), lk = Math.floor((n % 1e7) / 1e5), th = Math.floor((n % 1e5) / 1e3), rest = n % 1e3;
  if (cr) parts.push(two(cr) + " Crore");
  if (lk) parts.push(two(lk) + " Lakh");
  if (th) parts.push(two(th) + " Thousand");
  if (rest) parts.push(three(rest));
  return parts.join(" ");
}

/* salary for one employee for a month, based on attendance (Absent = loss of pay; Leave is paid; Sundays are weekly off) */
function calc(emp, y, m) {
  const isos = monthDates(y, m);
  const s = summarize(emp, isos);
  const workingDays = isos.filter((d) => new Date(`${d}T00:00:00`).getDay() !== 0).length;
  const lop = Math.min(s.Absent, workingDays);
  const payDays = workingDays - lop;
  const f = payDays / workingDays;
  const sal = salaries[emp.id];
  const earn = { basic: sal.basic * f, hra: sal.hra * f, allowance: sal.allowance * f };
  const gross = earn.basic + earn.hra + earn.allowance;
  const fullGross = sal.basic + sal.hra + sal.allowance;
  const deductions = sal.pf + sal.tax;
  return { ...s, workingDays, lop, payDays, earn, gross, fullGross, sal, deductions, net: Math.max(0, gross - deductions) };
}

function PayslipView({ emp, y, m }) {
  const c = calc(emp, y, m);
  const lopAmt = c.fullGross - c.gross;
  const lastDay = new Date(y, m, 0).getDate();
  const payDate = `${String(lastDay).padStart(2, "0")} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
  const slipNo = `PS-${y}${String(m).padStart(2, "0")}-${emp.id}`;
  const items = [
    ["Basic Salary", "Monthly basic pay", "Earning", c.sal.basic, c.earn.basic],
    ["HRA", "House rent allowance", "Earning", c.sal.hra, c.earn.hra],
    ["Allowance", "Special allowance", "Earning", c.sal.allowance, c.earn.allowance],
    ["PF", "Provident fund", "Deduction", c.sal.pf, c.sal.pf],
    ["Tax", "Professional / income tax", "Deduction", c.sal.tax, c.sal.tax],
  ];
  return (
    <div className="payslip-page">
        <div className="payslip inv">
          <div className="inv-top">
            <div className="inv-co">
              <h2>Travel Rich Pvt Ltd</h2>
              <p>Plot 12, Madhapur, Hyderabad, Telangana 500081</p>
              <p>Email: info@travelrich.com</p>
              <p>Phone: +91 98480 00002</p>
              <p>GSTIN: 36AABCT1234F1Z5</p>
            </div>
            <div className="inv-to">
              <p><b>Employee:</b> {emp.name}</p>
              <p>Employee ID: {emp.id}</p>
              <p>Designation: {emp.role}</p>
              <p>Phone: {emp.phone}</p>
            </div>
          </div>

          <div className="inv-meta">
            <div>
              <p><b>Payslip No:</b> {slipNo}</p>
              <p><b>Pay Period:</b> {MONTHS[m - 1]} {y}</p>
              <p><b>Pay Date:</b> {payDate}</p>
            </div>
            <div className="r">
              <p><b>Working Days:</b> {c.workingDays}</p>
              <p><b>Paid Days:</b> {c.payDays}</p>
              <p><b>Loss of Pay Days:</b> {c.lop}</p>
            </div>
          </div>

          <table className="inv-table">
            <thead><tr><th>Item</th><th>Description</th><th>Type</th><th>Full Amount (₹)</th><th>Payable (₹)</th></tr></thead>
            <tbody>
              {items.map(([n, d, t, f, v]) => (
                <tr key={n}><td>{n}</td><td>{d}</td><td>{t}</td><td>{money(f)}</td><td>{money(v)}</td></tr>
              ))}
              <tr className="inv-sub"><td colSpan={4}>Gross Earnings</td><td>{money(c.gross)}</td></tr>
            </tbody>
          </table>

          <div className="inv-totals">
            <div><span>Gross Earnings</span><span>{money(c.gross)}</span></div>
            <div><span>Total Deductions (PF + Tax)</span><span>{money(c.deductions)}</span></div>
            <div><span>LOP adjustment (in gross)</span><span>{money(lopAmt)}</span></div>
            <div className="inv-grand"><span>Net Pay</span><span>{money(c.net)}</span></div>
          </div>
          <p className="inv-words">Rupees {words(c.net)} only</p>

          <div className="inv-box">
            <h4>Payment Details</h4>
            <p><b>Status:</b> Salary for {MONTHS[m - 1]} {y}</p>
            <p><b>Mode:</b> Bank Transfer / NEFT</p>
            <p><b>Present / Leave:</b> {c.Present} / {c.Leave} days</p>
            <p><b>Prepared By:</b> Admin</p>
          </div>
          <div className="inv-box">
            <h4>Notes</h4>
            <p>1. Absent days are treated as loss of pay; leave and weekly offs are paid.</p>
            <p>2. This is a computer generated payslip and needs no signature.</p>
            <p>3. Please report any discrepancy to the accounts team within 7 days.</p>
          </div>
        </div>
    </div>
  );
}

export function PayslipPage() {
  useAttendanceVersion();
  const { empId } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const now = new Date();
  const [y, m] = (sp.get("ym") || `${now.getFullYear()}-${now.getMonth() + 1}`).split("-").map(Number);
  const emp = staff.find((e) => e.id === empId);
  if (!emp) return <div className="zcard vf-empty">Employee not found. <button className="zbtn" onClick={() => nav("/payroll")}>Back to Payroll</button></div>;
  return (
    <div className="zpage">
      <div className="zhead no-print">
        <button className="zbtn ghost" onClick={() => nav("/payroll")}><ArrowLeft size={15} /> Back to Payroll</button>
        <button className="zbtn" onClick={() => window.print()}><Printer size={14} /> Print / Save PDF</button>
      </div>
      <PayslipView emp={emp} y={y} m={m} />
    </div>
  );
}

export default function PayrollPage() {
  useAttendanceVersion();
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() + 1 });
  const [paid, setPaid] = useState({}); // `${empId}|${y}-${m}` -> true
  const nav = useNavigate();
  const { y, m } = ym;
  const shift = (d) => setYm(({ y, m }) => { const t = new Date(y, m - 1 + d, 1); return { y: t.getFullYear(), m: t.getMonth() + 1 }; });

  const rows = staff.map((e) => ({ e, c: calc(e, y, m), key: `${e.id}|${y}-${m}` }));
  const { rows: pageRows, pager } = usePagination(rows);
  const gross = rows.reduce((s, r) => s + r.c.gross, 0);
  const ded = rows.reduce((s, r) => s + r.c.deductions, 0);
  const net = rows.reduce((s, r) => s + r.c.net, 0);
  const cards = [
    { label: "Employees", value: rows.length, icon: Users, cls: "fin-blue" },
    { label: "Gross Earnings", value: money(gross), icon: IndianRupee, cls: "fin-green" },
    { label: "Deductions", value: money(ded), icon: MinusCircle, cls: "fin-peach" },
    { label: "Net Payable", value: money(net), icon: Wallet, cls: "fin-lav" },
  ];

  return (
    <div className="zpage">
      <div className="zhead">
        <p>Monthly salary based on attendance. Absent days are loss of pay; leave and weekly offs are paid.</p>
        <div className="cal-nav">
          <button onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
          <b>{MONTHS[m - 1]} {y}</b>
          <button onClick={() => shift(1)} aria-label="Next month"><ChevronRight size={16} /></button>
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
        <div className="zscroll">
          <table className="ztable">
            <thead>
              <tr><th>Employee</th><th>Role</th><th>Working Days</th><th>Paid Days</th><th>LOP</th><th style={{ textAlign: "right" }}>Gross</th><th style={{ textAlign: "right" }}>Deductions</th><th style={{ textAlign: "right" }}>Net Pay</th><th>Status</th><th className="actcol">Payslip</th></tr>
            </thead>
            <tbody>
              {pageRows.map(({ e, c, key }) => (
                <tr key={e.id}>
                  <td className="prim"><b>{e.name}</b></td>
                  <td>{e.role}</td>
                  <td>{c.workingDays}</td>
                  <td>{c.payDays}</td>
                  <td>{c.lop}</td>
                  <td style={{ textAlign: "right" }}>{money(c.gross)}</td>
                  <td style={{ textAlign: "right" }}>{money(c.deductions)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{money(c.net)}</td>
                  <td>
                    <button type="button" className={`pay-chip ${paid[key] ? "paid" : ""}`} onClick={() => setPaid((p) => ({ ...p, [key]: !p[key] }))} title="Click to toggle">
                      {paid[key] ? <><CircleCheck size={13} /> Paid</> : <><Hourglass size={13} /> Pending</>}
                    </button>
                  </td>
                  <td className="actcol"><button className="zbtn ghost" onClick={() => nav(`/payroll/${e.id}?ym=${y}-${m}`)}><FileText size={14} /> View Payslip</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="zfoot">Employees: <b>{rows.length}</b> &nbsp;·&nbsp; Net payable: <b>{money(net)}</b></div>
        {pager}
      </div>

    </div>
  );
}
