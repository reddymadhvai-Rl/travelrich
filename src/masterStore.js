import { useSyncExternalStore } from "react";

/* Tiny external store factory – lets a DataPage (Master Data screens) and other
   forms (e.g. the Vehicle form) share the same list of records. */
export function createStore(seed) {
  let state = seed;
  const subs = new Set();
  return {
    get: () => state,
    set: (next) => { state = typeof next === "function" ? next(state) : next; subs.forEach((f) => f()); },
    subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
  };
}

export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.get);
}

/* ---------- Master data ---------- */
export const branchStore = createStore([
  { id: 1, name: "Hyderabad", code: "HYD", city: "Hyderabad", phone: "98480 00002", address: "Plot 12, Madhapur, Hyderabad 500081", status: "Active" },
  { id: 2, name: "Secunderabad", code: "SEC", city: "Secunderabad", phone: "98480 00003", address: "Trimulgherry, Secunderabad 500015", status: "Active" },
  { id: 3, name: "Vijayawada", code: "VJA", city: "Vijayawada", phone: "98480 00005", address: "Benz Circle, Vijayawada 520010", status: "Active" },
  { id: 4, name: "Visakhapatnam", code: "VSP", city: "Visakhapatnam", phone: "98480 00006", address: "Dwaraka Nagar, Visakhapatnam 530016", status: "Active" },
]);

export const fuelTypeStore = createStore([
  { id: 1, name: "Petrol", description: "Petrol / gasoline engines", status: "Active" },
  { id: 2, name: "Diesel", description: "Diesel engines", status: "Active" },
  { id: 3, name: "CNG", description: "Compressed natural gas", status: "Active" },
  { id: 4, name: "Electric", description: "Battery electric vehicles", status: "Active" },
  { id: 5, name: "Hybrid", description: "Petrol / electric hybrid", status: "Active" },
]);

export const categoryStore = createStore(
  ["Car", "SUV", "MUV", "Sedan", "Tempo Traveller", "Mini Bus", "Bus"].map((name, i) => ({
    id: i + 1, name, description: "", status: "Active",
  }))
);

export const vehicleTypeStore = createStore(
  [["AC", "Air-conditioned vehicle"], ["Non-AC", "Vehicle without air-conditioning"]].map(([name, description], i) => ({
    id: i + 1, name, description, status: "Active",
  }))
);

/* active names only – used by dropdowns elsewhere in the app */
const activeNames = (rows) => rows.filter((r) => r.status !== "Inactive").map((r) => r.name);
export const useBranches = () => activeNames(useStore(branchStore));
export const useFuelTypes = () => activeNames(useStore(fuelTypeStore));
export const useCategories = () => activeNames(useStore(categoryStore));
export const useVehicleTypes = () => activeNames(useStore(vehicleTypeStore));
