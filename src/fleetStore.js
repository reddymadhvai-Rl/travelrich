import { createStore } from "./masterStore.js";
import { staff } from "./data.js";

/* ---------- helpers (dates are stored as ISO yyyy-mm-dd) ---------- */
export const isoDay = (n = 0) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
export const nextNumericId = (rows) => Math.max(0, ...rows.map((r) => Number(r.id) || 0)) + 1;
export const num = (v) => Number(v || 0);

/* =====================================================================
   Vehicle Challans
   ===================================================================== */
export const CHALLAN_TYPES = ["Over Speeding", "Signal Jumping", "No Parking", "Wrong Parking", "No Seat Belt", "Overloading", "Permit Violation", "Documents Not Carried", "Toll Violation", "Other"];
export const ISSUING_AUTHORITIES = ["Traffic Police", "RTO", "Municipal Corporation", "Highway Patrol", "Toll Authority", "Other"];
export const STATE_CITIES = [
  "Telangana / Hyderabad", "Telangana / Secunderabad", "Telangana / Warangal",
  "Andhra Pradesh / Vijayawada", "Andhra Pradesh / Visakhapatnam", "Andhra Pradesh / Tirupati",
  "Karnataka / Bengaluru", "Tamil Nadu / Chennai", "Maharashtra / Mumbai", "Maharashtra / Pune",
];
export const CHALLAN_SOURCES = ["Traffic Police", "E-Challan", "RTO"];
export const CHALLAN_PAY_STATUS = ["Pending", "Paid", "Partially Paid"];
export const PAY_MODES = ["Cash", "UPI", "Online", "Card"];
export const CHALLAN_STATUS = ["Open", "Under Review", "Closed", "Disputed"];

const ch = (id, o) => ({
  id, challanNo: "", vehicle: "", category: "", vehicleType: "", branch: "Hyderabad", driver: "", driverMobile: "",
  date: isoDay(0), time: "", challanType: "", violation: "", location: "", authority: "", stateCity: "", source: "",
  fine: 0, additional: 0, total: 0, payStatus: "Pending", payDate: "", payMode: "", txnId: "",
  document: [], image: [], remarks: "", challanStatus: "Open", ...o,
});
export const challanStore = createStore([
  ch(1, { challanNo: "TS-CH-884512", vehicle: "TS 09 UA 1234", category: "SUV", vehicleType: "AC", driver: "Ramesh Kumar", driverMobile: "98480 11122", date: isoDay(-6), time: "14:20", challanType: "Over Speeding", violation: "Speed 82 km/h in a 60 km/h zone", location: "ORR, Shamshabad", authority: "Traffic Police", stateCity: "Telangana / Hyderabad", source: "E-Challan", fine: 1000, additional: 0, total: 1000, payStatus: "Pending", challanStatus: "Open" }),
  ch(2, { challanNo: "TS-CH-883120", vehicle: "TS 08 UB 4521", category: "Tempo Traveller", vehicleType: "AC", driver: "Suresh Reddy", driverMobile: "99890 22334", date: isoDay(-14), time: "11:05", challanType: "No Parking", violation: "Parked in a no-parking zone", location: "Banjara Hills Rd No. 12", authority: "Traffic Police", stateCity: "Telangana / Hyderabad", source: "Traffic Police", fine: 500, additional: 50, total: 550, payStatus: "Paid", payDate: isoDay(-12), payMode: "Online", txnId: "TXN778120", remarks: "Paid online", challanStatus: "Closed" }),
  ch(3, { challanNo: "AP-CH-220941", vehicle: "AP 28 TC 7788", category: "Bus", vehicleType: "AC", driver: "Mahesh Goud", driverMobile: "90000 33445", date: isoDay(-20), time: "18:40", challanType: "Overloading", violation: "Passengers above permitted capacity", location: "Vijayawada Highway", authority: "RTO", stateCity: "Andhra Pradesh / Vijayawada", source: "RTO", fine: 2000, additional: 200, total: 2200, payStatus: "Pending", remarks: "Contest with RTO", challanStatus: "Disputed" }),
  ch(4, { challanNo: "TS-CH-879004", vehicle: "TS 07 UD 9012", category: "SUV", vehicleType: "AC", driver: "Venkat Rao", driverMobile: "97010 55667", date: isoDay(-35), time: "09:15", challanType: "Signal Jumping", violation: "Crossed the signal on red", location: "Tank Bund", authority: "Traffic Police", stateCity: "Telangana / Hyderabad", source: "E-Challan", fine: 1000, additional: 0, total: 1000, payStatus: "Paid", payDate: isoDay(-30), payMode: "UPI", txnId: "UPI5521908", challanStatus: "Closed" }),
]);

