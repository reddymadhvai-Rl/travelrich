import { useSyncExternalStore } from "react";
import { staff, attendanceToday } from "./data.js";

/* Shared attendance store used by Today, Add, Month and Year pages and by Payroll.
 * Demo records are generated; anything saved via "Add Attendance" / the Actions column
 * is kept as an override. Replace with API calls later. */

export const STATUSES = ["Present", "Absent", "Leave", "Weekly Off"];
export const CODE = { Present: "P", Absent: "A", Leave: "L", "Weekly Off": "W" };
export const pad = (n) => String(n).padStart(2, "0");
export const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayIso = () => toIso(new Date());

const overrides = new Map(); // `${empId}|${iso}` -> { status, in, out, remarks }
let version = 0;
const subs = new Set();
const emit = () => { version++; subs.forEach((f) => f()); };
const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };
export const useAttendanceVersion = () => useSyncExternalStore(subscribe, () => version);

// deterministic demo marks for past days
function demoStatus(empIdx, day, dow) {
  if (dow === 0) return "Weekly Off";
  const x = (empIdx * 31 + day * 17) % 23;
  return x === 0 ? "Absent" : x === 1 || x === 2 ? "Leave" : "Present";
}

/** Attendance record for one employee on one ISO date (null for future days). */
export function getRecord(emp, iso) {
  const o = overrides.get(`${emp.id}|${iso}`);
  if (o) return o;
  const d = new Date(`${iso}T00:00:00`);
  const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  if (d > t0) return null;
  if (iso === todayIso()) {
    const p = attendanceToday.present.find((x) => x.name === emp.name);
    if (p) return { status: "Present", in: p.time, out: "", remarks: "" };
    if (attendanceToday.leave.find((x) => x.name === emp.name)) return { status: "Leave", in: "", out: "", remarks: "" };
    return { status: "Absent", in: "", out: "", remarks: "" };
  }
  const idx = staff.findIndex((s) => s.id === emp.id);
  const status = demoStatus(idx, d.getDate(), d.getDay());
  return { status, in: status === "Present" ? "09:00 AM" : "", out: status === "Present" ? "06:00 PM" : "", remarks: "" };
}

export function setRecord(empId, iso, rec) {
  overrides.set(`${empId}|${iso}`, { status: "Present", in: "", out: "", remarks: "", ...rec });
  emit();
}

/** Count P/A/L/W for an employee over a list of ISO dates. */
export function summarize(emp, isos) {
  const s = { Present: 0, Absent: 0, Leave: 0, "Weekly Off": 0 };
  isos.forEach((i) => { const r = getRecord(emp, i); if (r) s[r.status]++; });
  return s;
}

export const monthDates = (y, m) => Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`);

export const nowTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }).toUpperCase();
