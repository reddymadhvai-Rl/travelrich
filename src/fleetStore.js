import { createStore } from "./masterStore.js";
import { companies as seedCompanies } from "./data.js";

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
  id, challanNo: "", vehicle: "", branch: "Hyderabad", driver: "", driverMobile: "",
  date: isoDay(0), time: "", challanType: "", violation: "", location: "", authority: "", stateCity: "", source: "",
  fine: 0, additional: 0, total: 0, payStatus: "Pending", payDate: "", payMode: "", txnId: "",
  document: [], image: [], remarks: "", challanStatus: "Open", ...o,
});
export const challanStore = createStore([
  ch(1, { challanNo: "TS-CH-884512", vehicle: "TS 09 UA 1234", category: "SUV", driver: "Ramesh Kumar", driverMobile: "98480 11122", date: isoDay(-6), time: "14:20", challanType: "Over Speeding", violation: "Speed 82 km/h in a 60 km/h zone", location: "ORR, Shamshabad", authority: "Traffic Police", stateCity: "Telangana / Hyderabad", source: "E-Challan", fine: 1000, additional: 0, total: 1000, payStatus: "Pending", challanStatus: "Open" }),
  ch(2, { challanNo: "TS-CH-883120", vehicle: "TS 08 UB 4521", category: "Tempo Traveller", driver: "Suresh Reddy", driverMobile: "99890 22334", date: isoDay(-14), time: "11:05", challanType: "No Parking", violation: "Parked in a no-parking zone", location: "Banjara Hills Rd No. 12", authority: "Traffic Police", stateCity: "Telangana / Hyderabad", source: "Traffic Police", fine: 500, additional: 50, total: 550, payStatus: "Paid", payDate: isoDay(-12), payMode: "Online", txnId: "TXN778120", remarks: "Paid online", challanStatus: "Closed" }),
  ch(3, { challanNo: "AP-CH-220941", vehicle: "AP 28 TC 7788", category: "Bus", driver: "Mahesh Goud", driverMobile: "90000 33445", date: isoDay(-20), time: "18:40", challanType: "Overloading", violation: "Passengers above permitted capacity", location: "Vijayawada Highway", authority: "RTO", stateCity: "Andhra Pradesh / Vijayawada", source: "RTO", fine: 2000, additional: 200, total: 2200, payStatus: "Pending", remarks: "Contest with RTO", challanStatus: "Disputed" }),
  ch(4, { challanNo: "TS-CH-879004", vehicle: "TS 07 UD 9012", category: "SUV", driver: "Venkat Rao", driverMobile: "97010 55667", date: isoDay(-35), time: "09:15", challanType: "Signal Jumping", violation: "Crossed the signal on red", location: "Tank Bund", authority: "Traffic Police", stateCity: "Telangana / Hyderabad", source: "E-Challan", fine: 1000, additional: 0, total: 1000, payStatus: "Paid", payDate: isoDay(-30), payMode: "UPI", txnId: "UPI5521908", challanStatus: "Closed" }),
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
  id, vehicleNo: "", category: "", brand: "", model: "", fuel: "", year: "", chassisNo: "", engineNo: "", seats: "",
  purchaseDate: isoDay(0), purchaseType: "New", purchasedFrom: "Dealer", sellerName: "", sellerContact: "", sellerAddress: "",
  invoiceNo: "", invoiceDate: "", cost: 0, gst: 0, insurance: 0, registration: 0, otherCharges: 0, discount: 0, total: 0,
  payMode: "", payStatus: "Pending", payRef: "", branch: "", driver: "", ownership: "Owned", loanProvider: "", loanAmount: "",
  remarks: "", vehicleStatus: "Active", ...Object.fromEntries(PURCHASE_DOCS.map(([k]) => [k, []])), ...o,
});
const puRow = (id, o) => { const r = pu(id, o); r.total = purchaseTotal(r); return r; };
export const purchaseStore = createStore([
  puRow(1, { vehicleNo: "TS 09 UA 1234", category: "SUV", brand: "Toyota", model: "Innova Crysta", fuel: "Diesel", year: "2022", chassisNo: "MBJ11AB2002345", engineNo: "2GD1234567", seats: 7, purchaseDate: isoDay(-420), purchaseType: "New", purchasedFrom: "Dealer", sellerName: "Toyota Kun Auto, Hyderabad", sellerContact: "9848000111", sellerAddress: "Kondapur, Hyderabad 500084", invoiceNo: "INV-22-0457", invoiceDate: isoDay(-421), cost: 2150000, gst: 602000, insurance: 62000, registration: 95000, otherCharges: 8000, discount: 40000, payMode: "Bank Transfer", payStatus: "Paid", payRef: "NEFT0045218", branch: "Hyderabad", driver: "Ramesh Kumar", ownership: "Financed", loanProvider: "HDFC Bank", loanAmount: 1800000, vehicleStatus: "Active" }),
  puRow(2, { vehicleNo: "TS 12 UG 6070", category: "Tempo Traveller", brand: "Force", model: "Traveller 3350", fuel: "Diesel", year: "2021", chassisNo: "MB1TR3350M0012", engineNo: "FM2600123", seats: 12, purchaseDate: isoDay(-300), purchaseType: "Used", purchasedFrom: "Individual", sellerName: "K. Srinivas", sellerContact: "9900112233", sellerAddress: "Kukatpally, Hyderabad", invoiceNo: "SALE-118", invoiceDate: isoDay(-300), cost: 1450000, gst: 0, insurance: 38000, registration: 22000, otherCharges: 5000, discount: 0, payMode: "Cheque", payStatus: "Partial", payRef: "CHQ-882301", branch: "Secunderabad", driver: "Naresh B", ownership: "Owned", vehicleStatus: "Active" }),
  puRow(3, { vehicleNo: "TS 07 UD 9012", category: "SUV", brand: "Maruti Suzuki", model: "Ertiga", fuel: "Petrol", year: "2023", chassisNo: "MA3ERTIGA2301", engineNo: "K15C1234", seats: 6, purchaseDate: isoDay(-150), purchaseType: "New", purchasedFrom: "Dealer", sellerName: "Nexa Banjara Hills", sellerContact: "9700011122", sellerAddress: "Banjara Hills, Hyderabad", invoiceNo: "INV-23-1102", invoiceDate: isoDay(-150), cost: 980000, gst: 274000, insurance: 31000, registration: 55000, otherCharges: 3000, discount: 15000, payMode: "UPI", payStatus: "Pending", payRef: "", branch: "Hyderabad", driver: "Venkat Rao", ownership: "Leased", vehicleStatus: "Under Maintenance" }),
]);

/* =====================================================================
   Companies (client / corporate customers)
   ===================================================================== */
export const COMPANY_TYPES = ["Private Limited", "Public Limited", "Partnership", "Proprietorship", "LLP", "School / College", "Other"];
const typeOf = (n) => (/school|college/i.test(n) ? "School / College" : /pvt|private/i.test(n) ? "Private Limited" : /travels/i.test(n) ? "Proprietorship" : "Other");
export const companyStore = createStore(
  seedCompanies.map((c) => ({
    id: c.id, name: c.name, type: typeOf(c.name), contact: c.contact, phone: c.phone, email: c.email,
    gst: c.gst, gstAttachment: [], pan: c.gst ? c.gst.slice(2, 12) : "", panAttachment: [], address: c.address, city: c.city,
    state: "Telangana", pincode: (c.address.match(/\d{6}/) || [""])[0], status: c.status,
  }))
);
