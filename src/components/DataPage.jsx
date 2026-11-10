import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Trash2, Pencil, X, Search, Star, ListFilter, MoreHorizontal, ChevronDown, Hash,
  List, Rows3, Download, RefreshCw, Settings2, Bold, Italic, Underline, Strikethrough, ListOrdered, Link2, Check,
  Paperclip, Upload, Eye, EyeOff, MapPin, Copy, Ban, RotateCcw,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { fmtDate } from "../data.js";
import { usePagination } from "./Pagination.jsx";

/* ---------------- helpers ---------------- */
const tone = (v) => {
  const s = String(v).toLowerCase();
  if (["online", "paid", "active", "completed", "on duty", "confirmed", "resolved"].includes(s)) return "st-teal";
  if (["pending", "partial", "ongoing", "on trip", "booked"].includes(s)) return "st-orange";
  if (["offline", "inactive", "off duty", "no booking"].includes(s)) return "st-gray";
  if (["cancelled", "breakdown"].includes(s)) return "st-red";
  return "st-blue";
};
const pad = (n) => String(n).padStart(2, "0");
const toInput = (v) => {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return isNaN(d) ? "" : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fromInput = (v) => (v ? fmtDate(new Date(`${v}T00:00:00`)) : "");
const stripHtml = (h) => String(h || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");

function nextId(rows, prefix) {
  const nums = rows.map((r) => parseInt(String(r.id).replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  return rows.some((r) => typeof r.id === "string") ? `${prefix}-${n}` : n;
}

function useOutside(ref, fn) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && fn();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, fn]);
}

/* small dropdown used for "All Vehicles", "List", filter and "..." menus */
export function Menu({ trigger, children, align = "left", fixed = false }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  useOutside(ref, () => setOpen(false));
  useEffect(() => {
    if (!open || !fixed) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [open, fixed]);
  const toggle = () => {
    if (!open && fixed && ref.current) {
      const r = ref.current.getBoundingClientRect();
      const up = window.innerHeight - r.bottom < 200; // flip upward near the bottom
      setPos({ right: Math.max(8, window.innerWidth - r.right), ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }) });
    }
    setOpen(!open);
  };
  return (
    <div className="zmenu" ref={ref}>
      <div onClick={toggle}>{trigger(open)}</div>
      {open && (
        <div className={`zmenu-panel ${align} ${fixed ? "fixed" : ""}`} style={fixed ? pos : undefined} onClick={() => setOpen(false)}>{children}</div>
      )}
    </div>
  );
}

/* popup confirmation dialog (replaces browser alerts) */
export function ConfirmDialog({ cfg, onClose }) {
  useEffect(() => {
    if (!cfg) return;
    const h = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [cfg, onClose]);
  if (!cfg) return null;
  const Icon = cfg.tone === "danger" ? Trash2 : cfg.tone === "info" ? RotateCcw : Ban;
  return (
    <>
      <div className="zscrim" onClick={onClose} />
      <div className={`zconfirm tone-${cfg.tone || "warn"}`} role="alertdialog" aria-modal="true" aria-label={cfg.title}>
        <button type="button" className="zconfirm-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="zconfirm-ico"><Icon size={26} /></div>
        <h4>{cfg.title}</h4>
        <p>{cfg.message}</p>
        <div className="zconfirm-btns">
          <button type="button" className="zbtn ghost" onClick={onClose}>{cfg.cancelLabel || "No, keep it"}</button>
          <button type="button" className={`zbtn zconfirm-ok ${cfg.tone || "warn"}`} autoFocus onClick={() => { cfg.run(); onClose(); }}>{cfg.confirmLabel || "Yes, confirm"}</button>
        </div>
      </div>
    </>
  );
}

/* tiny rich text editor (bold, italic, underline, strike, lists, link) */
function RichText({ value, onChange }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.innerHTML = value || ""; }, []); // eslint-disable-line
  const cmd = (c, arg) => { ref.current.focus(); document.execCommand(c, false, arg); onChange(ref.current.innerHTML); };
  const link = () => {
    const url = window.prompt("Enter link URL (https://...)");
    if (url && /^https?:\/\//i.test(url.trim())) cmd("createLink", url.trim());
  };
  const tools = [
    [Bold, "bold"], [Italic, "italic"], [Underline, "underline"], [Strikethrough, "strikeThrough"],
    [List, "insertUnorderedList"], [ListOrdered, "insertOrderedList"],
  ];
  return (
    <div className="zrte">
      <div className="zrte-bar">
        {tools.map(([Icon, c]) => (
          <button type="button" key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd(c)} aria-label={c}><Icon size={15} /></button>
        ))}
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={link} aria-label="link"><Link2 size={15} /></button>
      </div>
      <div className="zrte-body" ref={ref} contentEditable suppressContentEditableWarning onInput={() => onChange(ref.current.innerHTML)} />
    </div>
  );
}

