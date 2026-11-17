import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowLeft, Car, FileCheck2, Camera, UserRound, Clock, TriangleAlert, List } from "lucide-react";
import { drivers } from "../data.js";
import {
  useVehicles, addVehicle, updateVehicle, nextVehicleId, docState, daysLeft,
  VEHICLE_TYPES, FUEL_TYPES, OWNERSHIP, PERMIT_TYPES, VEHICLE_STATUS,
} from "../vehicleStore.js";

const MAX_IMAGE_KB = 500;

const BLANK = {
  /* Vehicle information */
  regNo: "", vehicleName: "", type: "", ac: "", make: "", model: "", year: "", fuel: "",
  seats: "", luggage: "", color: "", chassisNo: "", engineNo: "", ownership: "Owned", status: "Active",
  /* Documents */
  rcNo: "", rcIssueDate: "", rcExpiry: "", rcDoc: "",
  insuranceNo: "", insuranceCompany: "", insuranceStart: "", insuranceExpiry: "", insuranceDoc: "",
  fitnessNo: "", fitnessExpiry: "", fitnessDoc: "",
  permitType: "", permitNo: "", permitExpiry: "", permitDoc: "",
  pucNo: "", pucExpiry: "", pucDoc: "",
  roadTaxPaidDate: "", roadTaxExpiry: "",
  nationalPermitNo: "", nationalPermitExpiry: "",
  statePermitName: "", statePermitNo: "", statePermitExpiry: "",
  otherDocs: "",
  /* Photographs */
  photoFront: "", photoRear: "", photoLeft: "", photoRight: "",
  /* Linked driver (details are maintained in the driver master) */
  driver: "", driverId: "",
  /* Timings */
  loginTime: "", logoutTime: "", graceTime: "",
};

const NUM = ["year", "seats", "graceTime"];
const today = () => new Date().toISOString().slice(0, 10);

