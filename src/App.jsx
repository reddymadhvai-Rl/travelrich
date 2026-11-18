import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import {
  DriversPage,
  BookingsPage,
  ExpensesPage,
  PaymentsPage,
  ExpenseHeadsPage,
  UsersPage,
} from "./pages/Pages.jsx";
import TrackingPage, { TrackingMapPage } from "./pages/Tracking.jsx";
import { TodayAttendance, MonthAttendance, AddAttendance } from "./pages/Attendance.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import VehiclesList from "./pages/VehiclesList.jsx";
import VehicleForm from "./pages/VehicleForm.jsx";
import VehicleDetails from "./pages/VehicleDetails.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import {
  PurchasesPage, ChallansPage, AssignmentsPage, BranchesPage, FuelTypesPage, VehicleCategoriesPage, VehicleTypesPage,
} from "./pages/Fleet.jsx";
import { ChallanForm, PurchaseForm, AssignmentForm } from "./pages/FleetForms.jsx";
import PayrollPage, { PayslipPage } from "./pages/Payroll.jsx";

export const isLoggedIn = () => localStorage.getItem("travel_admin_auth") === "1";

function Protected({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicles" element={<VehiclesList />} />
        <Route path="/vehicles/new" element={<VehicleForm />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/expense-heads" element={<ExpenseHeadsPage />} />
        <Route path="/attendance" element={<Navigate to="/attendance/today" replace />} />
        <Route path="/attendance/today" element={<TodayAttendance />} />
        <Route path="/attendance/add" element={<AddAttendance />} />
        <Route path="/attendance/month" element={<MonthAttendance />} />
        <Route path="/company-assignments" element={<AssignmentsPage />} />
        <Route path="/company-assignments/new" element={<AssignmentForm />} />
        <Route path="/company-assignments/:id/edit" element={<AssignmentForm />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/purchases/new" element={<PurchaseForm />} />
        <Route path="/purchases/:id/edit" element={<PurchaseForm />} />
        <Route path="/challans" element={<ChallansPage />} />
        <Route path="/challans/new" element={<ChallanForm />} />
        <Route path="/challans/:id/edit" element={<ChallanForm />} />
        <Route path="/master" element={<Navigate to="/master/branches" replace />} />
        <Route path="/master/branches" element={<BranchesPage />} />
        <Route path="/master/fuel-types" element={<FuelTypesPage />} />
        <Route path="/master/vehicle-categories" element={<VehicleCategoriesPage />} />
        <Route path="/master/vehicle-types" element={<VehicleTypesPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/payroll/:empId" element={<PayslipPage />} />
        <Route path="/payments/history" element={<PaymentHistory />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/tracking/:id" element={<TrackingMapPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
