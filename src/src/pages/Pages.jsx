import {
  Car, UserRound, CalendarCheck, Receipt, CreditCard, MapPin, Users, Armchair, Activity, Route, CalendarDays,
  IndianRupee, Phone, IdCard, Paperclip, Lock, Fingerprint, Mail, ShieldCheck, FileText, Wallet, Gauge, Clock, Tag, Navigation, UserCheck, UserX, CircleCheck, Hourglass, Wifi, WifiOff,
} from "lucide-react";
import DataPage from "../components/DataPage.jsx";
import { vehicles, drivers, bookings, expenses, expenseHeads, payments, users } from "../data.js";

const VEHICLE_TYPES = ["Swift Dzire", "Ertiga", "Innova", "Innova Crysta", "Tempo Traveller", "Mini Bus", "Volvo Bus"];
const driverNames = drivers.map((d) => d.name);
const vehicleNos = vehicles.map((v) => v.number);

export const VehiclesPage = () => (
  <DataPage
    title="Vehicles" singular="Vehicle" idPrefix="VH" initial={vehicles}
    subtitle="Click a vehicle to edit its details"
    tabs={[
      { label: "All Vehicles", icon: Car },
      { label: "Online", icon: Wifi, test: (r) => r.status === "Online" },
      { label: "Offline", icon: WifiOff, test: (r) => r.status === "Offline" },
    ]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "number", label: "Vehicle No", icon: Car, primary: true },
      { key: "type", label: "Type", icon: Tag },
      { key: "seats", label: "Seats", icon: Armchair },
      { key: "driver", label: "Driver", icon: UserRound },
      { key: "status", label: "Status", icon: Activity, badge: true },
      { key: "trip", label: "Trip", icon: Route, badge: true },
      { key: "notes", label: "Description", icon: FileText, rich: true },
    ]}
    fields={[
      { key: "number", label: "Vehicle Number", required: true, placeholder: "TS 09 UA 1234" },
      { key: "type", label: "Vehicle Type", type: "select", options: VEHICLE_TYPES, required: true, half: true },
      { key: "seats", label: "Seats", type: "number", required: true, half: true },
      { key: "driver", label: "Driver", type: "select", options: driverNames, half: true },
      { key: "status", label: "Status", type: "select", options: ["Online", "Offline"], default: "Offline", half: true },
      { key: "trip", label: "Trip", type: "select", options: ["No Booking", "Booked", "On Trip"], default: "No Booking" },
      { key: "notes", label: "Description", type: "rich" },
    ]}
  />
);

export const DriversPage = () => (
  <DataPage
    title="Drivers" singular="Driver" idPrefix="DR" initial={drivers}
    subtitle="Click a driver to edit their details and ID proofs"
    tabs={[
      { label: "All Drivers", icon: UserRound },
      { label: "On Duty", icon: UserCheck, test: (r) => r.status === "On Duty" },
      { label: "Off Duty", icon: UserX, test: (r) => r.status === "Off Duty" },
    ]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "name", label: "Full Name", icon: UserRound, primary: true },
      { key: "phone", label: "Phone", icon: Phone },
      { key: "aadhaar", label: "Aadhaar No", icon: Fingerprint },
      { key: "license", label: "Licence No", icon: IdCard },
      { key: "expiry", label: "Licence Expiry", icon: CalendarDays },
      { key: "aadhaarFile", label: "Aadhaar Copy", icon: Paperclip, files: true },
      { key: "licenseFile", label: "Licence Copy", icon: Paperclip, files: true },
      { key: "status", label: "Status", icon: Activity, badge: true },
    ]}
    fields={[
      { key: "name", label: "Driver Full Name", required: true, placeholder: "As on Aadhaar / licence" },
      { key: "phone", label: "Phone Number", type: "tel", required: true, half: true },
      { key: "status", label: "Status", type: "select", options: ["On Duty", "Off Duty"], default: "On Duty", half: true },
      { key: "aadhaar", label: "Aadhaar Number", required: true, placeholder: "1234 5678 9012", half: true },
      { key: "license", label: "Licence Number", required: true, half: true },
      { key: "expiry", label: "Licence Expiry", type: "date", required: true },
      { key: "aadhaarFile", label: "Aadhaar Attachment", type: "file" },
      { key: "licenseFile", label: "Licence Attachment", type: "file" },
      { key: "otherFiles", label: "Other Attachments (RC, police verification, photo…)", type: "file" },
      { key: "notes", label: "Description", type: "rich" },
    ]}
  />
);

export const BookingsPage = () => (
  <DataPage
    title="Bookings" singular="Booking" idPrefix="BK" initial={bookings}
    subtitle="Click a booking to edit it"
    tabs={[
      { label: "All Bookings", icon: CalendarCheck },
      { label: "Ongoing", icon: Hourglass, test: (r) => r.status === "Ongoing" },
      { label: "Completed", icon: CircleCheck, test: (r) => r.status === "Completed" },
    ]}
    columns={[
      { key: "id", label: "Booking ID", id: true },
      { key: "customer", label: "Customer", icon: UserRound, primary: true },
      { key: "route", label: "Route", icon: Route },
      { key: "vehicle", label: "Vehicle", icon: Car },
      { key: "date", label: "Date", icon: CalendarDays },
      { key: "amount", label: "Amount", icon: IndianRupee, money: true },
      { key: "status", label: "Status", icon: Activity, badge: true },
      { key: "notes", label: "Description", icon: FileText, rich: true },
    ]}
    fields={[
      { key: "customer", label: "Customer Name", required: true },
      { key: "route", label: "Route", required: true, placeholder: "Hyderabad → Tirupati" },
      { key: "vehicle", label: "Vehicle", type: "select", options: vehicleNos, half: true },
      { key: "date", label: "Travel Date", type: "date", required: true, half: true },
      { key: "amount", label: "Amount (₹)", type: "number", required: true, half: true },
      { key: "status", label: "Status", type: "select", options: ["Confirmed", "Ongoing", "Completed", "Cancelled"], default: "Confirmed", half: true },
      { key: "notes", label: "Description", type: "rich" },
    ]}
  />
);

