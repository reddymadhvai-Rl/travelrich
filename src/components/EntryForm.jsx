import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { List, X, ChevronDown } from "lucide-react";
import "../entry-form.css";

/* ---------- date helpers (form state keeps ISO yyyy-mm-dd / HH:MM / yyyy) ---------- */
const toDate = (s) => (s ? new Date(`${s}T00:00:00`) : null);
const toIso = (d) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "");
const toTime = (s) => { if (!s) return null; const [h, m] = s.split(":"); const d = new Date(); d.setHours(+h, +m, 0, 0); return d; };
const fromTime = (d) => (d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "");
const kb = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, "");

/** Flatten sections -> plain field list (handy for the "View" dialog of a list page). */
export const flattenFields = (sections) => sections.flatMap((s) => s.fields);

/* ---------------- searchable dropdown ---------------- */
function SearchSelect({ id, value, options, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const ref = useRef(null);
  const shown = useMemo(() => { const t = norm(q); return t ? options.filter((o) => norm(o).includes(t)) : options; }, [q, options]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQ(""); } };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => { setHi(0); }, [q, open]);

  const pick = (o) => { onChange(o); setOpen(false); setQ(""); };
  const key = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, shown.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && open) { e.preventDefault(); if (shown[hi]) pick(shown[hi]); }
    else if (e.key === "Escape" || e.key === "Tab") { setOpen(false); setQ(""); }
  };
  return (
    <div className="ss" ref={ref}>
      <input
        id={id} type="text" autoComplete="off" disabled={disabled} role="combobox" aria-expanded={open}
        value={open ? q : value || ""} placeholder={open && value ? value : placeholder}
        onFocus={() => { setOpen(true); setQ(""); }} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onKeyDown={key}
      />
      {value && !disabled
        ? <button type="button" className="ss-x" aria-label="Clear" onMouseDown={(e) => e.preventDefault()} onClick={() => onChange("")}><X size={14} /></button>
        : <ChevronDown size={15} className="ss-chev" />}
      {open && (
        <ul className="ss-list" role="listbox">
          {shown.length ? shown.map((o, i) => (
            <li key={o} role="option" aria-selected={o === value} className={`${i === hi ? "hi" : ""} ${o === value ? "sel" : ""}`}
              onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setHi(i)} onClick={() => pick(o)}>{o}</li>
          )) : <li className="empty">No matches</li>}
        </ul>
      )}
    </div>
  );
}

/* ---------------- file upload ({name,size,url}[] in form state) ---------------- */
function FileBox({ id, value = [], onChange, accept, image, multiple }) {
  const pick = (e) => {
    const files = [...(e.target.files || [])].map((f) => ({ name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f) }));
    e.target.value = "";
    if (files.length) onChange(multiple ? [...value, ...files] : [files[0]]);
  };
  return (
    <div>
      <label className={`vf-file ${value.length ? "has" : ""}`} htmlFor={id}>
        <input id={id} className="vf-file-input" type="file" accept={accept} multiple={multiple} onChange={pick} />
        <span className="vf-file-btn">{multiple ? "Choose files" : "Choose file"}</span>
        <span className="vf-file-name">{value.length ? value.map((f) => f.name).join(", ") : "No file chosen"}</span>
        {value.length > 0 && (
          <button type="button" className="vf-file-clear" aria-label="Remove file" title="Remove"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange([]); }}>×</button>
        )}
      </label>
      {value.length > 0 && (
        <small className="ef-fileinfo">
          {value.map((f, i) => <a key={i} href={f.url} target="_blank" rel="noreferrer">{f.name}{f.size ? ` (${kb(f.size)})` : ""}</a>)}
        </small>
      )}
      {image && value[0] && (!value[0].type || value[0].type.startsWith("image/")) && value[0].url && (
        <img className="ef-preview" src={value[0].url} alt="Preview" />
      )}
    </div>
  );
}

/**
 * Config-driven full page entry form (same look as the Vehicle form).
 *
 * sections: [{ icon, title, fields: [{
 *   key, label, type?: text|number|tel|date|time|year|select|search|textarea|file|image,
 *   required?, options?, placeholder?, hint?, span?: 1-4, readOnly?, accept?, multiple?,
 *   compute?(form) -> value      (auto-calculated, read only)
 *   visible?(form) -> bool, disabled?(form) -> bool,
 *   onChange?(value, form) -> patch   (extra fields to update, e.g. auto-fill)
 *   maxDate?, minDate?
 * }] }]
 */
