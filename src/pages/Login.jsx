import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { isLoggedIn } from "../App.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import { checkLogin, validateIdentifier } from "../auth.js";

export default function Login() {
  const nav = useNavigate();
  const { state } = useLocation();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  if (isLoggedIn()) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    const bad = validateIdentifier(id);
    if (bad) return setError(bad);
    if (checkLogin(id, password)) {
      localStorage.setItem("travel_admin_auth", "1");
      nav("/");
    } else {
      setError("Invalid email / mobile number or password");
    }
  };

  return (
    <AuthLayout>
      <form className="login-card" onSubmit={submit} noValidate>
        <h2>Admin Login</h2>
        <p className="sub">Sign in to your travel admin panel</p>
        {state?.reset && <div className="ok-note">Password updated. Please sign in with your new password.</div>}
        {error && <div className="err" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="lg_id">Email / Mobile Number</label>
          <input id="lg_id" type="text" inputMode="email" autoComplete="username" value={id}
            onChange={(e) => { setId(e.target.value); setError(""); }} placeholder="admin@travel.com or 9848000001" required />
        </div>
        <div className="field">
          <label htmlFor="lg_pw">Password</label>
          <div className="pw-wrap">
            <input id="lg_pw" type={show ? "text" : "password"} autoComplete="current-password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" required />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        <div className="auth-row"><Link to="/forgot-password" className="auth-link">Forgot password?</Link></div>
        <button className="btn" type="submit">Login</button>
        <div className="hint">Demo: admin@travel.com <i>or</i> 9848000001 / admin123</div>
      </form>
    </AuthLayout>
  );
}
