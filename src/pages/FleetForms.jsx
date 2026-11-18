import { useNavigate, useParams } from "react-router-dom";
import { Car, FileWarning, IndianRupee, Paperclip, ShoppingCart, FileText, Info, ClipboardList, KeyRound, RotateCcw } from "lucide-react";
import EntryForm from "../components/EntryForm.jsx";
import { drivers } from "../data.js";
import { useVehicles } from "../vehicleStore.js";
import { useStore, useBranches, useCategories, useFuelTypes, useVehicleTypes } from "../masterStore.js";
import { companies } from "../data.js";
import {
  challanStore, purchaseStore, assignmentStore, nextNumericId, num, isoDay, assignmentStatus, assigneeOf, employees,
  CHALLAN_TYPES, ISSUING_AUTHORITIES, STATE_CITIES, CHALLAN_SOURCES, CHALLAN_PAY_STATUS, PAY_MODES, CHALLAN_STATUS,
  VEHICLE_BRANDS, PURCHASE_TYPES, PURCHASED_FROM, PURCHASE_PAY_MODES, PURCHASE_PAY_STATUS, PURCHASE_OWNERSHIP,
  PURCHASE_VEHICLE_STATUS, PURCHASE_DOCS, purchaseTotal,
  ASSIGNED_TO, DEPARTMENTS, ASSIGN_PURPOSES, FUEL_LEVELS, VEHICLE_CONDITIONS,
} from "../fleetStore.js";

const driverNames = drivers.map((d) => d.name);
const today = () => isoDay(0);
const norm = (s) => String(s || "").replace(/\s+/g, "").toLowerCase();
/* keep a saved value selectable even if its master record was deactivated later */
const withCur = (list, cur) => (cur && !list.includes(cur) ? [...list, cur] : list);

/** Shared add / edit plumbing for a list backed by a store. */
function useRecordPage({ store, listPath, singular }) {
  const { id } = useParams();
  const nav = useNavigate();
  const rows = useStore(store);
  const existing = id ? rows.find((r) => String(r.id) === id) : null;
  const save = (data) => {
    if (existing) store.set((p) => p.map((r) => (r.id === existing.id ? { ...r, ...data } : r)));
    else store.set((p) => [{ id: nextNumericId(p), ...data }, ...p]);
    nav(listPath, { state: { toast: `${singular} ${existing ? "updated" : "added"} successfully` } });
  };
  return { id, nav, rows, existing, save, nextId: nextNumericId(rows) };
}
const NotFound = ({ what, listPath, nav }) => (
  <div className="zpage"><div className="zcard vf-empty">{what} not found. <button className="zbtn" onClick={() => nav(listPath)}>Back to list</button></div></div>
);
const blankOf = (sections) => Object.fromEntries(sections.flatMap((s) => s.fields).map((f) => [f.key, f.type === "file" || f.type === "image" ? [] : f.default ?? ""]));
const dupe = (rows, existing, key, value) => rows.some((r) => r.id !== existing?.id && norm(r[key]) === norm(value));

/* =====================================================================
   1. VEHICLE CHALLAN
   ===================================================================== */