export default function EntryForm({ title, idLine, listPath, manageLabel, sections, initial, onSubmit, validate, saveLabel }) {
  const nav = useNavigate();
  const fields = useMemo(() => sections.flatMap((s) => s.fields), [sections]);
  const withComputed = (f) => { const n = { ...f }; fields.forEach((x) => { if (x.compute) n[x.key] = x.compute(n); }); return n; };
  const [form, setForm] = useState(() => withComputed(initial));
  const [errors, setErrors] = useState({});

  const set = (field, v) => {
    const patch = { [field.key]: v, ...(field.onChange?.(v, form) || {}) };
    setForm((p) => withComputed({ ...p, ...patch }));
    setErrors((p) => ({ ...p, ...Object.fromEntries(Object.keys(patch).map((k) => [k, undefined])) }));
  };
  const labelOf = (f) => (typeof f.label === "function" ? f.label(form) : f.label);
  const isOff = (f) => (f.disabled ? f.disabled(form) : false);
  const isShown = (f) => (f.visible ? f.visible(form) : true);

  const check = () => {
    const e = {};
    fields.forEach((f) => {
      if (!isShown(f) || isOff(f) || f.compute || f.readOnly) return;
      const raw = form[f.key];
      const v = typeof raw === "string" ? raw.trim() : raw;
      const empty = Array.isArray(v) ? !v.length : v === "" || v === undefined || v === null;
      if (f.required && empty) e[f.key] = `${labelOf(f)} is required`;
      else if (f.type === "tel" && v && String(v).replace(/\D/g, "").length < 10) e[f.key] = "Enter a valid 10 digit number";
      else if (f.type === "number" && !empty && Number(v) < 0) e[f.key] = "Must be 0 or more";
    });
    return { ...e, ...Object.fromEntries(Object.entries(validate?.(form) || {}).filter(([, m]) => m)) };
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = check();
    setErrors(e);
    if (Object.keys(e).length) { setTimeout(() => document.querySelector(".ef .vf-err")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0); return; }
    onSubmit(Object.fromEntries(fields.map((f) => {
      const v = form[f.key];
      if (!isShown(f) || isOff(f)) return [f.key, f.type === "file" || f.type === "image" ? [] : ""];
      if (f.type === "number") return [f.key, v === "" || v == null ? "" : Number(v)];
      return [f.key, typeof v === "string" ? v.trim() : v];
    })));
  };

  const control = (raw) => {
    const f = { ...raw, label: labelOf(raw), options: typeof raw.options === "function" ? raw.options(form) : raw.options };
    const id = `ef_${f.key}`;
    const v = form[f.key] ?? "";
    const off = isOff(f);
    const ph = f.placeholder ?? `Enter ${f.label.replace(/\s*\(.*?\)/g, "").toLowerCase()}`;
    const sel = `Select ${f.label.replace(/\s*\(.*?\)/g, "").toLowerCase()}`;
    switch (f.type) {
      case "date":
        return <DatePicker id={id} selected={toDate(v)} onChange={(d) => set(f, toIso(d))} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy"
          isClearable={!off} disabled={off} autoComplete="off" showMonthDropdown showYearDropdown dropdownMode="select" scrollableYearDropdown
          yearDropdownItemNumber={40} minDate={f.minDate ? toDate(f.minDate(form)) : undefined} maxDate={f.maxDate ? toDate(f.maxDate(form)) : undefined} wrapperClassName="vf-dp" />;
      case "time":
        return <DatePicker id={id} selected={toTime(v)} onChange={(d) => set(f, fromTime(d))} showTimeSelect showTimeSelectOnly timeIntervals={15}
          timeCaption="Time" dateFormat="hh:mm aa" placeholderText="hh:mm" isClearable={!off} disabled={off} autoComplete="off" wrapperClassName="vf-dp" />;
      case "year":
        return <DatePicker id={id} selected={v ? new Date(Number(v), 0, 1) : null} onChange={(d) => set(f, d ? String(d.getFullYear()) : "")}
          showYearPicker dateFormat="yyyy" yearItemNumber={12} placeholderText="yyyy" isClearable={!off} disabled={off} autoComplete="off"
          maxDate={new Date(new Date().getFullYear() + 1, 11, 31)} wrapperClassName="vf-dp" />;
      case "select":
        return (
          <select id={id} value={v} disabled={off} onChange={(e) => set(f, e.target.value)}>
            <option value="">{f.placeholder || sel}</option>
            {f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        );
      case "search":
        return <SearchSelect id={id} value={v} options={f.options} disabled={off} placeholder={f.placeholder || `Search ${f.label.replace(/\s*\(.*?\)/g, "").toLowerCase()}`} onChange={(x) => set(f, x)} />;
      case "textarea":
        return <textarea id={id} rows={f.rows || 3} value={v} placeholder={ph} disabled={off} onChange={(e) => set(f, e.target.value)} />;
      case "file":
      case "image":
        return <FileBox id={id} value={form[f.key] || []} image={f.type === "image"} multiple={f.multiple} onChange={(x) => set(f, x)}
          accept={f.accept || (f.type === "image" ? "image/*" : ".pdf,.jpg,.jpeg,.png")} />;
      default:
        return (
          <input id={id} type={f.type || "text"} value={v} placeholder={f.compute || f.readOnly ? "Auto" : ph}
            min={f.type === "number" ? 0 : undefined} step={f.type === "number" ? "any" : undefined}
            readOnly={!!(f.compute || f.readOnly)} disabled={off} onChange={(e) => set(f, e.target.value)} />
        );
    }
  };

  return (
    <div className="zpage vf ef">
      <div className="vf-top">
        <div>
          <h2>{title}</h2>
          {idLine && <p>{idLine}</p>}
        </div>
        <button type="button" className="zbtn vf-manage" onClick={() => nav(listPath)}><List size={15} /> {manageLabel}</button>
      </div>

      <form onSubmit={submit} noValidate>
        {sections.map((s, si) => {
          const Icon = s.icon;
          return (
            <section className="vf-sec" key={si}>
              <h3>{Icon && <Icon size={17} />} {s.title}</h3>
              <div className="vf-grid">
                {s.fields.filter(isShown).map((f) => (
                  <div key={f.key} className={`zf ${errors[f.key] ? "vf-err" : ""} ${f.compute || f.readOnly ? "ef-auto" : ""}`}
                    style={f.span ? { gridColumn: f.span === 4 ? "1 / -1" : `span ${f.span}` } : undefined}>
                    <label htmlFor={`ef_${f.key}`}>{labelOf(f)}{f.required && !isOff(f) && <span className="zreq">*</span>}</label>
                    {control(f)}
                    {f.hint && <small className="vf-hint">{typeof f.hint === "function" ? f.hint(form) : f.hint}</small>}
                    {errors[f.key] && <small className="zerr">{errors[f.key]}</small>}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        <div className="vf-actions">
          <button className="zbtn" type="submit">{saveLabel}</button>
          <button className="zbtn ghost" type="button" onClick={() => nav(listPath)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
