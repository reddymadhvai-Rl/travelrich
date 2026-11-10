import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Pencil, Car, Handshake, Cog, FileCheck2, UserRound, CarFront, Wallet, ClipboardList,
  LayoutList, CalendarCheck, Receipt, CreditCard, TriangleAlert,
} from "lucide-react";
import { drivers, bookings, expenses, payments, tracking } from "../data.js";
import { useVehicles, docState, maintenanceState, showDate, daysLeft } from "../vehicleStore.js";
import VehicleMap from "../components/VehicleMap.jsx";

const COST_FIELDS = ["serviceCost", "maintenanceCost", "fuelExpense", "tollExpense", "driverAllowance", "otherExpenses"];
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const vehicleTone = (s) =>
  ({ Available: "st-teal", Booked: "st-orange", "Under Maintenance": "st-blue", Inactive: "st-gray", Blocked: "st-red", Retired: "st-gray" }[s] || "st-blue");
const bookingTone = (s) => ({ Ongoing: "st-orange", Confirmed: "st-blue", Completed: "st-teal", Cancelled: "st-red" }[s] || "st-gray");
const payTone = (s) => ({ Paid: "st-teal", Partial: "st-orange", Pending: "st-red" }[s] || "st-gray");
const dutyTone = (s) => ({ "On Duty": "st-teal", "Off Duty": "st-gray" }[s] || "st-gray");

/* value renderers for the overview grid */
const fmt = {
  date: (v) => showDate(v),
  money: (v) => (v === "" || v === undefined || v === null || Number(v) === 0 ? "" : inr(v)),
  num: (v) => (v === "" || v === undefined || v === null || Number(v) === 0 ? "" : Number(v).toLocaleString("en-IN")),
  file: (v) => v || "",
};

function Info({ label, value, kind, wide, hint }) {
  const shown = kind && fmt[kind] ? fmt[kind](value) : value;
  const empty = shown === "" || shown === undefined || shown === null;
  return (
    <div className="vd-item" style={wide ? { gridColumn: "1 / -1" } : undefined}>
      <span className="vd-label">{label}</span>
      <span className={`vd-value ${empty ? "vd-empty" : ""}`}>{empty ? "—" : shown}</span>
      {hint && <span className="vd-hint">{hint}</span>}
    </div>
  );
}

function Block({ icon: Icon, title, children }) {
  return (
    <section className="vf-sec">
      <h3><Icon size={17} /> {title}</h3>
      <div className="vf-grid">{children}</div>
    </section>
  );
}

