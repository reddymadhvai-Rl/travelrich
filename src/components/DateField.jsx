import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../controls.css";

export const isoToDate = (s) => (s ? new Date(`${s}T00:00:00`) : null);
export const dateToIso = (d) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "");

/** react-datepicker wrapper. value / onChange use ISO strings (yyyy-mm-dd). */
export default function DateField({ id, value, onChange, min, max, placeholder = "dd/mm/yyyy", disabled, clearable = true }) {
  return (
    <div className="df-wrap">
    <DatePicker
      id={id} selected={isoToDate(value)} onChange={(d) => onChange(dateToIso(d))}
      dateFormat="dd/MM/yyyy" placeholderText={placeholder} isClearable={clearable && !disabled} disabled={disabled} autoComplete="off"
      showMonthDropdown showYearDropdown dropdownMode="select" scrollableYearDropdown yearDropdownItemNumber={40}
      minDate={isoToDate(min) || undefined} maxDate={isoToDate(max) || undefined} wrapperClassName="vf-dp"
    />
    </div>
  );
}