export const challanSections = ({ vehicles, branches }) => [
  {
    icon: Car, title: "Vehicle Details", fields: [
      { key: "challanNo", label: "Challan Number", required: true, placeholder: "TS-CH-000000" },
      {
        key: "vehicle", label: "Vehicle Number", type: "search", required: true, options: vehicles.map((v) => v.regNo),
        onChange: (val, f) => {
          const v = vehicles.find((x) => x.regNo === val);
          const prev = vehicles.find((x) => x.regNo === f.vehicle);
          return { category: v?.type || "", vehicleType: v?.ac || "", branch: !f.branch || f.branch === prev?.branch ? v?.branch || "" : f.branch };
        },
      },
      { key: "category", label: "Vehicle Category", readOnly: true, hint: "Auto-filled from vehicle" },
      { key: "vehicleType", label: "Vehicle Type", readOnly: true, hint: "Auto-filled from vehicle" },
      { key: "branch", label: "Branch", type: "select", options: branches, required: true },
      {
        key: "driver", label: "Driver Name", type: "search", options: driverNames,
        onChange: (val) => ({ driverMobile: drivers.find((d) => d.name === val)?.phone || "" }),
      },
      { key: "driverMobile", label: "Driver Mobile Number", readOnly: true, hint: "Auto-filled from driver" },
    ],
  },
  {
    icon: FileWarning, title: "Challan Details", fields: [
      { key: "date", label: "Challan Date", type: "date", required: true, maxDate: today },
      { key: "time", label: "Challan Time", type: "time" },
      { key: "challanType", label: "Challan Type", type: "select", options: CHALLAN_TYPES, required: true },
      { key: "authority", label: "Issuing Authority", type: "select", options: ISSUING_AUTHORITIES },
      { key: "stateCity", label: "State / City", type: "select", options: STATE_CITIES },
      { key: "source", label: "Challan Source", type: "select", options: CHALLAN_SOURCES },
      { key: "location", label: "Challan Location", placeholder: "Where the challan was issued" },
      { key: "violation", label: "Violation Description", type: "textarea", span: 4, placeholder: "Describe the violation" },
    ],
  },
  {
    icon: IndianRupee, title: "Fine & Payment Details", fields: [
      { key: "fine", label: "Fine Amount (₹)", type: "number", required: true },
      { key: "additional", label: "Additional Charges (₹)", type: "number" },
      { key: "total", label: "Total Amount (₹)", type: "number", compute: (f) => num(f.fine) + num(f.additional), hint: "Fine + additional charges" },
      {
        key: "payStatus", label: "Payment Status", type: "select", options: CHALLAN_PAY_STATUS, required: true, default: "Pending",
        onChange: (val) => (val === "Pending" || !val ? { payDate: "", payMode: "", txnId: "" } : {}),
      },
      { key: "payDate", label: "Payment Date", type: "date", maxDate: today, disabled: (f) => !f.payStatus || f.payStatus === "Pending" },
      { key: "payMode", label: "Payment Mode", type: "select", options: PAY_MODES, disabled: (f) => !f.payStatus || f.payStatus === "Pending" },
      { key: "txnId", label: "Transaction ID", disabled: (f) => !f.payStatus || f.payStatus === "Pending", placeholder: "UPI / bank reference" },
    ],
  },
  {
    icon: Paperclip, title: "Documents & Remarks", fields: [
      { key: "document", label: "Challan Document (PDF / Image)", type: "file", accept: ".pdf,.jpg,.jpeg,.png" },
      { key: "image", label: "Challan Image", type: "image" },
      { key: "challanStatus", label: "Challan Status", type: "select", options: CHALLAN_STATUS, required: true, default: "Open" },
      { key: "remarks", label: "Remarks", type: "textarea", span: 4 },
    ],
  },
];

export function ChallanForm() {
  const rec = useRecordPage({ store: challanStore, listPath: "/challans", singular: "Challan" });
  const vehicles = useVehicles();
  const branches = useBranches();
  if (rec.id && !rec.existing) return <NotFound what="Challan" listPath="/challans" nav={rec.nav} />;
  const sections = challanSections({ vehicles, branches: withCur(branches, rec.existing?.branch) });
  const e = rec.existing;
  return (
    <EntryForm
      key={e?.id ?? "new"}
      title={e ? "Edit Vehicle Challan" : "Add Vehicle Challan"} idLine={<>Challan ID: <b>CH-{e?.id ?? rec.nextId}</b> (auto-generated)</>}
      listPath="/challans" manageLabel="Manage Challans" saveLabel={e ? "Update Challan" : "Save Challan"}
      sections={sections} initial={{ ...blankOf(sections), ...(e || {}) }}
      validate={(f) => {
        const err = {};
        if (f.challanNo && dupe(rec.rows, e, "challanNo", f.challanNo)) err.challanNo = "This challan number already exists";
        if (f.payStatus && f.payStatus !== "Pending") {
          if (!f.payDate) err.payDate = "Payment date is required";
          if (!f.payMode) err.payMode = "Payment mode is required";
        }
        if (f.payDate && f.date && f.payDate < f.date) err.payDate = "Payment date is before the challan date";
        return err;
      }}
      onSubmit={(d) => rec.save({ ...d, challanNo: d.challanNo.toUpperCase() })}
    />
  );
}

/* =====================================================================
   2. VEHICLE PURCHASE
   ===================================================================== */