/* =====================================================================
   Vehicle Purchases
   ===================================================================== */
export const VEHICLE_BRANDS = ["Toyota", "Maruti Suzuki", "Force", "Tata", "Volvo", "Mahindra", "Hyundai", "Honda", "Kia", "Ashok Leyland", "Eicher", "Other"];
export const PURCHASE_TYPES = ["New", "Used"];
export const PURCHASED_FROM = ["Dealer", "Individual", "Company"];
export const PURCHASE_PAY_MODES = ["Cash", "UPI", "Cheque", "Bank Transfer", "Card", "Finance / Loan"];
export const PURCHASE_PAY_STATUS = ["Pending", "Paid", "Partial"];
export const PURCHASE_OWNERSHIP = ["Owned", "Leased", "Financed"];
export const PURCHASE_VEHICLE_STATUS = ["Active", "Inactive", "Under Maintenance"];
export const PURCHASE_DOCS = [
  ["docInvoice", "Vehicle Invoice"], ["docRc", "RC Book"], ["docInsurance", "Insurance Copy"],
  ["docPuc", "Pollution Certificate"], ["docFitness", "Fitness Certificate"],
  ["docRoadTax", "Road Tax Receipt"], ["docAgreement", "Purchase Agreement"],
];
export const purchaseTotal = (f) =>
  num(f.cost) + num(f.gst) + num(f.insurance) + num(f.registration) + num(f.otherCharges) - num(f.discount);

const pu = (id, o) => ({
  id, vehicleNo: "", category: "", vehicleType: "", brand: "", model: "", fuel: "", year: "", chassisNo: "", engineNo: "", seats: "",
  purchaseDate: isoDay(0), purchaseType: "New", purchasedFrom: "Dealer", sellerName: "", sellerContact: "", sellerAddress: "",
  invoiceNo: "", invoiceDate: "", cost: 0, gst: 0, insurance: 0, registration: 0, otherCharges: 0, discount: 0, total: 0,
  payMode: "", payStatus: "Pending", payRef: "", branch: "", driver: "", ownership: "Owned", loanProvider: "", loanAmount: "",
  remarks: "", vehicleStatus: "Active", ...Object.fromEntries(PURCHASE_DOCS.map(([k]) => [k, []])), ...o,
});
const puRow = (id, o) => { const r = pu(id, o); r.total = purchaseTotal(r); return r; };
export const purchaseStore = createStore([
  puRow(1, { vehicleNo: "TS 09 UA 1234", category: "SUV", vehicleType: "AC", brand: "Toyota", model: "Innova Crysta", fuel: "Diesel", year: "2022", chassisNo: "MBJ11AB2002345", engineNo: "2GD1234567", seats: 7, purchaseDate: isoDay(-420), purchaseType: "New", purchasedFrom: "Dealer", sellerName: "Toyota Kun Auto, Hyderabad", sellerContact: "9848000111", sellerAddress: "Kondapur, Hyderabad 500084", invoiceNo: "INV-22-0457", invoiceDate: isoDay(-421), cost: 2150000, gst: 602000, insurance: 62000, registration: 95000, otherCharges: 8000, discount: 40000, payMode: "Bank Transfer", payStatus: "Paid", payRef: "NEFT0045218", branch: "Hyderabad", driver: "Ramesh Kumar", ownership: "Financed", loanProvider: "HDFC Bank", loanAmount: 1800000, vehicleStatus: "Active" }),
  puRow(2, { vehicleNo: "TS 12 UG 6070", category: "Tempo Traveller", vehicleType: "AC", brand: "Force", model: "Traveller 3350", fuel: "Diesel", year: "2021", chassisNo: "MB1TR3350M0012", engineNo: "FM2600123", seats: 12, purchaseDate: isoDay(-300), purchaseType: "Used", purchasedFrom: "Individual", sellerName: "K. Srinivas", sellerContact: "9900112233", sellerAddress: "Kukatpally, Hyderabad", invoiceNo: "SALE-118", invoiceDate: isoDay(-300), cost: 1450000, gst: 0, insurance: 38000, registration: 22000, otherCharges: 5000, discount: 0, payMode: "Cheque", payStatus: "Partial", payRef: "CHQ-882301", branch: "Secunderabad", driver: "Naresh B", ownership: "Owned", vehicleStatus: "Active" }),
  puRow(3, { vehicleNo: "TS 07 UD 9012", category: "SUV", vehicleType: "AC", brand: "Maruti Suzuki", model: "Ertiga", fuel: "Petrol", year: "2023", chassisNo: "MA3ERTIGA2301", engineNo: "K15C1234", seats: 6, purchaseDate: isoDay(-150), purchaseType: "New", purchasedFrom: "Dealer", sellerName: "Nexa Banjara Hills", sellerContact: "9700011122", sellerAddress: "Banjara Hills, Hyderabad", invoiceNo: "INV-23-1102", invoiceDate: isoDay(-150), cost: 980000, gst: 274000, insurance: 31000, registration: 55000, otherCharges: 3000, discount: 15000, payMode: "UPI", payStatus: "Pending", payRef: "", branch: "Hyderabad", driver: "Venkat Rao", ownership: "Leased", vehicleStatus: "Under Maintenance" }),
]);