/* multi-file attachment picker (keeps {name, url, size} in form state) */
function FilePicker({ id, value = [], onChange, accept }) {
  const add = (e) => {
    const picked = Array.from(e.target.files || []).map((f) => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }));
    if (picked.length) onChange([...(value || []), ...picked]);
    e.target.value = "";
  };
  const kb = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");
  return (
    <div className="zfile">
      <label className="zfile-drop" htmlFor={id}>
        <Upload size={16} /> Choose file(s) <small>PDF, JPG, PNG</small>
      </label>
      <input id={id} type="file" multiple accept={accept || ".pdf,.jpg,.jpeg,.png,.webp"} onChange={add} hidden />
      {(value || []).map((f, i) => (
        <div className="zfile-item" key={f.url + i}>
          <Paperclip size={14} />
          <a href={f.url} target="_blank" rel="noreferrer" title={f.name}>{f.name}</a>
          {f.size ? <small>{kb(f.size)}</small> : null}
          <button type="button" onClick={() => onChange(value.filter((_, x) => x !== i))} aria-label="Remove file"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function PasswordInput({ id, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="zpass">
      <input id={id} type={show ? "text" : "password"} value={value} placeholder={placeholder} autoComplete="new-password" onChange={(e) => onChange(e.target.value)} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
    </div>
  );
}

/**
 * Zoho-style list page + right-side "New ..." drawer.
 * columns: [{ key, label, icon, primary?, badge?, money?, id? }]
 * fields:  [{ key, label, type?, options?, required?, half?, default?, placeholder? }]
 * type: text | number | tel | email | date | select | checkbox | rich | file | password
 */
export default function DataPage({
  title, singular, subtitle, columns, fields = [], initial, idPrefix = "ID", tabs = [], readOnly = false, trackOf,
  filters, headActions, transform,
}) {
  const [rows, setRows] = useState(initial);
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState("");
  const [sortMode, setSortMode] = useState("all"); // all | az | za
  const [dense, setDense] = useState(false);
  const [filterVal, setFilterVal] = useState("");
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");
  const [fSel, setFSel] = useState("");
  const [fav, setFav] = useState(() => localStorage.getItem(`fav_${title}`) === "1");
  const [drawer, setDrawer] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");
  const [viewRow, setViewRow] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const timer = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const idCol = columns.find((c) => c.id);
  const primary = columns.find((c) => c.primary) || columns.find((c) => !c.id);
  const filterCol = columns.find((c) => c.badge);
  const allTabs = tabs.length ? tabs : [{ label: `All ${title}` }];

  const withComputed = (o) => { const n = { ...o }; fields.forEach((f) => { if (f.compute) n[f.key] = f.compute(n); }); return n; };
  const blank = () => withComputed(Object.fromEntries(fields.map((f) => [f.key, f.type === "checkbox" ? false : f.type === "file" ? [] : f.default ?? ""])));
  const flash = (m) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 2600); };
  const toggleFav = () => { const n = !fav; setFav(n); localStorage.setItem(`fav_${title}`, n ? "1" : "0"); };

  const list = useMemo(() => {
    let r = rows.filter((x) => (allTabs[tab].test ? allTabs[tab].test(x) : true));
    if (filterCol && filterVal) r = r.filter((x) => x[filterCol.key] === filterVal);
    if (filters?.dateKey && (fFrom || fTo)) {
      r = r.filter((x) => { const d = toInput(x[filters.dateKey]); return d && (!fFrom || d >= fFrom) && (!fTo || d <= fTo); });
    }
    if (filters?.select && fSel) r = r.filter((x) => x[filters.select.key] === fSel);
    const t = q.trim().toLowerCase();
    if (t) r = r.filter((x) => JSON.stringify(x).toLowerCase().includes(t));
    if (sortMode !== "all" && primary) {
      r = [...r].sort((a, b) => String(a[primary.key]).localeCompare(String(b[primary.key])) * (sortMode === "az" ? 1 : -1));
    }
    return r;
  }, [rows, tab, q, filterVal, sortMode, fFrom, fTo, fSel]); // eslint-disable-line

  const { rows: pageRows, pager } = usePagination(list);
  const filterOptions = filterCol ? [...new Set(rows.map((r) => r[filterCol.key]))] : [];

  /* ---- drawer ---- */
  const openNew = () => { setEditId(null); setForm(blank()); setErrors({}); setDrawer(true); };
  useEffect(() => {
    if (location.state?.openNew && !readOnly) { openNew(); navigate(location.pathname, { replace: true, state: null }); }
  }, [location.state]); // eslint-disable-line
  const openEdit = (r) => {
    const f = blank();
    fields.forEach((fl) => { const v = r[fl.key]; f[fl.key] = fl.type === "date" ? toInput(v) : v ?? f[fl.key]; });
    setEditId(r.id); setForm(withComputed(f)); setErrors({}); setDrawer(true);
  };
  const close = () => { setDrawer(false); setEditId(null); setErrors({}); };
  const set = (k, v) => {
    const extra = fields.find((f) => f.key === k)?.autofill?.(v) || {};
    setForm((p) => withComputed({ ...p, [k]: v, ...extra }));
    setErrors((p) => ({ ...p, [k]: undefined, ...Object.fromEntries(Object.keys(extra).map((x) => [x, undefined])) }));
  };

  const validate = () => {
    const err = {};
    fields.forEach((f) => {
      const raw = form[f.key];
      const v = typeof raw === "string" ? raw.trim() : raw;
      const emptyRich = f.type === "rich" && !String(v || "").replace(/<[^>]*>/g, "").trim();
      if (f.required && (f.type === "rich" ? emptyRich : !v && v !== 0)) err[f.key] = `${f.label} is required`;
      else if (f.type === "tel" && v && String(v).replace(/\D/g, "").length < 10) err[f.key] = "Enter a valid 10 digit number";
      else if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err[f.key] = "Enter a valid email address";
      else if (f.type === "password" && v && String(v).length < 6) err[f.key] = "Password must be at least 6 characters";
      else if (f.type === "number" && v !== "" && Number(v) < 0) err[f.key] = f.compute ? "Paid, advance and discount cannot exceed the amount" : "Must be 0 or more";
    });
    return err;
  };

  const save = (another = false) => (e) => {
    e?.preventDefault?.();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;
    const data = {};
    fields.forEach((f) => {
      const v = form[f.key];
      data[f.key] = f.type === "number" ? Number(v || 0) : f.type === "date" ? fromInput(v) : typeof v === "string" ? v.trim() : v;
    });
    if (transform) Object.assign(data, transform(data));
    if (editId !== null) {
      setRows((p) => p.map((r) => (r.id === editId ? { ...r, ...data } : r)));
      flash(`${singular} updated successfully`);
      close();
    } else {
      setRows((p) => [{ id: nextId(p, idPrefix), ...data }, ...p]);
      flash(`${singular} added successfully`);
      if (another) { setForm(blank()); setErrors({}); } else close();
    }
  };

  const remove = (r) => setConfirm({
    tone: "danger", title: `Delete ${singular.toLowerCase()}?`,
    message: `This ${singular.toLowerCase()} will be permanently removed. This action cannot be undone.`,
    confirmLabel: "Yes, delete",
    run: () => { setRows((p) => p.filter((x) => x.id !== r.id)); flash(`${singular} deleted`); },
  });

  const exportCsv = () => {
    const cols = columns.filter((c) => !c.id || true);
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.map((c) => esc(c.label)).join(","), ...list.map((r) => cols.map((c) => esc(c.id ? r.id : r[c.key])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${title.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const duplicate = (r) => {
    setRows((p) => [{ ...r, id: nextId(p, idPrefix) }, ...p]);
    flash(`${singular} duplicated`);
  };
  const statusField = fields.find((f) => f.key === "status" && f.type === "select");
  const toggleCancel = (r) => {
    const cancelling = !r.cancelled;
    setConfirm({
      tone: cancelling ? "warn" : "info",
      title: cancelling ? `Cancel ${singular.toLowerCase()}?` : `Restore ${singular.toLowerCase()}?`,
      message: cancelling ? `This ${singular.toLowerCase()} will be marked as cancelled. You can restore it later.` : `This ${singular.toLowerCase()} will be marked active again.`,
      confirmLabel: cancelling ? "Yes, cancel" : "Yes, restore",
      run: () => {
        setRows((p) => p.map((x) => {
          if (x.id !== r.id) return x;
          if (cancelling) return { ...x, cancelled: true, _prev: x.status, ...(statusField?.options.includes("Cancelled") ? { status: "Cancelled" } : {}) };
          return { ...x, cancelled: false, ...(statusField?.options.includes("Cancelled") ? { status: x._prev || statusField.options[0] } : {}) };
        }));
        flash(cancelling ? `${singular} cancelled` : `${singular} restored`);
      },
    });
  };
  const viewVal = (f, v) => {
    if (f.type === "file") return Array.isArray(v) && v.length ? <span className="zfiles">{v.map((x, i) => <a key={i} href={x.url} target="_blank" rel="noreferrer"><Paperclip size={12} />{x.name}</a>)}</span> : "—";
    if (f.type === "password") return "••••••••";
    if (f.type === "rich") return stripHtml(v) || "—";
    if (f.type === "checkbox") return v ? "Yes" : "No";
    if (f.type === "number" && f.label.includes("₹")) return money(v);
    return v === undefined || v === "" ? "—" : String(v);
  };
  const reset = () => { setQ(""); setFilterVal(""); setSortMode("all"); setTab(0); setFFrom(""); setFTo(""); setFSel(""); };

  const cell = (c, r) => {
    const v = r[c.key];
    if (c.id) return <span className="zchip">{typeof r.id === "number" ? `${idPrefix}-${r.id}` : r.id}</span>;
    if (c.badge) return v;
    if (c.masked) return <span className="zmuted" style={{ letterSpacing: 2 }}>••••••••</span>;
    if (c.files) {
      const n = Array.isArray(v) ? v.length : 0;
      return n ? (
        <span className="zfiles">{v.map((f, i) => <a key={i} href={f.url} target="_blank" rel="noreferrer" title={f.name}><Paperclip size={12} />{f.name.length > 14 ? f.name.slice(0, 12) + "…" : f.name}</a>)}</span>
      ) : <span className="zmuted">—</span>;
    }
    if (c.money) return money(v);
    if (c.rich) { const t = stripHtml(v); return t ? <span className="zclip" title={t}>{t}</span> : <span className="zmuted">—</span>; }
    if (c.primary) return readOnly ? <b>{v}</b> : <button type="button" className="zlink" onClick={() => openEdit(r)}>{v}</button>;
    return v === undefined || v === "" ? <span className="zmuted">—</span> : v;
  };

  /* group fields: consecutive half-width fields share a row */
  const groups = [];
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].half && fields[i + 1]?.half) { groups.push([fields[i], fields[i + 1]]); i++; }
    else groups.push([fields[i]]);
  }
  const renderField = (f, autoFocus) => (
    <div className={`zf ${f.type === "checkbox" ? "zf-check" : ""}`} key={f.key}>
      {f.type === "checkbox" ? (
        <label className="zcheck"><input type="checkbox" checked={!!form[f.key]} onChange={(e) => set(f.key, e.target.checked)} />{f.label}</label>
      ) : (
        <>
          <label htmlFor={`f_${f.key}`}>{f.label}{f.required && <span className="zreq">*</span>}</label>
          {f.type === "select" ? (
            <select id={`f_${f.key}`} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}>
              <option value="">Select</option>
              {f.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : f.type === "file" ? (
            <FilePicker id={`f_${f.key}`} value={form[f.key]} accept={f.accept} onChange={(v) => set(f.key, v)} />
          ) : f.type === "password" ? (
            <PasswordInput id={`f_${f.key}`} value={form[f.key]} placeholder={f.placeholder} onChange={(v) => set(f.key, v)} />
          ) : f.type === "rich" ? (
            <RichText key={`${editId}-${drawer}`} value={form[f.key]} onChange={(h) => set(f.key, h)} />
          ) : (
            <input id={`f_${f.key}`} type={f.type || "text"} value={form[f.key]} min={f.type === "number" ? 0 : undefined}
              placeholder={f.placeholder} autoFocus={autoFocus} readOnly={!!f.compute} className={f.compute ? "zro" : undefined} onChange={(e) => set(f.key, e.target.value)} />
          )}
        </>
      )}
      {errors[f.key] && <small className="zerr">{errors[f.key]}</small>}
    </div>
  );

  return (
    <div className="zpage">
      <div className="zhead">
        <p>{subtitle}</p>
        <div className="zhead-r">
          {headActions}
          {!readOnly && <button className="zbtn" onClick={openNew}><Plus size={15} /> New {singular}</button>}
        </div>
      </div>

      <div className="zcard">
        {/* tabs */}
        <div className="ztabs">
          {allTabs.map((t, i) => {
            const Icon = t.icon;
            return (
              <button key={t.label} className={tab === i ? "on" : ""} onClick={() => setTab(i)}>
                {Icon && <Icon size={16} />}{t.label}<span className="ztab-count">{rows.filter((x) => (t.test ? t.test(x) : true)).length}</span>
              </button>
            );
          })}
        </div>

        {/* view bar */}
        <div className="zbar">
          <div className="zbar-l">
            <Menu trigger={(open) => (
              <button className="zview">{sortMode === "all" ? `All ${title}` : sortMode === "az" ? `${title} A – Z` : `${title} Z – A`}<ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none" }} /></button>
            )}>
              {[["all", `All ${title}`], ["az", "Name A – Z"], ["za", "Name Z – A"]].map(([k, l]) => (
                <button key={k} className={sortMode === k ? "on" : ""} onClick={() => setSortMode(k)}>{l}{sortMode === k && <Check size={15} />}</button>
              ))}
            </Menu>
            <button className={`zstar ${fav ? "on" : ""}`} onClick={toggleFav} title="Mark as default view" aria-label="Favourite view"><Star size={17} /></button>
          </div>
          <div className="zbar-r">
            <div className="zsearch"><input placeholder={`Search ${title.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} />{q && <button onClick={() => setQ("")} aria-label="Clear"><X size={15} /></button>}</div>
            {filters && (
              <div className="zfilters inline">
            {filters.dateKey && (
              <>
                <label>From date<input type="date" value={fFrom} max={fTo || undefined} onChange={(e) => setFFrom(e.target.value)} /></label>
                <label>To date<input type="date" value={fTo} min={fFrom || undefined} onChange={(e) => setFTo(e.target.value)} /></label>
              </>
            )}
            {filters.select && (
              <label>{filters.select.label}
                <select value={fSel} onChange={(e) => setFSel(e.target.value)}>
                  <option value="">All</option>
                  {filters.select.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            )}
            {(fFrom || fTo || fSel) && <button type="button" className="zbtn ghost" onClick={() => { setFFrom(""); setFTo(""); setFSel(""); }}><X size={14} /> Clear</button>}
          </div>
            )}
            <Menu align="right" trigger={(open) => (
              <button className="zview small">{dense ? <Rows3 size={17} /> : <List size={17} />}{dense ? "Compact" : "List"}<ChevronDown size={15} style={{ transform: open ? "rotate(180deg)" : "none" }} /></button>
            )}>
              <button className={!dense ? "on" : ""} onClick={() => setDense(false)}><List size={15} /> List{!dense && <Check size={15} />}</button>
              <button className={dense ? "on" : ""} onClick={() => setDense(true)}><Rows3 size={15} /> Compact{dense && <Check size={15} />}</button>
            </Menu>
            {filterCol && (
              <Menu align="right" trigger={() => (
                <button className={`zicon ${filterVal ? "on" : ""}`} title="Filter" aria-label="Filter"><ListFilter size={17} />{filterVal && <i />}</button>
              )}>
                <div className="zmenu-title">Filter by {filterCol.label}</div>
                <button className={!filterVal ? "on" : ""} onClick={() => setFilterVal("")}>All{!filterVal && <Check size={15} />}</button>
                {filterOptions.map((o) => <button key={o} className={filterVal === o ? "on" : ""} onClick={() => setFilterVal(o)}>{o}{filterVal === o && <Check size={15} />}</button>)}
              </Menu>
            )}
            <Menu align="right" trigger={() => <button className="zicon" title="More" aria-label="More"><MoreHorizontal size={17} /></button>}>
              <button onClick={exportCsv}><Download size={15} /> Export as CSV</button>
              <button onClick={reset}><RefreshCw size={15} /> Reset view</button>
            </Menu>
          </div>
        </div>

        {/* table */}
        <div className="zscroll">
          <table className={`ztable ${dense ? "dense" : ""}`}>
            <thead>
              <tr>
                {columns.map((c) => {
                  const Icon = c.icon || (c.id ? Hash : null);
                  return <th key={c.key} className={c.id ? "idcol" : ""}>{Icon && <Icon size={15} />}{c.label}</th>;
                })}
                {!readOnly && <th className="actcol"><Settings2 size={15} />Actions</th>}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className={r.cancelled ? "row-cancelled" : ""}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.badge ? `zst ${tone(r[c.key])}` : c.id ? "idcol" : c.primary ? "prim" : ""}>{cell(c, r)}</td>
                  ))}
                  {!readOnly && (
                    <td className="actcol">
                      <span className="zacts">
                        <button onClick={() => openEdit(r)} title="Edit" aria-label="Edit"><Pencil size={16} /></button>
                        <button className="cxl" onClick={() => toggleCancel(r)} title={r.cancelled ? "Restore" : "Cancel"} aria-label="Cancel">{r.cancelled ? <RotateCcw size={16} /> : <Ban size={16} />}</button>
                        <button className="del" onClick={() => remove(r)} title="Delete" aria-label="Delete"><Trash2 size={16} /></button>
                        <Menu align="right" fixed trigger={() => <button title="More" aria-label="More"><MoreHorizontal size={16} /></button>}>
                          <button onClick={() => setViewRow(r)}><Eye size={15} /> View</button>
                          <button onClick={() => duplicate(r)}><Copy size={15} /> Duplicate</button>
                        </Menu>
                      </span>
                    </td>
                  )}
                </tr>
              ))}
              {!list.length && <tr><td className="zempty" colSpan={columns.length + 1}>No records found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="zfoot">Total Count: <b>{list.length}</b></div>
        {pager}
      </div>

      {/* New / Edit drawer */}
      {drawer && <div className="zscrim" onClick={close} />}
      {drawer && (
        <form className="zdrawer" onSubmit={save(false)} noValidate>
          <div className="zdh">
            <b>{editId !== null ? `Edit ${singular}` : `New ${singular}`}</b><span>Standard Layout</span>
            <button type="button" className="zbtn zdh-manage" onClick={close}><List size={14} /> Manage {title}</button>
            <button type="button" className="zx" onClick={close} aria-label="Close"><X size={18} /></button>
          </div>
          <div className="zdb">
            {groups.map((g, gi) => (
              <div className={g.length === 2 ? "zrow2" : "zrow1"} key={gi}>{g.map((f) => renderField(f, gi === 0))}</div>
            ))}
          </div>
          <div className="zdf">
            <button className="zbtn" type="submit">{editId !== null ? "Update" : "Add"}</button>
            <button type="button" className="zbtn ghost" onClick={close}>Cancel</button>
            {editId === null && <button type="button" className="zlink-b" onClick={save(true)}>Add &amp; New</button>}
          </div>
        </form>
      )}

      <ConfirmDialog cfg={confirm} onClose={() => setConfirm(null)} />

      {viewRow && <div className="zscrim" onClick={() => setViewRow(null)} />}
      {viewRow && (
        <div className="zmodal" role="dialog" aria-label={`${singular} details`}>
          <div className="zdh">
            <b>{singular} Details</b>
            {viewRow.cancelled && <span className="zbadge-c">Cancelled</span>}
            <button type="button" className="zx" onClick={() => setViewRow(null)} aria-label="Close"><X size={18} /></button>
          </div>
          <div className="zmodal-body">
            <div className="zv"><label>ID</label><span>{typeof viewRow.id === "number" ? `${idPrefix}-${viewRow.id}` : viewRow.id}</span></div>
            {fields.map((f) => <div className={`zv ${f.type === "rich" || f.type === "file" ? "full" : ""}`} key={f.key}><label>{f.label}</label><span>{viewVal(f, viewRow[f.key])}</span></div>)}
          </div>
          {!readOnly && (
            <div className="zdf">
              <button className="zbtn" onClick={() => { const r = viewRow; setViewRow(null); openEdit(r); }}><Pencil size={14} /> Edit</button>
              <button className="zbtn ghost" onClick={() => setViewRow(null)}>Close</button>
            </div>
          )}
        </div>
      )}

      {toast && <div className="zsnack" role="status"><span><Check size={13} /></span>{toast}</div>}
    </div>
  );
}