export const purchaseSections = ({ categories, vehicleTypes, fuelTypes, branches }) => {
  const financed = (f) => f.ownership !== "Financed";
  return [
    {
      icon: Car, title: "Vehicle Details", fields: [
        { key: "vehicleNo", label: "Vehicle Number", required: true, placeholder: "TS09AB1234" },
        { key: "category", label: "Vehicle Category", type: "select", options: categories, required: true },
        { key: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleTypes },
        { key: "brand", label: "Vehicle Brand", type: "select", options: VEHICLE_BRANDS, required: true },
        { key: "model", label: "Vehicle Model", required: true, placeholder: "Innova Crysta" },
        { key: "fuel", label: "Fuel Type", type: "select", options: fuelTypes, required: true },
        { key: "year", label: "Manufacturing Year", type: "year" },
        { key: "chassisNo", label: "Chassis Number" },
        { key: "engineNo", label: "Engine Number" },
        { key: "seats", label: "Seating Capacity", type: "number", placeholder: "7 (excluding driver)" },
      ],
    },
    {
      icon: ShoppingCart, title: "Purchase Details", fields: [
        { key: "purchaseDate", label: "Purchase Date", type: "date", required: true, maxDate: today },
        { key: "purchaseType", label: "Purchase Type", type: "select", options: PURCHASE_TYPES, required: true, default: "New" },
        { key: "purchasedFrom", label: "Purchased From", type: "select", options: PURCHASED_FROM, required: true },
        { key: "sellerName", label: "Seller / Dealer Name", required: true },
        { key: "sellerContact", label: "Seller Contact Number", type: "tel", placeholder: "10 digit mobile number" },
        { key: "invoiceNo", label: "Invoice Number" },
        { key: "invoiceDate", label: "Invoice Date", type: "date", maxDate: today },
        { key: "sellerAddress", label: "Seller Address", type: "textarea", span: 4 },
      ],
    },
    {
      icon: IndianRupee, title: "Financial Details", fields: [
        { key: "cost", label: "Vehicle Cost (₹)", type: "number", required: true },
        { key: "gst", label: "GST Amount (₹)", type: "number" },
        { key: "insurance", label: "Insurance Amount (₹)", type: "number" },
        { key: "registration", label: "Registration Charges (₹)", type: "number" },
        { key: "otherCharges", label: "Other Charges (₹)", type: "number" },
        { key: "discount", label: "Discount (₹)", type: "number" },
        { key: "total", label: "Total Purchase Amount (₹)", type: "number", compute: purchaseTotal, hint: "Cost + GST + insurance + registration + other − discount" },
        { key: "payMode", label: "Payment Mode", type: "select", options: PURCHASE_PAY_MODES },
        { key: "payStatus", label: "Payment Status", type: "select", options: PURCHASE_PAY_STATUS, required: true, default: "Pending" },
        { key: "payRef", label: "Payment Reference Number" },
      ],
    },
    {
      icon: FileText, title: "Documents", fields: PURCHASE_DOCS.map(([key, label]) => ({ key, label, type: "file", accept: ".pdf,.jpg,.jpeg,.png" })),
    },
    {
      icon: Info, title: "Additional Information", fields: [
        { key: "branch", label: "Assigned Branch", type: "select", options: branches },
        { key: "driver", label: "Assigned Driver", type: "search", options: driverNames },
        {
          key: "ownership", label: "Vehicle Ownership", type: "select", options: PURCHASE_OWNERSHIP, required: true, default: "Owned",
          onChange: (v) => (v !== "Financed" ? { loanProvider: "", loanAmount: "" } : {}),
        },
        { key: "loanProvider", label: "Loan Provider / Finance Company", disabled: financed, hint: (f) => (financed(f) ? "Enabled when ownership is Financed" : "") },
        { key: "loanAmount", label: "Loan Amount (₹)", type: "number", disabled: financed },
        { key: "vehicleStatus", label: "Vehicle Status", type: "select", options: PURCHASE_VEHICLE_STATUS, required: true, default: "Active" },
        { key: "remarks", label: "Remarks", type: "textarea", span: 4 },
      ],
    },
  ];
};

