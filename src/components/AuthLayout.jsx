import { ShieldCheck, Route, BellRing } from "lucide-react";
import logo from "../assets/travel-rich-logo.png";

/* Shared two-column shell for Login and Forgot Password */
export default function AuthLayout({ children }) {
  return (
    <div className="login-wrap">
      <section className="login-hero">
        <div className="login-logo"><img src={logo} alt="Travel Rich" /></div>
        <h1>Manage your travel fleet,<br />drivers & bookings in one place.</h1>
        <p>Track vehicles live, get document expiry alerts and keep daily attendance and breakdowns under control.</p>
        <ul>
          <li><Route size={18} /> Live vehicle trips & bookings</li>
          <li><BellRing size={18} /> Insurance, fitness & permit alerts</li>
          <li><ShieldCheck size={18} /> Secure admin access</li>
        </ul>
      </section>
      <section className="login-form-side">{children}</section>
    </div>
  );
}
