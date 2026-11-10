import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, Route, BellRing } from "lucide-react";
import { isLoggedIn } from "../App.jsx";
import logo from "../assets/travel-rich-logo.png";

// Demo credentials – replace with a real API call.
const DEMO = { email: "admin@travel.com", password: "admin123" };

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isLoggedIn()) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    if (email === DEMO.email && password === DEMO.password) {
      localStorage.setItem("travel_admin_auth", "1");
      nav("/");
    } else {
      setError("Invalid email or password");
    }
  };

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

      <section className="login-form-side">
        <form className="login-card" onSubmit={submit}>
          <h2>Admin Login</h2>
          <p className="sub">Sign in to your travel admin panel</p>
          {error && <div className="err">{error}</div>}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@travel.com" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn" type="submit">Login</button>
          <div className="hint">Demo: admin@travel.com / admin123</div>
        </form>
      </section>
    </div>
  );
}