export const ExpenseHeadsPage = () => (
  <DataPage
    title="Expense Heads" singular="Expense Head" idPrefix="EH" initial={expenseHeads}
    subtitle="Categories used when recording expenses"
    tabs={[
      { label: "All Heads", icon: Tag },
      { label: "Active", icon: UserCheck, test: (r) => r.status === "Active" },
      { label: "Inactive", icon: UserX, test: (r) => r.status === "Inactive" },
    ]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "name", label: "Expense Head", icon: Tag, primary: true },
      { key: "description", label: "Description", icon: FileText },
      { key: "status", label: "Status", icon: Activity, badge: true },
    ]}
    fields={[
      { key: "name", label: "Expense Head Name", required: true, placeholder: "e.g. Fuel" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"], default: "Active" },
    ]}
  />
);

export const ExpensesPage = () => (
  <DataPage
    title="Expenses" singular="Expense" idPrefix="EX" initial={expenses}
    subtitle="Click an expense to edit it"
    tabs={[
      { label: "All Expenses", icon: Receipt },
      { label: "Fuel", icon: Gauge, test: (r) => r.category === "Fuel" },
      { label: "Maintenance", icon: ShieldCheck, test: (r) => r.category === "Maintenance" },
    ]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "date", label: "Date", icon: CalendarDays },
      { key: "vehicle", label: "Vehicle", icon: Car, primary: true },
      { key: "category", label: "Expense Head", icon: Tag },
      { key: "amount", label: "Amount", icon: IndianRupee, money: true },
      { key: "note", label: "Note", icon: FileText },
      { key: "receipt", label: "Receipt", icon: Receipt, files: true },
      { key: "attachments", label: "Attachments", icon: Paperclip, files: true },
    ]}
    fields={[
      { key: "vehicle", label: "Vehicle", type: "select", options: vehicleNos, required: true, half: true },
      { key: "category", label: "Expense Head", type: "select", options: expenseHeads.map((h) => h.name), required: true, half: true },
      { key: "date", label: "Date", type: "date", required: true, half: true },
      { key: "amount", label: "Amount (₹)", type: "number", required: true, half: true },
      { key: "note", label: "Note" },
      { key: "receipt", label: "Receipt", type: "file" },
      { key: "attachments", label: "Attachments", type: "file" },
    ]}
  />
);

export const PaymentsPage = () => (
  <DataPage
    title="Payments" singular="Payment" idPrefix="PAY" initial={payments}
    subtitle="Click a payment to edit it"
    tabs={[
      { label: "All Payments", icon: CreditCard },
      { label: "Paid", icon: CircleCheck, test: (r) => r.status === "Paid" },
      { label: "Pending / Partial", icon: Hourglass, test: (r) => r.status !== "Paid" },
    ]}
    columns={[
      { key: "id", label: "Payment ID", id: true },
      { key: "customer", label: "Customer", icon: UserRound, primary: true },
      { key: "booking", label: "Booking", icon: CalendarCheck },
      { key: "amount", label: "Amount", icon: IndianRupee, money: true },
      { key: "mode", label: "Mode", icon: Wallet },
      { key: "status", label: "Status", icon: Activity, badge: true },
    ]}
    fields={[
      { key: "booking", label: "Booking", type: "select", options: bookings.map((b) => b.id), required: true, half: true,
        autofill: (id) => { const b = bookings.find((x) => x.id === id); return b ? { customer: b.customer, amount: b.amount } : {}; } },
      { key: "customer", label: "Customer Name", required: true, half: true },
      { key: "amount", label: "Amount (₹)", type: "number", required: true, half: true },
      { key: "mode", label: "Payment Mode", type: "select", options: ["UPI", "Cash", "Bank Transfer", "Cheque", "Card"], required: true, half: true },
      { key: "status", label: "Status", type: "select", options: ["Paid", "Partial", "Pending"], default: "Pending" },
    ]}
  />
);

export const UsersPage = () => (
  <DataPage
    title="Users" singular="User" idPrefix="US" initial={users}
    subtitle="Click a user to edit their details"
    tabs={[
      { label: "All Users", icon: Users },
      { label: "Active", icon: UserCheck, test: (r) => r.status === "Active" },
      { label: "Inactive", icon: UserX, test: (r) => r.status === "Inactive" },
    ]}
    columns={[
      { key: "id", label: "ID", id: true },
      { key: "name", label: "Name", icon: UserRound, primary: true },
      { key: "email", label: "Email", icon: Mail },
      { key: "phone", label: "Phone", icon: Phone },
      { key: "role", label: "Role", icon: ShieldCheck },
      { key: "password", label: "Password", icon: Lock, masked: true },
      { key: "status", label: "Status", icon: Activity, badge: true },
    ]}
    fields={[
      { key: "name", label: "User Name", required: true },
      { key: "email", label: "Email", type: "email", required: true, half: true },
      { key: "phone", label: "Phone Number", type: "tel", required: true, half: true },
      { key: "role", label: "Role", type: "select", options: ["Super Admin", "Manager", "Dispatcher", "Accountant"], required: true, half: true },
      { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"], default: "Active", half: true },
      { key: "password", label: "Login Password", type: "password", required: true, placeholder: "Minimum 6 characters" },
    ]}
  />
);