function Table({ cols, rows, empty, foot }) {
  return (
    <>
      <div className="zscroll">
        <table className="ztable">
          <thead>
            <tr>{cols.map((c) => <th key={c.label} style={c.right ? { textAlign: "right" } : undefined}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key ?? i}>
                {cols.map((c) => {
                  const val = c.render ? c.render(r) : r[c.key];
                  return (
                    <td key={c.label} className={c.badge ? `zst ${c.badge(r)}` : c.primary ? "prim" : undefined}
                      style={c.right ? { textAlign: "right" } : undefined}>
                      {val === "" || val === undefined || val === null ? <span className="zmuted">—</span> : val}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!rows.length && <tr><td className="zempty" colSpan={cols.length}>{empty}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="zfoot">{foot}</div>
    </>
  );
}

export default function VehicleDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const vehicles = useVehicles();
  const v = vehicles.find((x) => x.id === id);
  const [tab, setTab] = useState(0);

  /* everything related to this vehicle, matched on registration number */
  const rel = useMemo(() => {
    if (!v) return null;
    const norm = (s) => String(s || "").replace(/\s/g, "").toLowerCase();
    const reg = norm(v.regNo);
    const vBookings = bookings.filter((b) => norm(b.vehicle) === reg);
    const ids = new Set(vBookings.map((b) => b.id));
    const vPayments = payments.filter((p) => ids.has(p.booking));
    const vExpenses = expenses.filter((e) => norm(e.vehicle) === reg);
    const vTracking = tracking.filter((t) => norm(t.vehicle) === reg);

    const byName = (n) => drivers.find((d) => d.name === n);
    const vDrivers = [];
    if (v.driver) {
      const d = byName(v.driver);
      vDrivers.push({
        key: "assigned", role: "Assigned", name: v.driver,
        phone: d?.phone || v.driverContact, license: d?.license || v.licenseNo,
        expiry: d?.expiry || (v.licenseExpiry ? showDate(v.licenseExpiry) : ""),
        status: d?.status || v.driverStatus, assigned: v.driverAssignedDate ? showDate(v.driverAssignedDate) : "",
      });
    }
    if (v.backupDriver && v.backupDriver !== v.driver) {
      const d = byName(v.backupDriver);
      vDrivers.push({
        key: "backup", role: "Backup", name: v.backupDriver,
        phone: d?.phone, license: d?.license, expiry: d?.expiry, status: d?.status, assigned: "",
      });
    }
    return { vBookings, vPayments, vExpenses, vTracking, vDrivers };
  }, [v]);

  if (!v) {
    return (
      <div className="zpage">
        <div className="zcard vf-empty">Vehicle not found. <button className="zbtn" onClick={() => nav("/vehicles")}>Back to Vehicles</button></div>
      </div>
    );
  }

  const d = docState({ ...v });
  const expired = d.expired;
  const soon = d.soon;
  const m = maintenanceState(v);
  const totalOp = v.totalOperatingCost ?? COST_FIELDS.reduce((s, k) => s + (Number(v[k]) || 0), 0);
  const expenseTotal = rel.vExpenses.reduce((s, e) => s + e.amount, 0);
  const bookingTotal = rel.vBookings.reduce((s, b) => s + b.amount, 0);
  const paidTotal = rel.vPayments.reduce((s, p) => s + p.amount, 0);
  const exp = (dt) => {
    const n = daysLeft(dt);
    return n === null ? undefined : n < 0 ? `Expired ${-n} day(s) ago` : n <= 30 ? `Expires in ${n} day(s)` : undefined;
  };

  /* map position: tracking row lat/lng → vehicle lat/lng → default */
  const live = rel.vTracking[0];
  const mapLat = Number(live?.lat ?? v.lat) || undefined;
  const mapLng = Number(live?.lng ?? v.lng) || undefined;

  const tabs = [
    { label: "Overview", icon: LayoutList },
    { label: "Drivers", icon: UserRound, n: rel.vDrivers.length },
    { label: "Bookings", icon: CalendarCheck, n: rel.vBookings.length },
    { label: "Expenses", icon: Receipt, n: rel.vExpenses.length },
    { label: "Payments", icon: CreditCard, n: rel.vPayments.length },
    { label: "Tracking", icon: CarFront, n: rel.vTracking.length },
  ];

  return (
    <div className="zpage vf">
      <div className="vf-top">
        <button type="button" className="zbtn ghost" onClick={() => nav("/vehicles")}><ArrowLeft size={15} /> Back</button>
        <div style={{ flex: 1 }}>
          <h2>{v.regNo} <span className={`zst ${vehicleTone(v.status)} vd-pill`}>{v.status}</span></h2>
          <p>{v.id} · {v.make} {v.model}{v.year ? ` (${v.year})` : ""} · {v.type}</p>
        </div>
        <button type="button" className="zbtn" onClick={() => nav(`/vehicles/${v.id}/edit`)}><Pencil size={15} /> Edit Vehicle</button>
      </div>

      {(expired.length > 0 || soon.length > 0) && (
        <div className="vf-alert" style={{ marginBottom: 10 }}>
          <TriangleAlert size={16} />
          <span>
            {expired.length > 0 && <>Expired: <b>{expired.join(", ")}</b>. </>}
            {soon.length > 0 && <>Expiring within 30 days: <b>{soon.join(", ")}</b>.</>}
          </span>
        </div>
      )}

      <div className="zcard" style={{ marginBottom: 8 }}>
        <div className="ztabs">
          {tabs.map((t, i) => (
            <button key={t.label} className={tab === i ? "on" : ""} onClick={() => setTab(i)}>
              <t.icon size={16} />{t.label}
              {t.n !== undefined && <span style={{ marginLeft: 6, opacity: 0.7 }}>({t.n})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ───────── Overview ───────── */}
      {tab === 0 && (
        <>
          <Block icon={Car} title="Basic Vehicle Information">
            <Info label="Vehicle ID" value={v.id} />
            <Info label="Registration Number" value={v.regNo} />
            <Info label="Vehicle Type" value={v.type} />
            <Info label="Make" value={v.make} />
            <Info label="Model" value={v.model} />
            <Info label="Manufacturing Year" value={v.year} />
            <Info label="Color" value={v.color} />
            <Info label="Chassis Number" value={v.chassisNo} />
            <Info label="Engine Number" value={v.engineNo} />
            <Info label="Seating Capacity" value={v.seats} />
            <Info label="Category" value={v.category} />
            <Info label="RC Book Number" value={v.rcNo} />
            <Info label="Date of Registration" value={v.regDate} kind="date" />
            <div className="vd-item">
              <span className="vd-label">Vehicle Image</span>
              {v.image && String(v.image).startsWith("data:")
                ? <img className="vd-img" src={v.image} alt={`${v.regNo}`} />
                : <span className="vd-value vd-empty">—</span>}
            </div>
          </Block>

          <Block icon={Handshake} title="Ownership & Vendor Details">
            <Info label="Ownership" value={v.ownership} />
            <Info label="Owner Name" value={v.ownerName} />
            <Info label="Owner Contact" value={v.ownerContact} />
            <Info label="Owner Address" value={v.ownerAddress} wide />
            {v.ownership !== "Owned" && <>
              <Info label="Vendor Name" value={v.vendorName} />
              <Info label="Vendor ID" value={v.vendorId} />
              <Info label="Vendor Contact" value={v.vendorContact} />
            </>}
            {v.ownership === "Leased" && <>
              <Info label="Lease Agreement No" value={v.leaseNo} />
              <Info label="Lease Start" value={v.leaseStart} kind="date" />
              <Info label="Lease End" value={v.leaseEnd} kind="date" />
              <Info label="Agreement Document" value={v.agreementDoc} kind="file" />
            </>}
          </Block>

          <Block icon={Cog} title="Vehicle Technical Details">
            <Info label="Fuel Type" value={v.fuel} />
            <Info label="Transmission" value={v.transmission} />
            <Info label="Engine Capacity (CC)" value={v.engineCc} kind="num" />
            <Info label="Mileage (KM/L)" value={v.mileage} kind="num" />
            <Info label="Fuel Tank Capacity (L)" value={v.tankCapacity} kind="num" />
            <Info label="GPS Tracking ID" value={v.gpsId} />
            <Info label="GPS Device Number" value={v.gpsDeviceNo} />
            <Info label="GPS Status" value={v.gpsStatus} />
            <Info label="Odometer (KM)" value={v.km} kind="num" />
            <Info label="AC Availability" value={v.ac} />
            <Info label="Luggage Capacity" value={v.luggage} />
            <Info label="Permit Type" value={v.permitType} />
          </Block>

          <Block icon={FileCheck2} title="Document & Compliance Details">
            <Info label="Insurance Company" value={v.insuranceCompany} />
            <Info label="Insurance Policy No" value={v.insuranceNo} />
            <Info label="Insurance Start" value={v.insuranceStart} kind="date" />
            <Info label="Insurance Expiry" value={v.insuranceExpiry} kind="date" hint={exp(v.insuranceExpiry)} />
            <Info label="Fitness Certificate No" value={v.fitnessNo} />
            <Info label="Fitness Expiry" value={v.fitnessExpiry} kind="date" hint={exp(v.fitnessExpiry)} />
            <Info label="Permit Number" value={v.permitNo} />
            <Info label="Permit Expiry" value={v.permitExpiry} kind="date" hint={exp(v.permitExpiry)} />
            <Info label="Pollution Certificate No" value={v.pucNo} />
            <Info label="Pollution Expiry" value={v.pucExpiry} kind="date" hint={exp(v.pucExpiry)} />
            <Info label="Road Tax Expiry" value={v.roadTaxExpiry} kind="date" hint={exp(v.roadTaxExpiry)} />
            <Info label="Document Verification" value={v.docVerified} />
            <Info label="RC Document" value={v.rcDoc} kind="file" />
            <Info label="Insurance Document" value={v.insuranceDoc} kind="file" />
            <Info label="Fitness Document" value={v.fitnessDoc} kind="file" />
            <Info label="Permit Document" value={v.permitDoc} kind="file" />
            <Info label="Pollution Document" value={v.pucDoc} kind="file" />
          </Block>

          <Block icon={UserRound} title="Driver Assignment Details">
            <Info label="Assigned Driver" value={v.driver} />
            <Info label="Driver ID" value={v.driverId} />
            <Info label="Driver Contact" value={v.driverContact} />
            <Info label="Driving License No" value={v.licenseNo} />
            <Info label="License Expiry" value={v.licenseExpiry} kind="date" />
            <Info label="Assignment Date" value={v.driverAssignedDate} kind="date" />
            <Info label="Backup Driver" value={v.backupDriver} />
            <Info label="Driver Status" value={v.driverStatus} />
          </Block>

          <Block icon={CarFront} title="Vehicle Operational Details">
            <Info label="Vehicle Status" value={v.status} />
            <Info label="Current Location" value={v.currentLocation} />
            <Info label="Assigned Branch" value={v.branch} />
            <Info label="Last Service" value={v.lastService} kind="date" />
            <Info label="Next Service Due" value={v.nextServiceDue} kind="date" hint={m !== "Normal" ? m : undefined} />
            <Info label="Average Daily Running (KM)" value={v.avgDailyKm} kind="num" />
            <Info label="Total Distance (KM)" value={v.totalKm} kind="num" />
            <Info label="Last Trip Date" value={v.lastTripDate} kind="date" />
            <Info label="Next Available Date" value={v.nextAvailableDate} kind="date" />
            <Info label="Maintenance Status" value={v.maintenanceStatus} />
          </Block>

          <Block icon={Wallet} title="Financial & Maintenance Details">
            <Info label="Purchase Date" value={v.purchaseDate} kind="date" />
            <Info label="Purchase Cost" value={v.purchaseCost} kind="money" />
            <Info label="Current Value" value={v.currentValue} kind="money" />
            {v.ownership === "Leased" && <Info label="Monthly Lease Amount" value={v.monthlyLease} kind="money" />}
            <Info label="Service Cost" value={v.serviceCost} kind="money" />
            <Info label="Maintenance Cost" value={v.maintenanceCost} kind="money" />
            <Info label="Fuel Expense" value={v.fuelExpense} kind="money" />
            <Info label="Toll Expense" value={v.tollExpense} kind="money" />
            <Info label="Driver Allowance" value={v.driverAllowance} kind="money" />
            <Info label="Other Expenses" value={v.otherExpenses} kind="money" />
            <Info label="Total Operating Cost" value={totalOp} kind="money" />
          </Block>

          <Block icon={ClipboardList} title="System & Administrative Details">
            <Info label="Added Date" value={v.addedDate} kind="date" />
            <Info label="Added By" value={v.addedBy} />
            <Info label="Last Updated" value={v.updatedDate} kind="date" />
            <Info label="Updated By" value={v.updatedBy} />
            <Info label="Active / Inactive" value={v.active} />
            <Info label="Internal Remarks" value={v.remarks} wide />
          </Block>
        </>
      )}

      {/* ───────── Drivers ───────── */}
      {tab === 1 && (
        <div className="zcard">
          <Table
            rows={rel.vDrivers}
            empty="No driver assigned to this vehicle"
            foot={<>Drivers: <b>{rel.vDrivers.length}</b></>}
            cols={[
              { label: "Role", key: "role" },
              { label: "Driver", key: "name", primary: true },
              { label: "Phone", key: "phone" },
              { label: "License No", key: "license" },
              { label: "License Expiry", key: "expiry" },
              { label: "Assigned On", key: "assigned" },
              { label: "Status", key: "status", badge: (r) => dutyTone(r.status) },
            ]}
          />
        </div>
      )}

      {/* ───────── Bookings ───────── */}
      {tab === 2 && (
        <div className="zcard">
          <Table
            rows={rel.vBookings}
            empty="No bookings for this vehicle"
            foot={<>Bookings: <b>{rel.vBookings.length}</b> &nbsp;·&nbsp; Total value: <b>{inr(bookingTotal)}</b></>}
            cols={[
              { label: "Booking ID", key: "id", primary: true },
              { label: "Customer", key: "customer" },
              { label: "Route", key: "route" },
              { label: "Date", key: "date" },
              { label: "Amount", render: (r) => inr(r.amount), right: true },
              { label: "Status", key: "status", badge: (r) => bookingTone(r.status) },
              { label: "Notes", key: "notes" },
            ]}
          />
        </div>
      )}

      {/* ───────── Expenses ───────── */}
      {tab === 3 && (
        <div className="zcard">
          <Table
            rows={rel.vExpenses}
            empty="No expenses recorded for this vehicle"
            foot={<>Entries: <b>{rel.vExpenses.length}</b> &nbsp;·&nbsp; Total: <b>{inr(expenseTotal)}</b></>}
            cols={[
              { label: "Date", key: "date", primary: true },
              { label: "Category", key: "category" },
              { label: "Amount", render: (r) => inr(r.amount), right: true },
              { label: "Note", key: "note" },
            ]}
          />
        </div>
      )}

      {/* ───────── Payments ───────── */}
      {tab === 4 && (
        <div className="zcard">
          <Table
            rows={rel.vPayments}
            empty="No payments linked to this vehicle's bookings"
            foot={<>Payments: <b>{rel.vPayments.length}</b> &nbsp;·&nbsp; Total received: <b>{inr(paidTotal)}</b></>}
            cols={[
              { label: "Payment ID", key: "id", primary: true },
              { label: "Booking", key: "booking" },
              { label: "Customer", key: "customer" },
              { label: "Amount", render: (r) => inr(r.amount), right: true },
              { label: "Mode", key: "mode" },
              { label: "Status", key: "status", badge: (r) => payTone(r.status) },
            ]}
          />
        </div>
      )}

      {/* ───────── Tracking (car marker map) ───────── */}
      {tab === 5 && (
        <div className="zcard">
          <div className="vd-gps">
            <span><b>GPS ID:</b> {v.gpsId || "—"}</span>
            <span><b>Device No:</b> {v.gpsDeviceNo || "—"}</span>
            <span><b>GPS Status:</b> {v.gpsStatus || "—"}</span>
          </div>

          <div style={{ padding: "0 14px 14px" }}>
            <VehicleMap
              lat={mapLat}
              lng={mapLng}
              regNo={v.regNo}
              location={live?.location || v.currentLocation}
            />
          </div>

          <Table
            rows={rel.vTracking}
            empty="No live tracking data for this vehicle"
            foot={<>Live entries: <b>{rel.vTracking.length}</b></>}
            cols={[
              { label: "Driver", key: "driver", primary: true },
              { label: "Location", key: "location" },
              { label: "Speed", key: "speed" },
              { label: "Last Updated", key: "updated" },
            ]}
          />
        </div>
      )}
    </div>
  );
}