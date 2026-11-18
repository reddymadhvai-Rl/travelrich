import {
  ShoppingCart, FileWarning, Car, UserRound, CalendarDays, IndianRupee, Wallet, FileText, Tag, MapPin, Activity,
  Hash, Store as StoreIcon, CircleCheck, Hourglass, Building2, Phone, Fuel, Layers, Snowflake, Package, CreditCard,
} from "lucide-react";
import DataPage from "../components/DataPage.jsx";
import { purchases, challans, drivers } from "../data.js";
import { useVehicles } from "../vehicleStore.js";
import { branchStore, fuelTypeStore, categoryStore, vehicleTypeStore } from "../masterStore.js";

const STATUS = ["Active", "Inactive"];
const statusField = { key: "status", label: "Status", type: "select", options: STATUS, default: "Active", half: true };
const statusCol = { key: "status", label: "Status", icon: Activity, badge: true };
const driverNames = drivers.map((d) => d.name);

/* ======================= Purchases ======================= */
const PURCHASE_CATEGORIES = ["Vehicle Purchase", "Spare Parts", "Tyres", "Fuel", "Accessories", "Other"];
const PAY_MODES = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"];

export const PurchasesPage = () => {
  const vehicleNos = useVehicles().map((v) => v.regNo);
  return (
    <DataPage
      title="Purchases" singular="Purchase" idPrefix="PU" initial={purchases}
      subtitle="Purchases made for vehicle transportation – who you bought from, what, and who paid"
      filters={{ dateKey: "date", select: { key: "category", label: "Category", options: PURCHASE_CATEGORIES } }}
      tabs={[{ label: "All Purchases", icon: ShoppingCart }]}
      columns={[
        { key: "id", label: "ID", id: true },
        { key: "date", label: "Date", icon: CalendarDays },
        { key: "purchasedFrom", label: "Purchased From", icon: StoreIcon, primary: true },
        { key: "item", label: "Item", icon: Package },
        { key: "category", label: "Category", icon: Tag },
        { key: "vehicle", label: "Vehicle", icon: Car },
        { key: "qty", label: "Qty", icon: Hash },
        { key: "amount", label: "Amount", icon: IndianRupee, money: true },
        { key: "mode", label: "Payment Mode", icon: CreditCard },
        { key: "paidBy", label: "Paid By", icon: Wallet },
        { key: "spentBy", label: "Spent By", icon: UserRound },
      ]}
      fields={[
        { key: "purchasedFrom", label: "Purchased From", required: true, placeholder: "Supplier / shop / dealer name" },
        { key: "date", label: "Date", type: "date", required: true, half: true },
        { key: "category", label: "Category", type: "select", options: PURCHASE_CATEGORIES, required: true, half: true },
        { key: "item", label: "Item / Description", required: true, placeholder: "e.g. Brake pads, tyres, diesel" },
        { key: "vehicle", label: "Vehicle (optional)", type: "select", options: vehicleNos, placeholder: "No vehicle", half: true },
        { key: "qty", label: "Quantity", type: "number", default: 1, half: true },
        { key: "amount", label: "Amount (₹)", type: "number", required: true, half: true },
        { key: "mode", label: "Payment Mode", type: "select", options: PAY_MODES, half: true },
        { key: "paidBy", label: "Paid By", placeholder: "Who paid the amount", half: true },
        { key: "spentBy", label: "Spent By", placeholder: "Who spent the amount", half: true },
        { key: "note", label: "Note" },
      ]}
    />
  );
};

/* ======================= Challans ======================= */
const VIOLATIONS = [
  "Over Speeding", "Signal Jumping", "No Parking", "Wrong Parking", "No Seat Belt", "Overloading",
  "Permit Violation", "Documents Not Carried", "Other",
];

