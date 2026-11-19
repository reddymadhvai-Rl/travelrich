import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import "../controls.css";

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, "");

/** Searchable dropdown – type to filter the options, click / Enter to pick. */
export default function SearchSelect({ id, value, options = [], onChange, placeholder, disabled }) {
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
