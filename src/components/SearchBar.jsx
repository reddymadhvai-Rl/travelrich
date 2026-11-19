import { useEffect, useState } from "react";
import { Search, X, ListFilter } from "lucide-react";
import "../controls.css";

/** Search input + Search button + filter icon (toggles the page's filter panel). */
export default function SearchBar({ value, onSearch, placeholder, filterOpen, filterCount = 0, onFilter }) {
  const [t, setT] = useState(value || "");
  useEffect(() => { setT(value || ""); }, [value]);
  const go = () => onSearch(t.trim());
  return (
    <div className="zsb">
      <div className="zsearch">
        <input placeholder={placeholder} value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} />
        {t && <button type="button" onClick={() => { setT(""); onSearch(""); }} aria-label="Clear"><X size={15} /></button>}
      </div>
      <button type="button" className="zbtn zsb-go" onClick={go}><Search size={15} /> Search</button>
      <button type="button" className={`zicon ${filterOpen || filterCount ? "on" : ""}`} onClick={onFilter} title="Filter" aria-label="Filter" aria-expanded={!!filterOpen}>
        <ListFilter size={17} />{filterCount > 0 && <i />}
      </button>
    </div>
  );
}