export function PurchaseForm() {
  const rec = useRecordPage({ store: purchaseStore, listPath: "/purchases", singular: "Vehicle purchase" });
  const e = rec.existing;
  const sections = purchaseSections({
    categories: withCur(useCategories(), e?.category), vehicleTypes: withCur(useVehicleTypes(), e?.vehicleType),
    fuelTypes: withCur(useFuelTypes(), e?.fuel), branches: withCur(useBranches(), e?.branch),
  });
  if (rec.id && !e) return <NotFound what="Purchase" listPath="/purchases" nav={rec.nav} />;
  return (
    <EntryForm
      key={e?.id ?? "new"}
      title={e ? "Edit Vehicle Purchase" : "Add Vehicle Purchase"} idLine={<>Purchase ID: <b>PU-{e?.id ?? rec.nextId}</b> (auto-generated)</>}
      listPath="/purchases" manageLabel="Manage Purchases" saveLabel={e ? "Update Purchase" : "Save Purchase"}
      sections={sections} initial={{ ...blankOf(sections), ...(e || {}), year: e?.year ? String(e.year) : "" }}
      validate={(f) => {
        const err = {};
        if (f.vehicleNo && dupe(rec.rows, e, "vehicleNo", f.vehicleNo)) err.vehicleNo = "A purchase for this vehicle number already exists";
        if (f.invoiceDate && f.purchaseDate && f.invoiceDate > f.purchaseDate) err.invoiceDate = "Invoice date is after the purchase date";
        if (f.ownership === "Financed") {
          if (!String(f.loanProvider || "").trim()) err.loanProvider = "Loan provider is required for a financed vehicle";
          if (f.loanAmount === "" || f.loanAmount == null) err.loanAmount = "Loan amount is required for a financed vehicle";
        }
        if (f.loanAmount !== "" && f.loanAmount != null && f.total && Number(f.loanAmount) > Number(f.total)) err.loanAmount = "Loan amount cannot exceed the total purchase amount";
        if (Number(f.total) < 0) err.discount = "Discount cannot exceed the total of all charges";
        return err;
      }}
      onSubmit={(d) => rec.save({ ...d, vehicleNo: d.vehicleNo.toUpperCase() })}
    />
  );
}

/* =====================================================================
   3. COMPANY VEHICLE ASSIGNMENT
   ===================================================================== */
const staffNames = employees.map((x) => x.name);
export const assignmentSections = ({ vehicles, branches }) => {
  const notEmployee = (f) => !!f.assignedTo && f.assignedTo !== "Employee";
  return [
    {
      icon: Car, title: "Vehicle Details", fields: [
        {
          key: "vehicle", label: "Vehicle Number", type: "search", required: true, options: vehicles.map((v) => v.regNo),
          onChange: (val, f) => {
            const v = vehicles.find((x) => x.regNo === val);
            const prev = vehicles.find((x) => x.regNo === f.vehicle);
            return {
              category: v?.type || "", vehicleType: v?.ac || "", vehicleModel: v ? [v.make, v.model].filter(Boolean).join(" ") : "",
              /* only replace values that were themselves auto-filled from the previous vehicle */
              branch: !f.branch || f.branch === prev?.branch ? v?.branch || "" : f.branch,
              startOdo: f.startOdo === "" || Number(f.startOdo) === prev?.km ? v?.km ?? "" : f.startOdo,
            };
          },
        },
        { key: "category", label: "Vehicle Category", readOnly: true, hint: "Auto-filled from vehicle" },
        { key: "vehicleType", label: "Vehicle Type", readOnly: true, hint: "Auto-filled from vehicle" },
        { key: "vehicleModel", label: "Vehicle Model", readOnly: true, hint: "Auto-filled from vehicle" },
        { key: "branch", label: "Branch", type: "select", options: branches, required: true },
      ],
    },
    {
      icon: ClipboardList, title: "Assignment Details", fields: [
        { key: "assignmentNo", label: "Assignment Number", readOnly: true, hint: "Auto-generated" },
        { key: "assignmentDate", label: "Assignment Date", type: "date", required: true },
        {
          key: "assignedTo", label: "Assigned To", type: "select", options: ASSIGNED_TO, required: true,
          onChange: () => ({ employee: "", employeeId: "", department: "", designation: "", targetName: "" }),
        },
        {
          key: "targetName", visible: notEmployee, required: true, type: "select",
          label: (f) => `${f.assignedTo} Name`,
          options: (f) => (f.assignedTo === "Branch" ? ASSIGN_BRANCHES : f.assignedTo === "Client" ? companies.map((c) => c.name) : DEPARTMENTS),
        },
        {
          key: "employee", label: "Employee Name", type: "search", options: staffNames, disabled: notEmployee,
          required: false,
          onChange: (val) => {
            const x = employees.find((m) => m.name === val);
            return { employeeId: x?.id || "", department: x?.department || "", designation: x?.designation || "" };
          },
        },
        { key: "employeeId", label: "Employee ID", readOnly: true, hint: "Auto-filled from employee" },
        { key: "department", label: "Department", readOnly: true, hint: "Auto-filled from employee" },
        { key: "designation", label: "Designation", readOnly: true, hint: "Auto-filled from employee" },
        { key: "assignedBy", label: "Assigned By", type: "select", options: ["Admin", ...staffNames], required: true, default: "Admin" },
        { key: "purpose", label: "Purpose of Assignment", type: "select", options: ASSIGN_PURPOSES, required: true },
        { key: "expectedReturn", label: "Expected Return Date", type: "date", minDate: (f) => f.assignmentDate },
      ],
    },
    {
      icon: KeyRound, title: "Vehicle Handover Details", fields: [
        { key: "handoverDate", label: "Handover Date", type: "date", required: true, minDate: (f) => f.assignmentDate },
        { key: "startOdo", label: "Starting Odometer Reading (km)", type: "number", required: true },
        { key: "fuelLevel", label: "Fuel Level", type: "select", options: FUEL_LEVELS, required: true },
        { key: "condition", label: "Vehicle Condition", type: "select", options: VEHICLE_CONDITIONS, required: true, default: "Good" },
        { key: "driver", label: "Assigned Driver", type: "search", options: driverNames },
        { key: "handoverNotes", label: "Handover Notes", type: "textarea", span: 4 },
      ],
    },
    {
      icon: RotateCcw, title: "Return Details", fields: [
        { key: "returnDate", label: "Return Date", type: "date", minDate: (f) => f.handoverDate, hint: "Fill in when the vehicle is returned" },
        { key: "closeOdo", label: "Closing Odometer Reading (km)", type: "number" },
        { key: "returnFuel", label: "Return Fuel Level", type: "select", options: FUEL_LEVELS },
        { key: "returnCondition", label: "Return Vehicle Condition", type: "select", options: VEHICLE_CONDITIONS },
        { key: "returnRemarks", label: "Return Remarks", type: "textarea", span: 4 },
      ],
    },
  ];
};
const ASSIGN_BRANCHES = ["Hyderabad", "Secunderabad", "Vijayawada", "Visakhapatnam"];

