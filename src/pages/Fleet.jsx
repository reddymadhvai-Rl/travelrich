import {
  ShoppingCart, FileWarning, Car, UserRound, CalendarDays, IndianRupee, Wallet, FileText, Tag, MapPin, Activity,
  Hash, Store as StoreIcon, CircleCheck, Hourglass, Building2, Phone, Fuel, Layers, Snowflake, Package, CreditCard,
  ClipboardList, UserCheck,
} from "lucide-react";
import DataPage from "../components/DataPage.jsx";
import { flattenFields } from "../components/EntryForm.jsx";
import { branchStore, fuelTypeStore, categoryStore, vehicleTypeStore } from "../masterStore.js";
import { purchaseStore, challanStore, assignmentStore, CHALLAN_TYPES, ASSIGNED_TO, VEHICLE_BRANDS } from "../fleetStore.js";
import { challanSections, purchaseSections, assignmentSections } from "./FleetForms.jsx";

const STATUS = ["Active", "Inactive"];
const statusField = { key: "status", label: "Status", type: "select", options: STATUS, default: "Active", half: true };
const statusCol = { key: "status", label: "Status", icon: Activity, badge: true };

/* ======================= Vehicle Purchases (full-page add / edit) ======================= */
/* label/type tweaks so the config-driven form fields can also feed the "View" dialog */
const viewFields = (sections) =>
  flattenFields(sections).map((f) => ({ ...f, label: typeof f.label === "function" ? "Assigned To (Name)" : f.label, type: f.type === "image" ? "file" : f.type }));
const NO_LISTS = { vehicles: [], branches: [], categories: [], vehicleTypes: [], fuelTypes: [] };

export const PurchasesPage = () => (
  <DataPage
    title="Vehicle Purchases" singular="Vehicle Purchase" idPrefix="PU" store={purchaseStore}
    newPath="/purchases/new" editPath={(r) => `/purchases/${r.id}/edit`} noDuplicate
    subtitle="Vehicles purchased – seller, invoice, cost, payment and documents"
    filters={{ dateKey: "purchaseDate", select: { key: "brand", label: "Brand", options: VEHICLE_BRANDS } }}
    tabs={[
      { label: "All Purchases", icon: ShoppingCart },
      { label: "Payment Pending", icon: Hourglass, test: (r) => r.payStatus !== "Paid" },
      { label: "Paid", icon: CircleCheck, test: (r) => r.payStatus === "Paid" },
    ]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "vehicleNo", label: "Vehicle Number", icon: Car, primary: true },
      { key: "brand", label: "Brand", icon: Tag },
      { key: "model", label: "Model", icon: Car },
      { key: "purchaseDate", label: "Purchase Date", icon: CalendarDays, date: true },
      { key: "purchaseType", label: "Type", icon: Layers },
      { key: "sellerName", label: "Seller / Dealer", icon: StoreIcon },
      { key: "invoiceNo", label: "Invoice No", icon: Hash },
      { key: "total", label: "Total Amount", icon: IndianRupee, money: true },
      { key: "payStatus", label: "Payment", icon: CreditCard, badge: true },
      { key: "vehicleStatus", label: "Vehicle Status", icon: Activity, badge: true },
    ]}
    fields={viewFields(purchaseSections(NO_LISTS))}
  />
);

/* ======================= Vehicle Challans (full-page add / edit) ======================= */
export const ChallansPage = () => (
  <DataPage
    title="Challans" singular="Challan" idPrefix="CH" store={challanStore}
    newPath="/challans/new" editPath={(r) => `/challans/${r.id}/edit`} noDuplicate
    subtitle="Traffic challans raised against your vehicles and drivers"
    filters={{ dateKey: "date", select: { key: "challanType", label: "Challan Type", options: CHALLAN_TYPES } }}
    tabs={[
      { label: "All Challans", icon: FileWarning },
      { label: "Pending", icon: Hourglass, test: (r) => r.payStatus === "Pending" },
      { label: "Paid", icon: CircleCheck, test: (r) => r.payStatus === "Paid" },
    ]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "challanNo", label: "Challan No", icon: Hash, primary: true },
      { key: "date", label: "Challan Date", icon: CalendarDays, date: true },
      { key: "vehicle", label: "Vehicle", icon: Car },
      { key: "driver", label: "Driver", icon: UserRound },
      { key: "challanType", label: "Challan Type", icon: Tag },
      { key: "location", label: "Location", icon: MapPin },
      { key: "total", label: "Total Amount", icon: IndianRupee, money: true },
      { key: "payStatus", label: "Payment", icon: CreditCard, badge: true },
      { key: "challanStatus", label: "Challan Status", icon: Activity, badge: true },
    ]}
    fields={viewFields(challanSections(NO_LISTS))}
  />
);

/* ======================= Company Vehicle Assignments (full-page add / edit) ======================= */
export const AssignmentsPage = () => (
  <DataPage
    title="Vehicle Assignments" singular="Assignment" idPrefix="AS" store={assignmentStore}
    newPath="/company-assignments/new" editPath={(r) => `/company-assignments/${r.id}/edit`} noDuplicate
    subtitle="Company vehicles assigned to employees, departments, branches or clients – with handover and return"
    filters={{ dateKey: "assignmentDate", select: { key: "assignedTo", label: "Assigned To", options: ASSIGNED_TO } }}
    tabs={[
      { label: "All Assignments", icon: ClipboardList },
      { label: "Assigned", icon: UserCheck, test: (r) => r.status === "Assigned" },
      { label: "Overdue", icon: Hourglass, test: (r) => r.status === "Overdue" },
      { label: "Returned", icon: CircleCheck, test: (r) => r.status === "Returned" },
    ]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "assignmentNo", label: "Assignment No", icon: Hash, primary: true },
      { key: "vehicle", label: "Vehicle", icon: Car },
      { key: "assignedTo", label: "Assigned To", icon: Layers },
      { key: "assignee", label: "Name", icon: UserRound },
      { key: "purpose", label: "Purpose", icon: Tag },
      { key: "assignmentDate", label: "Assigned On", icon: CalendarDays, date: true },
      { key: "expectedReturn", label: "Expected Return", icon: CalendarDays, date: true },
      { key: "returnDate", label: "Returned On", icon: CalendarDays, date: true },
      { key: "status", label: "Status", icon: Activity, badge: true },
    ]}
    fields={viewFields(assignmentSections(NO_LISTS))}
  />
);

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
