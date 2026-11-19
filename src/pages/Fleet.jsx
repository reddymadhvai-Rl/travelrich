import {
  ShoppingCart, FileWarning, Car, UserRound, CalendarDays, IndianRupee, Wallet, FileText, Tag, MapPin, Activity,
  Hash, Store as StoreIcon, CircleCheck, Hourglass, Building2, Phone, Fuel, Layers, Snowflake, Package, CreditCard,
  Mail, Landmark, Paperclip,
} from "lucide-react";
import DataPage from "../components/DataPage.jsx";
import { useVehicles } from "../vehicleStore.js";
import { drivers } from "../data.js";
import { useCategories, useFuelTypes, branchStore, fuelTypeStore, categoryStore } from "../masterStore.js";
import { purchaseStore, challanStore, companyStore, CHALLAN_TYPES, CHALLAN_PAY_STATUS, VEHICLE_BRANDS, PURCHASE_PAY_MODES, PURCHASE_PAY_STATUS, COMPANY_TYPES } from "../fleetStore.js";

const driverNames = drivers.map((d) => d.name);
const STATUS = ["Active", "Inactive"];
const statusField = { key: "status", label: "Status", type: "select", options: STATUS, default: "Active", half: true };
const statusCol = { key: "status", label: "Status", icon: Activity, badge: true };

/* ======================= Vehicle Purchases (popup – important fields only) ======================= */
export const PurchasesPage = () => {
  const categories = useCategories();
  const fuelTypes = useFuelTypes();
  return (
    <DataPage
      title="Vehicle Purchases" singular="Vehicle Purchase" idPrefix="PU" store={purchaseStore} noDuplicate
      subtitle="Vehicles purchased – seller, invoice, amount and payment"
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
        { key: "sellerName", label: "Seller / Dealer", icon: StoreIcon },
        { key: "invoiceNo", label: "Invoice No", icon: Hash },
        { key: "total", label: "Purchase Amount", icon: IndianRupee, money: true },
        { key: "payStatus", label: "Payment", icon: CreditCard, badge: true },
      ]}
      fields={[
        { key: "vehicleNo", label: "Vehicle Number", required: true, placeholder: "TS09AB1234", half: true },
        { key: "category", label: "Vehicle Category", type: "select", options: categories, required: true, half: true },
        { key: "brand", label: "Vehicle Brand", type: "select", options: VEHICLE_BRANDS, required: true, half: true },
        { key: "model", label: "Vehicle Model", required: true, placeholder: "Innova Crysta", half: true },
        { key: "fuel", label: "Fuel Type", type: "select", options: fuelTypes, half: true },
        { key: "purchaseDate", label: "Purchase Date", type: "date", required: true, maxToday: true, half: true },
        { key: "sellerName", label: "Seller / Dealer Name", required: true, half: true },
        { key: "invoiceNo", label: "Invoice Number", half: true },
        { key: "total", label: "Purchase Amount (₹)", type: "number", required: true, half: true },
        { key: "payMode", label: "Payment Mode", type: "select", options: PURCHASE_PAY_MODES, half: true },
        { key: "payStatus", label: "Payment Status", type: "select", options: PURCHASE_PAY_STATUS, required: true, default: "Pending", half: true },
        { key: "docInvoice", label: "Vehicle Invoice", type: "file", half: true },
      ]}
    />
  );
};

