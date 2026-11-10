import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Car, FileCheck2, Handshake, IndianRupee, MapPin, Wrench, TriangleAlert,
  Cog, UserRound, Wallet, ClipboardList, List } from "lucide-react";
import { drivers } from "../data.js";
import {
  useVehicles, addVehicle, updateVehicle, nextVehicleId, docState, DOC_FIELDS, daysLeft,
  VEHICLE_TYPES, FUEL_TYPES, OWNERSHIP, PERMIT_TYPES, VEHICLE_GROUPS, VEHICLE_STATUS, BRANCHES,
} from "../vehicleStore.js";

const VEHICLE_CATEGORIES = ["Luxury", "Standard", "Economy"];
const TRANSMISSIONS = ["Manual", "Automatic"];
const DRIVER_STATUS = ["Active", "On Leave", "Inactive"];
const MAINT_STATUS = ["Up to date", "Due Soon", "In Progress", "Overdue"];
const MAX_IMAGE_KB = 500;

const BLANK = {
  /* 1. Basic */
  regNo: "", type: "", make: "", model: "", year: "", color: "", chassisNo: "", engineNo: "",
  seats: "", category: "", image: "", rcNo: "", regDate: "",
  /* 2. Ownership & vendor */
  ownership: "Owned", ownerName: "", ownerContact: "", ownerAddress: "",
  vendorName: "", vendorId: "", vendorContact: "",
  leaseNo: "", leaseStart: "", leaseEnd: "", agreementDoc: "",
  /* 3. Technical */
  fuel: "", transmission: "", engineCc: "", mileage: "", tankCapacity: "",
  gpsId: "", gpsDeviceNo: "", gpsStatus: "Active", km: "", ac: "AC", luggage: "", permitType: "",
  /* 4. Documents & compliance */
  insuranceCompany: "", insuranceNo: "", insuranceStart: "", insuranceExpiry: "",
  fitnessNo: "", fitnessExpiry: "", permitNo: "", permitExpiry: "",
  pucNo: "", pucExpiry: "", roadTaxExpiry: "",
  rcDoc: "", insuranceDoc: "", fitnessDoc: "", permitDoc: "", pucDoc: "",
  docVerified: "Pending",
  /* 5. Driver */
  driver: "", driverId: "", driverContact: "", licenseNo: "", licenseExpiry: "",
  driverAssignedDate: "", backupDriver: "", driverStatus: "Active",
  /* 6. Operational */
  status: "Available", currentLocation: "", branch: "", lastService: "", nextServiceDue: "",
  avgDailyKm: "", totalKm: "", lastTripDate: "", nextAvailableDate: "", maintenanceStatus: "Up to date",
  /* 7. Financial */
  purchaseDate: "", purchaseCost: "", currentValue: "", monthlyLease: "",
  serviceCost: "", maintenanceCost: "", fuelExpense: "", tollExpense: "",
  driverAllowance: "", otherExpenses: "",
  /* Rates & charges (existing) */
  group: "", kmLimit: "", extraKmRate: "", extraHourRate: "", dailyRate: "", outstationRate: "", driverBata: "",
  toll: "Extra", parking: "Extra", fuelIncluded: "No", vendorRate: "",
  /* 8. System */
  addedDate: "", addedBy: "", updatedDate: "", updatedBy: "", remarks: "", active: "Active",
};

const NUM = [
  "year", "seats", "km", "kmLimit", "extraKmRate", "extraHourRate", "dailyRate", "outstationRate", "driverBata", "vendorRate",
  "engineCc", "mileage", "tankCapacity", "avgDailyKm", "totalKm",
  "purchaseCost", "currentValue", "monthlyLease", "serviceCost", "maintenanceCost", "fuelExpense", "tollExpense",
  "driverAllowance", "otherExpenses",
];
const COST_FIELDS = ["serviceCost", "maintenanceCost", "fuelExpense", "tollExpense", "driverAllowance", "otherExpenses"];
const phoneOk = (v) => v.replace(/\D/g, "").length >= 10;
const today = () => new Date().toISOString().slice(0, 10);
const CURRENT_USER = "Admin"; // TODO: replace with the logged-in user's name

function Section({ icon: Icon, title, children }) {
  return (
    <section className="vf-sec">
      <h3><Icon size={17} /> {title}</h3>
      <div className="vf-grid">{children}</div>
    </section>
  );
}