/* ISO yyyy-mm-dd <-> local Date (avoids timezone shifts) */
const toDate = (s) => (s ? new Date(`${s}T00:00:00`) : null);
const toIso = (d) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "");
const toTime = (s) => {
  if (!s) return null;
  const [h, m] = s.split(":");
  const d = new Date(); d.setHours(+h, +m, 0, 0); return d;
};
const fromTime = (d) =>
  d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "";

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
  const [form, setForm] = useState(() => {
    if (!existing) return BLANK;
    const f = { ...BLANK, ...existing };
    if (!VEHICLE_STATUS.includes(f.status)) f.status = f.status === "Retired" || f.status === "Blocked" ? "Inactive" : "Active";
    return f;
  });
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

  const pickDriver = (name) => {
    const d = drivers.find((x) => x.name === name);
    setForm((p) => ({ ...p, driver: name, driverId: d ? String(d.id) : "" }));
  };

  const onFile = (k) => (e) => {
    const f = e.target.files?.[0];
    if (f) set(k, f.name);
  };
  const onFiles = (k) => (e) => {
    const names = [...(e.target.files || [])].map((f) => f.name);
    if (names.length) set(k, names.join(", "));
  };
  const onImage = (k) => (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setErrors((p) => ({ ...p, [k]: "Please choose an image file" })); return; }
    if (f.size > MAX_IMAGE_KB * 1024) { setErrors((p) => ({ ...p, [k]: `Image must be under ${MAX_IMAGE_KB} KB` })); return; }
    const r = new FileReader();
    r.onload = () => set(k, r.result);
    r.readAsDataURL(f);
  };

  const validate = () => {
    const e = {};
    const req = { regNo: "Registration number", type: "Vehicle category", make: "Brand / manufacturer", model: "Model", seats: "Seating capacity", fuel: "Fuel type", ownership: "Ownership" };
    Object.entries(req).forEach(([k, l]) => { if (!String(form[k]).trim()) e[k] = `${l} is required`; });
    if (form.year && (form.year < 1990 || form.year > new Date().getFullYear() + 1)) e.year = "Enter a valid year";
    if (form.insuranceStart && form.insuranceExpiry && form.insuranceExpiry < form.insuranceStart) e.insuranceExpiry = "Expiry is before start date";
    if (form.rcIssueDate && form.rcExpiry && form.rcExpiry < form.rcIssueDate) e.rcExpiry = "Expiry is before issue date";
    if (vehicles.some((v) => v.id !== existing?.id && v.regNo.replace(/\s/g, "").toLowerCase() === form.regNo.replace(/\s/g, "").toLowerCase()))
      e.regNo = "This registration number already exists";
    if (form.status === "Active" && docs.expired.length) e.status = `Cannot be Active – expired: ${docs.expired.join(", ")}`;
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
      {props.type === "time" ? (
        <DatePicker
          id={`v_${k}`} selected={toTime(form[k])} onChange={(d) => set(k, fromTime(d))}
          showTimeSelect showTimeSelectOnly timeIntervals={15} timeCaption="Time"
          dateFormat="hh:mm aa" placeholderText="hh:mm" isClearable autoComplete="off"
          wrapperClassName="vf-dp" />
      ) : props.type === "date" ? (
        <DatePicker
          id={`v_${k}`} selected={toDate(form[k])} onChange={(d) => set(k, toIso(d))}
          dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" isClearable autoComplete="off"
          showMonthDropdown showYearDropdown dropdownMode="select" scrollableYearDropdown yearDropdownItemNumber={40}
          maxDate={props.maxDate} wrapperClassName="vf-dp" />
      ) : props.options ? (
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
        .vf .vf-dp { width: 100%; display: block; }
        .vf .react-datepicker-popper { z-index: 50; }
        .vf .zf input[readonly] { background: #f1f5f9; color: #475569; cursor: default; }
      `}</style>
      <div className="vf-top">
        {/* <button type="button" className="zbtn ghost" onClick={() => nav("/vehicles")}><ArrowLeft size={15} /> Back</button> */}
        <div>
          <h2>{existing ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          <p>Vehicle ID: <b>{vehicleId}</b> (auto-generated)</p>
        </div>
        <button type="button" className="zbtn vf-manage" onClick={() => nav("/vehicles")}><List size={15} /> Manage Vehicles</button>
      </div>

      <form onSubmit={submit} noValidate>
        <Section icon={Car} title="Vehicle Information">
          {F("regNo", "Vehicle Registration Number", { required: true, placeholder: "TS09AB1234" })}
          {F("vehicleName", "Vehicle Name", { placeholder: "Innova Crysta, Ertiga, Tempo Traveller" })}
          {F("type", "Vehicle Category", { required: true, options: VEHICLE_TYPES })}
          {F("ac", "Vehicle Type", { options: ["AC", "Non-AC"] })}
          {F("make", "Brand / Manufacturer", { required: true, placeholder: "Toyota, Maruti, Force" })}
          {F("model", "Model", { required: true, placeholder: "Innova Crysta" })}
          {F("year", "Manufacturing Year", { type: "number", placeholder: "2024" })}
          {F("fuel", "Fuel Type", { required: true, options: FUEL_TYPES })}
          {F("seats", "Seating Capacity", { type: "number", required: true, placeholder: "7 (excluding driver)" })}
          {F("luggage", "Luggage Capacity", { placeholder: "Number of bags" })}
          {F("color", "Vehicle Colour", { placeholder: "White" })}
          {F("chassisNo", "Chassis Number")}
          {F("engineNo", "Engine Number")}
          {F("ownership", "Ownership Type", { required: true, options: OWNERSHIP })}
          {F("status", "Vehicle Status", { options: VEHICLE_STATUS })}
        </Section>

        <Section icon={FileCheck2} title="Documents & Validity">
          {F("rcNo", "RC Number")}
          {F("rcIssueDate", "RC Issue Date", { type: "date" })}
          {F("rcExpiry", "RC Expiry Date (if applicable)", { type: "date", hint: exp("rcExpiry") })}
          {U("rcDoc", "RC Document")}
          {F("insuranceNo", "Insurance Policy Number")}
          {F("insuranceCompany", "Insurer")}
          {F("insuranceStart", "Insurance Start Date", { type: "date" })}
          {F("insuranceExpiry", "Insurance Expiry Date", { type: "date", hint: exp("insuranceExpiry") })}
          {U("insuranceDoc", "Insurance Document")}
          {F("fitnessNo", "Fitness Certificate Number")}
          {F("fitnessExpiry", "Fitness Certificate Expiry", { type: "date", hint: exp("fitnessExpiry") })}
          {U("fitnessDoc", "Fitness Certificate Document")}
          {F("permitType", "Permit Type", { options: PERMIT_TYPES })}
          {F("permitNo", "Permit Number")}
          {F("permitExpiry", "Permit Validity", { type: "date", hint: exp("permitExpiry") })}
          {U("permitDoc", "Permit Document")}
          {F("pucNo", "PUC Number")}
          {F("pucExpiry", "PUC Expiry Date", { type: "date", hint: exp("pucExpiry") })}
          {U("pucDoc", "Pollution Certificate Document")}
          {F("roadTaxPaidDate", "Road Tax Paid Date", { type: "date" })}
          {F("roadTaxExpiry", "Road Tax Validity", { type: "date", hint: exp("roadTaxExpiry") })}
          {F("nationalPermitNo", "National Permit Number (if applicable)")}
          {F("nationalPermitExpiry", "National Permit Validity", { type: "date", hint: exp("nationalPermitExpiry") })}
          {F("statePermitName", "State Permit – State")}
          {F("statePermitNo", "State Permit Number")}
          {F("statePermitExpiry", "State Permit Validity", { type: "date", hint: exp("statePermitExpiry") })}
          <div className="zf">
            <label htmlFor="v_otherDocs">Other Documents (PDF / Image)</label>
            <label className={`vf-file ${form.otherDocs ? "has" : ""}`} htmlFor="v_otherDocs">
              <input id="v_otherDocs" className="vf-file-input" type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                onChange={onFiles("otherDocs")} onClick={(e) => { e.target.value = ""; }} />
              <span className="vf-file-btn">Choose files</span>
              <span className="vf-file-name">{form.otherDocs || "No file chosen"}</span>
              {form.otherDocs && (
                <button type="button" className="vf-file-clear" aria-label="Remove files" title="Remove"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); set("otherDocs", ""); }}>×</button>
              )}
            </label>
          </div>
          {(docs.expired.length > 0 || docs.soon.length > 0) && (
            <div className="vf-alert" style={{ gridColumn: "1 / -1" }}>
              <TriangleAlert size={16} />
              <span>
                {docs.expired.length > 0 && <>Expired: <b>{docs.expired.join(", ")}</b>. This vehicle cannot be set to Active. </>}
                {docs.soon.length > 0 && <>Expiring within 30 days: <b>{docs.soon.join(", ")}</b>.</>}
              </span>
            </div>
          )}
        </Section>

        <Section icon={Camera} title="Vehicle Images">
          {[["photoFront", "Front"], ["photoRear", "Rear"], ["photoLeft", "Left"], ["photoRight", "Right"]].map(([k, l]) => (
            <div key={k} className={`zf ${errors[k] ? "vf-err" : ""}`}>
              <label htmlFor={`v_${k}`}>{l} Photo</label>
              {fileBox(k, "image/*", onImage(k), () => set(k, ""))}
              <small className="vf-hint">JPG / PNG, max {MAX_IMAGE_KB} KB</small>
              {form[k] && <img src={form[k]} alt={`${l} view`} style={{ marginTop: 6, maxHeight: 90, borderRadius: 6, objectFit: "cover" }} />}
              {errors[k] && <small className="zerr">{errors[k]}</small>}
            </div>
          ))}
        </Section>

        <Section icon={UserRound} title="Driver (linked)">
          {F("driver", "Assigned Driver", {
            options: drivers.map((d) => d.name), onChange: pickDriver,
            hint: "Driver details are maintained separately and linked here.",
          })}
        </Section>

        <Section icon={Clock} title="Timings">
          {F("loginTime", "Login Time", { type: "time" })}
          {F("logoutTime", "Logout Time", { type: "time" })}
          {F("graceTime", "Grace Time (minutes)", { type: "number", placeholder: "e.g. 15" })}
        </Section>

        <div className="vf-actions">
          <button className="zbtn" type="submit">{existing ? "Update Vehicle" : "Save Vehicle"}</button>
          <button className="zbtn ghost" type="button" onClick={() => nav("/vehicles")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}