export function AssignmentForm() {
  const rec = useRecordPage({ store: assignmentStore, listPath: "/company-assignments", singular: "Assignment" });
  const vehicles = useVehicles();
  const e = rec.existing;
  const branches = withCur(useBranches(), e?.branch);
  if (rec.id && !e) return <NotFound what="Assignment" listPath="/company-assignments" nav={rec.nav} />;
  const sections = assignmentSections({ vehicles, branches });
  const number = e?.assignmentNo || `ASG-${1000 + rec.nextId}`;
  return (
    <EntryForm
      key={e?.id ?? "new"}
      title={e ? "Edit Vehicle Assignment" : "Company Vehicle Assignment"} idLine={<>Assignment No: <b>{number}</b> (auto-generated)</>}
      listPath="/company-assignments" manageLabel="Manage Assignments" saveLabel={e ? "Update Assignment" : "Save Assignment"}
      sections={sections} initial={{ ...blankOf(sections), assignmentDate: today(), handoverDate: today(), ...(e || {}), assignmentNo: number }}
      validate={(f) => {
        const err = {};
        if (f.assignedTo === "Employee" && !f.employee) err.employee = "Employee name is required";
        if (f.expectedReturn && f.assignmentDate && f.expectedReturn < f.assignmentDate) err.expectedReturn = "Expected return is before the assignment date";
        if (f.handoverDate && f.assignmentDate && f.handoverDate < f.assignmentDate) err.handoverDate = "Handover date is before the assignment date";
        if (f.returnDate) {
          if (f.handoverDate && f.returnDate < f.handoverDate) err.returnDate = "Return date is before the handover date";
          if (f.closeOdo === "" || f.closeOdo == null) err.closeOdo = "Closing odometer is required when the vehicle is returned";
          if (!f.returnCondition) err.returnCondition = "Return condition is required when the vehicle is returned";
        }
        if (f.closeOdo !== "" && f.closeOdo != null && f.startOdo !== "" && Number(f.closeOdo) < Number(f.startOdo)) err.closeOdo = "Closing reading is lower than the starting reading";
        if (f.vehicle && !f.returnDate) {
          const open = rec.rows.find((r) => r.id !== e?.id && r.vehicle === f.vehicle && !r.returnDate);
          if (open) err.vehicle = `Already assigned (${open.assignmentNo}) and not yet returned`;
        }
        return err;
      }}
      onSubmit={(d) => rec.save({ ...d, status: assignmentStatus(d), assignee: assigneeOf(d) })}
    />
  );
}