export default function VehicleForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const vehicles = useVehicles();
  const existing = id ? vehicles.find((v) => v.id === id) : null;
  const [form, setForm] = useState(() => (existing ? { ...BLANK, ...existing } : BLANK));
  const [errors, setErrors] = useState({});
  const newId = useMemo(() => nextVehicleId(), []); // eslint-disable-line
  const vehicleId = existing?.id || newId;

  if (id && !existing) {
    return (
      <div className="zpage">
        <div className="zcard vf-empty">Vehicle not found. <button className="zbtn" onClick={() => nav("/vehicles")}>Back to Vehicles</button></div>
      </div>
    );
  }

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: undefined })); };
  const docs = docState(form);
  const notOwned = form.ownership !== "Owned";
  const leased = form.ownership === "Leased";
  const drv = drivers.find((d) => d.name === form.driver);
  const totalOpCost = COST_FIELDS.reduce((s, k) => s + (Number(form[k]) || 0), 0);

  /* picking a driver auto-fills the linked driver details (still editable) */
  const pickDriver = (name) => {
    const d = drivers.find((x) => x.name === name);
    setForm((p) => ({
      ...p,
      driver: name,
      driverId: d ? (d.id ?? p.driverId) : "",
      driverContact: d ? (d.phone ?? d.mobile ?? d.contact ?? p.driverContact) : "",
      licenseNo: d ? (d.license ?? p.licenseNo) : "",
      licenseExpiry: d ? (d.expiry ?? p.licenseExpiry) : "",
      driverAssignedDate: name ? (p.driverAssignedDate || today()) : "",
    }));
  };

  const onFile = (k) => (e) => {
    const f = e.target.files?.[0];
    if (f) set(k, f.name);
  };

  const onImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setErrors((p) => ({ ...p, image: "Please choose an image file" })); return; }
    if (f.size > MAX_IMAGE_KB * 1024) { setErrors((p) => ({ ...p, image: `Image must be under ${MAX_IMAGE_KB} KB` })); return; }
    const r = new FileReader();
    r.onload = () => set("image", r.result);
    r.readAsDataURL(f);
  };

  const validate = () => {
    const e = {};
    const req = { regNo: "Registration number", type: "Vehicle type", make: "Make", model: "Model", seats: "Seating capacity", fuel: "Fuel type", ownership: "Ownership" };
    Object.entries(req).forEach(([k, l]) => { if (!String(form[k]).trim()) e[k] = `${l} is required`; });
    if (form.year && (form.year < 1990 || form.year > new Date().getFullYear() + 1)) e.year = "Enter a valid year";
    if (notOwned && !form.vendorName.trim()) e.vendorName = "Owner / vendor name is required";
    if (form.vendorContact && !phoneOk(form.vendorContact)) e.vendorContact = "Enter a valid 10 digit number";
    if (form.ownerContact && !phoneOk(form.ownerContact)) e.ownerContact = "Enter a valid 10 digit number";
    if (form.driverContact && !phoneOk(form.driverContact)) e.driverContact = "Enter a valid 10 digit number";
    if (leased && form.leaseStart && form.leaseEnd && form.leaseEnd < form.leaseStart) e.leaseEnd = "End date is before start date";
    if (form.insuranceStart && form.insuranceExpiry && form.insuranceExpiry < form.insuranceStart) e.insuranceExpiry = "Expiry is before start date";
    if (form.regDate && form.regDate > today()) e.regDate = "Registration date cannot be in the future";
    if (form.purchaseDate && form.purchaseDate > today()) e.purchaseDate = "Purchase date cannot be in the future";
    if (form.backupDriver && form.backupDriver === form.driver) e.backupDriver = "Backup driver must differ from assigned driver";
    if (vehicles.some((v) => v.id !== existing?.id && v.regNo.replace(/\s/g, "").toLowerCase() === form.regNo.replace(/\s/g, "").toLowerCase()))
      e.regNo = "This registration number already exists";
    if (form.status === "Available" && docs.expired.length) e.status = `Cannot be Available – expired: ${docs.expired.join(", ")}`;
    if (form.status === "Booked" && docs.expired.length) e.status = `Cannot be Booked – expired: ${docs.expired.join(", ")}`;
    NUM.forEach((k) => { if (form[k] !== "" && Number(form[k]) < 0) e[k] = "Must be 0 or more"; });
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector(".vf-err")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const data = { ...form, regNo: form.regNo.trim().toUpperCase() };
    NUM.forEach((k) => { data[k] = data[k] === "" ? 0 : Number(data[k]); });
    data.totalOperatingCost = COST_FIELDS.reduce((s, k) => s + (Number(data[k]) || 0), 0);
    if (!notOwned) {
      data.vendorName = ""; data.vendorId = ""; data.vendorContact = ""; data.vendorRate = 0;
    }
    if (!leased) { data.leaseNo = ""; data.leaseStart = ""; data.leaseEnd = ""; data.agreementDoc = ""; data.monthlyLease = 0; }
    data.addedDate = existing?.addedDate || today();
    data.addedBy = existing?.addedBy || CURRENT_USER;
    data.updatedDate = today();
    data.updatedBy = CURRENT_USER;
    existing ? updateVehicle(existing.id, data) : addVehicle({ id: vehicleId, ...data });
    nav("/vehicles", { state: { toast: existing ? "Vehicle updated successfully" : "Vehicle added successfully" } });
  };

  /* field helpers */
  const F = (k, label, props = {}) => {
    const nm = label.replace(/\s*\(.*?\)/g, "").toLowerCase();
    const ph = props.placeholder ?? (props.type === "date" ? undefined : `Enter ${nm}`);
    return (
    <div className={`zf ${errors[k] ? "vf-err" : ""}`} style={props.wide ? { gridColumn: "1 / -1" } : undefined}>
      <label htmlFor={`v_${k}`}>{label}{props.required && <span className="zreq">*</span>}</label>
      {props.options ? (
        <select id={`v_${k}`} value={form[k]} onChange={(e) => (props.onChange ? props.onChange(e.target.value) : set(k, e.target.value))}>
          <option value="">{`Select ${nm}`}</option>
          {props.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : props.textarea ? (
        <textarea id={`v_${k}`} rows={2} value={form[k]} placeholder={ph} onChange={(e) => set(k, e.target.value)} />
      ) : (
        <input id={`v_${k}`} type={props.type || "text"} value={form[k]} placeholder={ph}
          min={props.type === "number" ? 0 : undefined} step={props.step}
          disabled={props.disabled} readOnly={props.readOnly} onChange={(e) => set(k, e.target.value)} />
      )}
      {props.hint && <small className="vf-hint">{props.hint}</small>}
      {errors[k] && <small className="zerr">{errors[k]}</small>}
    </div>
    );
  };

  /* file upload field – stores the file name */
  const fileBox = (k, accept, onChange, clear) => (
    <label className={`vf-file ${form[k] ? "has" : ""}`} htmlFor={`v_${k}`}>
      <input id={`v_${k}`} className="vf-file-input" type="file" accept={accept} onChange={onChange}
        onClick={(e) => { e.target.value = ""; }} />
      <span className="vf-file-btn">Choose file</span>
      <span className="vf-file-name">{form[k] ? (form[k].startsWith("data:") ? "Image selected" : form[k]) : "No file chosen"}</span>
      {form[k] && (
        <button type="button" className="vf-file-clear" aria-label="Remove file" title="Remove"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); clear(); }}>×</button>
      )}
    </label>
  );
  const U = (k, label, accept = ".pdf,.jpg,.jpeg,.png") => (
    <div className={`zf ${errors[k] ? "vf-err" : ""}`}>
      <label htmlFor={`v_${k}`}>{label}</label>
      {fileBox(k, accept, onFile(k), () => set(k, ""))}
      {errors[k] && <small className="zerr">{errors[k]}</small>}
    </div>
  );

  const exp = (k) => {
    const d = daysLeft(form[k]);
    return d === null ? null : d < 0 ? `Expired ${-d} day(s) ago` : d <= 30 ? `Expires in ${d} day(s)` : null;
  };

  const allExpired = docs.expired;
  const allSoon = docs.soon;

  return (
    <div className="zpage vf">
      <style>{`
        .vf .zf textarea {
          width: 100%; box-sizing: border-box; min-height: 72px; padding: 9px 12px;
          border: 1px solid #d6dbe3; border-radius: 6px; background: #fff; color: inherit;
          font: inherit; font-size: 14px; line-height: 1.4; resize: vertical; outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .vf .zf textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
        .vf .zf .vf-file-input { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; pointer-events: none; }
        .vf .zf .vf-file {
          display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box;
          min-height: 38px; padding: 4px 10px 4px 4px; border: 1px solid #d6dbe3; border-radius: 6px;
          background: #fff; cursor: pointer; transition: border-color .15s, box-shadow .15s;
        }
        .vf .zf label.vf-file { display: flex; margin: 0; font-weight: 400; }
        .vf .zf .vf-file:hover { border-color: #2563eb; }
        .vf .zf .vf-file:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
        .vf .zf .vf-file-btn {
          flex: none; padding: 6px 12px; border-radius: 6px; background: #eef2f7;
          color: #1e293b; font-size: 13px; font-weight: 500;
        }
        .vf .zf .vf-file-name {
          flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          color: #94a3b8; font-size: 13px;
        }
        .vf .zf .vf-file.has .vf-file-name { color: #334155; }
        .vf .zf .vf-file-clear {
          flex: none; border: 0; background: transparent; color: #94a3b8; font-size: 18px;
          line-height: 1; cursor: pointer; padding: 0 2px;
        }
        .vf .zf .vf-file-clear:hover { color: #dc2626; }
        .vf .zf input[readonly] { background: #f1f5f9; color: #475569; cursor: default; }
      `}</style>
      <div className="vf-top">
        <button type="button" className="zbtn ghost" onClick={() => nav("/vehicles")}><ArrowLeft size={15} /> Back</button>
        <div>
          <h2>{existing ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          <p>Vehicle ID: <b>{vehicleId}</b></p>
        </div>
        <button type="button" className="zbtn vf-manage" onClick={() => nav("/vehicles")}><List size={15} /> Manage Vehicles</button>
      </div>

      <form onSubmit={submit} noValidate>
        {/* 1 ─ Basic Vehicle Information */}
        <Section icon={Car} title="Basic Vehicle Information">
          {F("regNo", "Vehicle Registration Number", { required: true, placeholder: "TS 09 UA 1234" })}
          {F("type", "Vehicle Type", { required: true, options: VEHICLE_TYPES })}
          {F("make", "Vehicle Make", { required: true, placeholder: "Toyota, Maruti, Tata" })}
          {F("model", "Vehicle Model", { required: true, placeholder: "Innova Crysta" })}
          {F("year", "Manufacturing Year", { type: "number", placeholder: "2024" })}
          {F("color", "Vehicle Color")}
          {F("chassisNo", "Chassis Number")}
          {F("engineNo", "Engine Number")}
          {F("seats", "Seating Capacity", { type: "number", required: true })}
          {F("category", "Vehicle Category", { options: VEHICLE_CATEGORIES })}
          {F("rcNo", "RC Book Number")}
          {F("regDate", "Date of Registration", { type: "date" })}
          <div className={`zf ${errors.image ? "vf-err" : ""}`}>
            <label htmlFor="v_image">Vehicle Image</label>
            {fileBox("image", "image/*", onImage, () => set("image", ""))}
            <small className="vf-hint">JPG / PNG, max {MAX_IMAGE_KB} KB</small>
            {form.image && (
              <img src={form.image} alt="Vehicle preview" style={{ marginTop: 6, maxHeight: 90, borderRadius: 6, objectFit: "cover" }} />
            )}
            {errors.image && <small className="zerr">{errors.image}</small>}
          </div>
        </Section>

        {/* 2 ─ Ownership & Vendor Details */}
        <Section icon={Handshake} title="Ownership & Vendor Details">
          {F("ownership", "Vehicle Ownership", { required: true, options: OWNERSHIP })}
          {F("ownerName", "Owner Name")}
          {F("ownerContact", "Owner Contact Number", { type: "tel", placeholder: "10 digit mobile" })}
          {F("ownerAddress", "Owner Address", { textarea: true, wide: true })}
          {notOwned && F("vendorName", "Vendor Name", { required: true })}
          {notOwned && F("vendorId", "Vendor ID")}
          {notOwned && F("vendorContact", "Vendor Contact Number", { type: "tel", placeholder: "10 digit mobile" })}
          {leased && F("leaseNo", "Lease Agreement Number")}
          {leased && F("leaseStart", "Lease Start Date", { type: "date" })}
          {leased && F("leaseEnd", "Lease End Date", { type: "date" })}
          {leased && U("agreementDoc", "Agreement Document Upload")}
        </Section>

        {/* 3 ─ Vehicle Technical Details */}
        <Section icon={Cog} title="Vehicle Technical Details">
          {F("fuel", "Fuel Type", { required: true, options: FUEL_TYPES })}
          {F("transmission", "Transmission Type", { options: TRANSMISSIONS })}
          {F("engineCc", "Engine Capacity (CC)", { type: "number" })}
          {F("mileage", "Mileage (KM/L)", { type: "number", step: "0.1" })}
          {F("tankCapacity", "Fuel Tank Capacity (L)", { type: "number" })}
          {F("gpsId", "GPS Tracking ID")}
          {F("gpsDeviceNo", "GPS Device Number")}
          {F("gpsStatus", "GPS Status", { options: ["Active", "Inactive"] })}
          {F("km", "Odometer Reading (KM)", { type: "number" })}
          {F("ac", "AC Availability", { options: ["AC", "Non-AC"] })}
          {F("luggage", "Luggage Capacity", { placeholder: "e.g. 4 bags" })}
          {F("permitType", "Vehicle Permit Type", { options: PERMIT_TYPES })}
        </Section>

        {/* 4 ─ Document & Compliance Details */}
        <Section icon={FileCheck2} title="Document & Compliance Details">
          {F("insuranceCompany", "Insurance Company")}
          {F("insuranceNo", "Insurance Policy Number")}
          {F("insuranceStart", "Insurance Start Date", { type: "date" })}
          {F("insuranceExpiry", "Insurance Expiry Date", { type: "date", hint: exp("insuranceExpiry") })}
          {F("fitnessNo", "Fitness Certificate Number")}
          {F("fitnessExpiry", "Fitness Certificate Expiry Date", { type: "date", hint: exp("fitnessExpiry") })}
          {F("permitNo", "Permit Number")}
          {F("permitExpiry", "Permit Expiry Date", { type: "date", hint: exp("permitExpiry") })}
          {F("pucNo", "Pollution Certificate Number")}
          {F("pucExpiry", "Pollution Certificate Expiry Date", { type: "date", hint: exp("pucExpiry") })}
          {F("roadTaxExpiry", "Road Tax Expiry Date", { type: "date", hint: exp("roadTaxExpiry") })}
          {F("docVerified", "Document Verification", { options: ["Verified", "Pending"] })}
          {U("rcDoc", "Registration Certificate (RC) Document")}
          {U("insuranceDoc", "Insurance Document Upload")}
          {U("fitnessDoc", "Fitness Certificate Upload")}
          {U("permitDoc", "Permit Document Upload")}
          {U("pucDoc", "Pollution Certificate Upload")}
          {(allExpired.length > 0 || allSoon.length > 0) && (
            <div className="vf-alert" style={{ gridColumn: "1 / -1" }}>
              <TriangleAlert size={16} />
              <span>
                {allExpired.length > 0 && <>Expired: <b>{allExpired.join(", ")}</b>. This vehicle cannot be set to Available or Booked. </>}
                {allSoon.length > 0 && <>Expiring within 30 days: <b>{allSoon.join(", ")}</b>.</>}
              </span>
            </div>
          )}
        </Section>

        {/* 5 ─ Driver Assignment Details */}
        <Section icon={UserRound} title="Driver Assignment Details">
          {F("driver", "Assigned Driver", {
            options: drivers.map((d) => d.name), onChange: pickDriver,
            hint: drv ? `Licence ${drv.license} · expires ${drv.expiry}` : undefined,
          })}
          {F("driverId", "Driver ID")}
          {F("driverContact", "Driver Contact Number", { type: "tel", placeholder: "10 digit mobile" })}
          {F("licenseNo", "Driving License Number")}
          {F("licenseExpiry", "Driving License Expiry Date", { type: "date", hint: exp("licenseExpiry") })}
          {F("driverAssignedDate", "Driver Assignment Date", { type: "date" })}
          {F("backupDriver", "Backup Driver", { options: drivers.map((d) => d.name) })}
          {F("driverStatus", "Driver Status", { options: DRIVER_STATUS })}
        </Section>

        {/* 6 ─ Vehicle Operational Details */}
        <Section icon={MapPin} title="Vehicle Operational Details">
          {F("status", "Vehicle Status", { options: VEHICLE_STATUS, hint: "Document expiry is tracked separately and shown on the list." })}
          {F("currentLocation", "Current Location")}
          {F("branch", "Assigned Branch", { options: BRANCHES })}
          {F("lastService", "Last Service Date", { type: "date" })}
          {F("nextServiceDue", "Next Service Due Date", { type: "date", hint: exp("nextServiceDue") })}
          {F("avgDailyKm", "Average Daily Running (KM)", { type: "number" })}
          {F("totalKm", "Total Distance Travelled (KM)", { type: "number" })}
          {F("lastTripDate", "Last Trip Date", { type: "date" })}
          {F("nextAvailableDate", "Next Available Date", { type: "date" })}
          {F("maintenanceStatus", "Maintenance Status", { options: MAINT_STATUS })}
        </Section>

        {/* Rates & Charges (existing) */}
        <Section icon={IndianRupee} title="Rates & Charges">
          {F("group", "Vehicle Group", { options: VEHICLE_GROUPS })}
          {F("kmLimit", "Daily Kilometer Limit", { type: "number" })}
          {F("dailyRate", "Daily Rental Rate (₹)", { type: "number" })}
          {F("outstationRate", "Outstation Rate (₹/km)", { type: "number" })}
          {F("extraKmRate", "Extra Kilometer Rate (₹)", { type: "number" })}
          {F("extraHourRate", "Extra Hour Rate (₹)", { type: "number" })}
          {F("driverBata", "Driver Bata (₹/day)", { type: "number" })}
          {notOwned && F("vendorRate", "Vendor Rate (₹)", { type: "number", hint: "Cost paid to vehicle vendor" })}
          {F("toll", "Toll Charges", { options: ["Included", "Extra"] })}
          {F("parking", "Parking Charges", { options: ["Included", "Extra"] })}
          {F("fuelIncluded", "Fuel Included", { options: ["Yes", "No"] })}
        </Section>

        {/* 7 ─ Financial & Maintenance Details */}
        <Section icon={Wallet} title="Financial & Maintenance Details">
          {F("purchaseDate", "Vehicle Purchase Date", { type: "date" })}
          {F("purchaseCost", "Vehicle Purchase Cost (₹)", { type: "number" })}
          {F("currentValue", "Current Vehicle Value (₹)", { type: "number" })}
          {leased && F("monthlyLease", "Monthly Lease Amount (₹)", { type: "number" })}
          {F("serviceCost", "Service Cost (₹)", { type: "number" })}
          {F("maintenanceCost", "Maintenance Cost (₹)", { type: "number" })}
          {F("fuelExpense", "Fuel Expense (₹)", { type: "number" })}
          {F("tollExpense", "Toll Expense (₹)", { type: "number" })}
          {F("driverAllowance", "Driver Allowance (₹)", { type: "number" })}
          {F("otherExpenses", "Other Expenses (₹)", { type: "number" })}
          <div className="zf">
            <label htmlFor="v_totalOp">Total Operating Cost (₹)</label>
            <input id="v_totalOp" type="text" readOnly value={totalOpCost.toLocaleString("en-IN")} />
            <small className="vf-hint">Service + Maintenance + Fuel + Toll + Driver Allowance + Other</small>
          </div>
        </Section>

        {/* 8 ─ System & Administrative Details */}
        <Section icon={ClipboardList} title="System & Administrative Details">
          <div className="zf">
            <label>Vehicle Added Date</label>
            <input type="text" readOnly value={existing?.addedDate || today()} />
          </div>
          <div className="zf">
            <label>Added By</label>
            <input type="text" readOnly value={existing?.addedBy || CURRENT_USER} />
          </div>
          <div className="zf">
            <label>Last Updated Date</label>
            <input type="text" readOnly value={existing?.updatedDate || "—"} />
          </div>
          <div className="zf">
            <label>Updated By</label>
            <input type="text" readOnly value={existing?.updatedBy || "—"} />
          </div>
          {F("active", "Active / Inactive", { options: ["Active", "Inactive"] })}
          {F("remarks", "Internal Remarks", { textarea: true, wide: true })}
        </Section>

        <div className="vf-actions">
          <button className="zbtn" type="submit">{existing ? "Update Vehicle" : "Save Vehicle"}</button>
          <button className="zbtn ghost" type="button" onClick={() => nav("/vehicles")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}