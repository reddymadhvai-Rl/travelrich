import { useSyncExternalStore } from "react";
import { vehicles as seed, fmtDate } from "./data.js";

/* ---------- options ---------- */
export const VEHICLE_TYPES = ["Car", "SUV", "Sedan", "Tempo Traveller", "Mini Bus", "Bus"];
export const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
export const OWNERSHIP = ["Owned", "Leased", "Attached"];
export const PERMIT_TYPES = ["Tourist", "State", "National"];
export const VEHICLE_GROUPS = ["Local", "Outstation", "Airport", "Corporate"];
export const VEHICLE_STATUS = ["Available", "Booked", "Under Maintenance", "Inactive", "Blocked", "Retired"];
export const BRANCHES = ["Hyderabad", "Secunderabad", "Vijayawada", "Visakhapatnam"];

/* ---------- date helpers (store ISO yyyy-mm-dd) ---------- */
const iso = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
export const daysLeft = (d) => (d ? Math.ceil((new Date(`${d}T00:00:00`) - new Date().setHours(0, 0, 0, 0)) / 86400000) : null);
export const showDate = (d) => (d ? fmtDate(new Date(`${d}T00:00:00`)) : "");

export const DOC_FIELDS = [
  ["insuranceExpiry", "Insurance"],
  ["fitnessExpiry", "Fitness"],
  ["permitExpiry", "Permit"],
  ["pucExpiry", "Pollution (PUC)"],
  ["roadTaxExpiry", "Road Tax"],
];

/** Document compliance is computed from expiry dates, separately from vehicle status. */
export function docState(v) {
  const expired = DOC_FIELDS.filter(([k]) => daysLeft(v[k]) !== null && daysLeft(v[k]) < 0).map(([, l]) => l);
  const soon = DOC_FIELDS.filter(([k]) => daysLeft(v[k]) !== null && daysLeft(v[k]) >= 0 && daysLeft(v[k]) <= 30).map(([, l]) => l);
  const missing = DOC_FIELDS.filter(([k]) => !v[k]).map(([, l]) => l);
  if (expired.length) return { label: "Documents Expired", tone: "st-red", expired, soon, missing };
  if (soon.length) return { label: "Expiring Soon", tone: "st-orange", expired, soon, missing };
  if (missing.length) return { label: "Incomplete", tone: "st-gray", expired, soon, missing };
  return { label: "Valid", tone: "st-teal", expired, soon, missing };
}

export function maintenanceState(v) {
  const d = daysLeft(v.nextServiceDue);
  if (d === null) return "Normal";
  return d < 0 ? "Overdue" : d <= 7 ? "Due" : "Normal";
}

/* ---------- seed (extends the old mock rows) ---------- */
const extra = {
  1: { make: "Toyota", model: "Innova Crysta", year: 2022, fuel: "Diesel", km: 48200, own: "Owned", ins: 120, fit: 200, per: 150, puc: 90 },
  2: { make: "Force", model: "Traveller 3350", year: 2021, fuel: "Diesel", km: 91500, own: "Owned", ins: 60, fit: 4, per: 200, puc: 40 },
  3: { make: "Volvo", model: "9400", year: 2019, fuel: "Diesel", km: 210000, own: "Attached", ins: 80, fit: 100, per: 70, puc: 9 },
  4: { make: "Maruti", model: "Swift Dzire", year: 2020, fuel: "CNG", km: 77000, own: "Owned", ins: -3, fit: 180, per: 90, puc: 60 },
  5: { make: "Maruti", model: "Ertiga", year: 2023, fuel: "Petrol", km: 22000, own: "Leased", ins: 200, fit: 300, per: 250, puc: 120 },
  6: { make: "Tata", model: "Starbus", year: 2018, fuel: "Diesel", km: 180000, own: "Owned", ins: 40, fit: 50, per: 15, puc: 30 },
  7: { make: "Toyota", model: "Innova", year: 2021, fuel: "Diesel", km: 65000, own: "Attached", ins: 150, fit: 220, per: 180, puc: 70 },
  8: { make: "Force", model: "Traveller 3350", year: 2022, fuel: "Diesel", km: 54000, own: "Owned", ins: 170, fit: 240, per: 190, puc: 100 },
  9: { make: "Toyota", model: "Innova", year: 2017, fuel: "Diesel", km: 232000, own: "Owned", ins: 30, fit: 60, per: 80, puc: 20 },
};
const typeMap = { "Swift Dzire": "Sedan", Ertiga: "SUV", Innova: "SUV", "Innova Crysta": "SUV", "Tempo Traveller": "Tempo Traveller", "Mini Bus": "Bus", "Volvo Bus": "Bus" };

const initial = seed.map((s) => {
  const e = extra[s.id];
  return {
    id: `VH-${s.id}`,
    regNo: s.number, type: typeMap[s.type] || "Car", make: e.make, model: e.model, year: e.year,
    seats: s.seats, fuel: e.fuel, ac: "AC", ownership: e.own,
    vendorName: e.own === "Owned" ? "" : "Sai Travels", vendorContact: e.own === "Owned" ? "" : "9848011122",
    leaseNo: "", leaseStart: "", leaseEnd: "",
    insuranceNo: `INS-${1000 + s.id}`, insuranceExpiry: iso(e.ins), fitnessExpiry: iso(e.fit),
    permitNo: `PRM-${2000 + s.id}`, permitType: "Tourist", permitExpiry: iso(e.per), pucExpiry: iso(e.puc), roadTaxExpiry: iso(e.per + 30),
    docVerified: "Verified",
    gpsId: `GPS-${3000 + s.id}`, gpsStatus: s.status === "Online" ? "Active" : "Inactive",
    status: s.id === 9 ? "Under Maintenance" : s.status === "Offline" ? "Inactive" : s.trip === "No Booking" ? "Available" : "Booked",
    trip: s.trip, branch: "Hyderabad", km: e.km, remarks: s.notes,
    group: "Outstation", kmLimit: 300, extraKmRate: 14, extraHourRate: 150, dailyRate: 3500, outstationRate: 13, driverBata: 400,
    toll: "Extra", parking: "Extra", fuelIncluded: "No", vendorRate: e.own === "Owned" ? 0 : 3000,
    driver: s.driver, lastService: iso(-40), nextServiceDue: iso(s.id === 1 ? 6 : 50),
  };
});

/* ---------- tiny external store ---------- */
let state = initial;
const subs = new Set();
const emit = () => subs.forEach((f) => f());
const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };

export const useVehicles = () => useSyncExternalStore(subscribe, () => state);

export function nextVehicleId() {
  const n = Math.max(0, ...state.map((v) => parseInt(String(v.id).replace(/\D/g, ""), 10) || 0)) + 1;
  return `VH-${n}`;
}
export function addVehicle(v) { state = [{ ...v, trip: "No Booking" }, ...state]; emit(); }
export function updateVehicle(id, v) { state = state.map((x) => (x.id === id ? { ...x, ...v } : x)); emit(); }
export function deleteVehicle(id) { state = state.filter((x) => x.id !== id); emit(); }