/* ======================= Vehicle Challans (popup – important fields only) ======================= */
export const ChallansPage = () => {
  const vehicles = useVehicles();
  return (
    <DataPage
      title="Challans" singular="Challan" idPrefix="CH" store={challanStore} noDuplicate
      subtitle="Traffic challans raised against your vehicles and drivers"
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
        { key: "fine", label: "Fine Amount", icon: IndianRupee, money: true },
        { key: "payStatus", label: "Payment", icon: CreditCard, badge: true },
      ]}
      transform={(d) => ({ total: d.fine })}
      fields={[
        { key: "challanNo", label: "Challan Number", placeholder: "TS-CH-000000", half: true },
        { key: "date", label: "Challan Date", type: "date", required: true, maxToday: true, half: true },
        { key: "vehicle", label: "Vehicle Number", type: "select", options: vehicles.map((v) => v.regNo), required: true, half: true },
        { key: "driver", label: "Driver Name", type: "select", options: driverNames, half: true },
        { key: "challanType", label: "Challan Type", type: "select", options: CHALLAN_TYPES, required: true, half: true },
        { key: "location", label: "Challan Location", placeholder: "Where the challan was issued", half: true },
        { key: "fine", label: "Fine Amount (₹)", type: "number", required: true, half: true },
        { key: "payStatus", label: "Payment Status", type: "select", options: CHALLAN_PAY_STATUS, required: true, default: "Pending", half: true },
        { key: "document", label: "Challan Document", type: "file" },
      ]}
    />
  );
};

/* ======================= Companies (company details) ======================= */
export const CompaniesPage = () => (
  <DataPage
    title="Companies" singular="Company" idPrefix="CO" store={companyStore}
    subtitle="Company details – contact person, GST / PAN and address"
    tabs={[
      { label: "All Companies", icon: Building2 },
      { label: "Active", icon: CircleCheck, test: (r) => r.status === "Active" },
      { label: "Inactive", icon: Hourglass, test: (r) => r.status === "Inactive" },
    ]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "name", label: "Company Name", icon: Building2, primary: true },
      { key: "type", label: "Company Type", icon: Layers },
      { key: "contact", label: "Contact Person", icon: UserRound },
      { key: "phone", label: "Contact Number", icon: Phone },
      { key: "email", label: "Email", icon: Mail },
      { key: "gst", label: "GST Number", icon: Landmark },
      { key: "gstAttachment", label: "GST Attachment", icon: Paperclip, files: true },
      { key: "panAttachment", label: "PAN Attachment", icon: Paperclip, files: true },
      { key: "city", label: "City", icon: MapPin },
      { key: "state", label: "State", icon: MapPin },
      statusCol,
    ]}
    fields={[
      { key: "name", label: "Company Name", required: true, half: true },
      { key: "type", label: "Company Type", type: "select", options: COMPANY_TYPES, half: true },
      { key: "contact", label: "Contact Person", required: true, half: true },
      { key: "phone", label: "Contact Number", type: "tel", required: true, placeholder: "Enter 10 digit contact number", half: true },
      { key: "email", label: "Email", type: "email", half: true },
      { key: "gst", label: "GST Number", placeholder: "36AABCT1234F1Z5", half: true },
      { key: "gstAttachment", label: "GST Attachment", type: "file", half: true },
      { key: "pan", label: "PAN Number", placeholder: "AABCT1234F", half: true },
      { key: "panAttachment", label: "PAN Attachment", type: "file", half: true },
      { key: "pincode", label: "Pincode", half: true },
      { key: "address", label: "Address", type: "textarea", required: true },
      { key: "city", label: "City", half: true },
      { key: "state", label: "State", half: true },
      statusField,
    ]}
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
      { key: "contactName", label: "Contact Name", icon: UserRound },
      { key: "contactMobile", label: "Contact Mobile", icon: Phone },
      { key: "email", label: "Email", icon: Mail },
      statusCol,
    ]}
    fields={[
      { key: "name", label: "Branch Name", required: true, half: true },
      { key: "code", label: "Branch Code", placeholder: "HYD", half: true },
      { key: "city", label: "City", half: true },
      { key: "email", label: "Email", type: "email", placeholder: "branch@company.com", half: true },
      { key: "contactName", label: "Contact Name", required: true, placeholder: "Enter contact person name", half: true },
      { key: "contactMobile", label: "Contact Mobile", type: "tel", required: true, placeholder: "Enter 10 digit mobile number", half: true },
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