export const ChallansPage = () => {
  const vehicleNos = useVehicles().map((v) => v.regNo);
  return (
    <DataPage
      title="Challans" singular="Challan" idPrefix="CH" initial={challans}
      subtitle="Traffic challans raised against your vehicles and drivers"
      filters={{ dateKey: "date", select: { key: "violation", label: "Violation", options: VIOLATIONS } }}
      tabs={[
        { label: "All Challans", icon: FileWarning },
        { label: "Pending", icon: Hourglass, test: (r) => r.status === "Pending" },
        { label: "Paid", icon: CircleCheck, test: (r) => r.status === "Paid" },
      ]}
      columns={[
        { key: "id", label: "ID", id: true },
        { key: "challanNo", label: "Challan No", icon: Hash, primary: true },
        { key: "date", label: "Challan Date", icon: CalendarDays },
        { key: "vehicle", label: "Vehicle", icon: Car },
        { key: "driver", label: "Driver", icon: UserRound },
        { key: "violation", label: "Violation", icon: Tag },
        { key: "location", label: "Location", icon: MapPin },
        { key: "amount", label: "Fine Amount", icon: IndianRupee, money: true },
        { key: "dueDate", label: "Due Date", icon: CalendarDays },
        { key: "status", label: "Status", icon: Activity, badge: true },
      ]}
      fields={[
        { key: "challanNo", label: "Challan Number", required: true, placeholder: "TS-CH-000000", half: true },
        { key: "date", label: "Challan Date", type: "date", required: true, half: true },
        { key: "vehicle", label: "Vehicle", type: "select", options: vehicleNos, required: true, half: true },
        { key: "driver", label: "Driver", type: "select", options: driverNames, half: true },
        { key: "violation", label: "Violation", type: "select", options: VIOLATIONS, required: true, half: true },
        { key: "location", label: "Location", placeholder: "Where it was issued", half: true },
        { key: "amount", label: "Fine Amount (₹)", type: "number", required: true, half: true },
        { key: "dueDate", label: "Due Date", type: "date", half: true },
        { key: "status", label: "Status", type: "select", options: ["Pending", "Paid", "Disputed"], default: "Pending", required: true, half: true },
        { key: "paidBy", label: "Paid By", placeholder: "Who paid the fine", half: true },
        { key: "note", label: "Note" },
      ]}
    />
  );
};

/* ======================= Master Data ======================= */
export const BranchesPage = () => (
  <DataPage
    title="Branches" singular="Branch" idPrefix="BR" store={branchStore}
    subtitle="Branches used on vehicles and across the app"
    tabs={[{ label: "All Branches", icon: Building2 }]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "name", label: "Branch Name", icon: Building2, primary: true },
      { key: "code", label: "Code", icon: Hash },
      { key: "city", label: "City", icon: MapPin },
      { key: "phone", label: "Phone", icon: Phone },
      statusCol,
    ]}
    fields={[
      { key: "name", label: "Branch Name", required: true, half: true },
      { key: "code", label: "Branch Code", placeholder: "HYD", half: true },
      { key: "city", label: "City", half: true },
      { key: "phone", label: "Phone Number", type: "tel", half: true },
      { key: "address", label: "Address" },
      statusField,
    ]}
  />
);

export const FuelTypesPage = () => (
  <DataPage
    title="Fuel Types" singular="Fuel Type" idPrefix="FT" store={fuelTypeStore}
    subtitle="Fuel types available when adding a vehicle"
    tabs={[{ label: "All Fuel Types", icon: Fuel }]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "name", label: "Fuel Type", icon: Fuel, primary: true },
      { key: "description", label: "Description", icon: FileText },
      statusCol,
    ]}
    fields={[
      { key: "name", label: "Fuel Type", required: true },
      { key: "description", label: "Description" },
      { ...statusField, half: false },
    ]}
  />
);

export const VehicleCategoriesPage = () => (
  <DataPage
    title="Vehicle Category" singular="Vehicle Category" idPrefix="VC" store={categoryStore}
    subtitle="Vehicle categories (Car, SUV, Bus …) used when adding a vehicle"
    tabs={[{ label: "All Categories", icon: Layers }]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "name", label: "Vehicle Category", icon: Layers, primary: true },
      { key: "description", label: "Description", icon: FileText },
      statusCol,
    ]}
    fields={[
      { key: "name", label: "Vehicle Category", required: true },
      { key: "description", label: "Description" },
      { ...statusField, half: false },
    ]}
  />
);

export const VehicleTypesPage = () => (
  <DataPage
    title="Vehicle Type" singular="Vehicle Type" idPrefix="VT" store={vehicleTypeStore}
    subtitle="Vehicle types (AC / Non-AC …) used when adding a vehicle"
    tabs={[{ label: "All Vehicle Types", icon: Snowflake }]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "name", label: "Vehicle Type", icon: Snowflake, primary: true },
      { key: "description", label: "Description", icon: FileText },
      statusCol,
    ]}
    fields={[
      { key: "name", label: "Vehicle Type", required: true },
      { key: "description", label: "Description" },
      { ...statusField, half: false },
    ]}
  />
);