/* =====================================================================
   Company Vehicle Assignments
   ===================================================================== */
export const ASSIGNED_TO = ["Employee", "Department", "Branch", "Client"];
export const DEPARTMENTS = ["Operations", "Management", "Bookings", "Accounts", "HR", "Sales"];
export const ASSIGN_PURPOSES = ["Official Duty", "Client Service", "Airport Transfer", "Staff Pickup / Drop", "Outstation Trip", "Event / Function", "Other"];
export const FUEL_LEVELS = ["0% (Empty)", "10%", "25%", "50%", "75%", "90%", "100% (Full)"];
export const VEHICLE_CONDITIONS = ["Good", "Average", "Damaged"];

const DEPT_BY_ROLE = { Driver: "Operations", Manager: "Management", Dispatcher: "Operations", "Booking Executive": "Bookings" };
/* employee master derived from the staff list (id, department, designation, phone) */
export const employees = staff.map((s) => ({
  name: s.name, id: `EMP-${s.id}`, department: DEPT_BY_ROLE[s.role] || "Operations", designation: s.role, phone: s.phone,
}));

export const assigneeOf = (r) => (r.assignedTo === "Employee" ? r.employee : r.targetName);
export const assignmentStatus = (r) => (r.returnDate ? "Returned" : r.expectedReturn && r.expectedReturn < isoDay(0) ? "Overdue" : "Assigned");

const as = (id, o) => {
  const r = {
    id, assignmentNo: `ASG-${1000 + id}`, vehicle: "", category: "", vehicleType: "", vehicleModel: "", branch: "Hyderabad",
    assignmentDate: isoDay(0), assignedTo: "Employee", targetName: "", employee: "", employeeId: "", department: "", designation: "",
    assignedBy: "Admin", purpose: "", expectedReturn: "", handoverDate: isoDay(0), startOdo: "", fuelLevel: "", condition: "Good",
    driver: "", handoverNotes: "", returnDate: "", closeOdo: "", returnFuel: "", returnCondition: "", returnRemarks: "", ...o,
  };
  r.status = assignmentStatus(r);
  r.assignee = assigneeOf(r);
  return r;
};
export const assignmentStore = createStore([
  as(1, { vehicle: "TS 09 UA 1234", category: "SUV", vehicleType: "AC", vehicleModel: "Innova Crysta", branch: "Hyderabad", assignmentDate: isoDay(-12), assignedTo: "Employee", employee: "Madhavi", employeeId: "EMP-U1", department: "Management", designation: "Manager", assignedBy: "Admin", purpose: "Official Duty", expectedReturn: isoDay(18), handoverDate: isoDay(-12), startOdo: 48200, fuelLevel: "75%", condition: "Good", driver: "Ramesh Kumar", handoverNotes: "Spare key with the driver" }),
  as(2, { vehicle: "TS 12 UG 6070", category: "Tempo Traveller", vehicleType: "AC", vehicleModel: "Traveller 3350", branch: "Secunderabad", assignmentDate: isoDay(-30), assignedTo: "Client", targetName: "TechNova Pvt Ltd", purpose: "Staff Pickup / Drop", expectedReturn: isoDay(-5), handoverDate: isoDay(-30), startOdo: 54000, fuelLevel: "100% (Full)", condition: "Good", driver: "Naresh B" }),
  as(3, { vehicle: "TS 07 UD 9012", category: "SUV", vehicleType: "AC", vehicleModel: "Ertiga", branch: "Hyderabad", assignmentDate: isoDay(-20), assignedTo: "Employee", employee: "Lavanya P", employeeId: "EMP-U3", department: "Bookings", designation: "Booking Executive", assignedBy: "Madhavi", purpose: "Client Service", expectedReturn: isoDay(-10), handoverDate: isoDay(-20), startOdo: 22000, fuelLevel: "50%", condition: "Average", driver: "Venkat Rao", returnDate: isoDay(-11), closeOdo: 22640, returnFuel: "25%", returnCondition: "Good", returnRemarks: "Returned on time, minor scratch on the rear bumper" }),
]);
