import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, MailCheck } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import { DEMO_OTP, mask, matchesAccount, resetPassword, validateIdentifier } from "../auth.js";

/* 3 steps: 1) email / mobile  2) OTP  3) new password */
export default function ForgotPassword() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [id, setId] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendOtp = (e) => {
    e?.preventDefault();
    const bad = validateIdentifier(id);
    if (bad) return setError(bad);
    // TODO: call your API to send the OTP. The same message is shown whether or not the account exists.
    setError(""); setOtp(""); setWait(30); setInfo(""); setStep(2);
  };
  const verify = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit OTP");
    if (otp !== DEMO_OTP || !matchesAccount(id)) return setError("Invalid OTP. Please try again");
    setError(""); setStep(3);
  };
  const save = (e) => {
    e.preventDefault();
    if (pw.length < 6) return setError("Password must be at least 6 characters");
    if (pw !== pw2) return setError("Passwords do not match");
    resetPassword(pw);
    nav("/login", { replace: true, state: { reset: true } });
  };

  const titles = {
    1: ["Forgot Password?", "Enter your registered email or mobile number and we'll send you a one-time password."],
    2: ["Verify OTP", `We sent a 6-digit code to ${mask(id)}.`],
    3: ["Set New Password", "Choose a new password for your account."],
  };

  return (
    <AuthLayout>
      <form className="login-card" onSubmit={step === 1 ? sendOtp : step === 2 ? verify : save} noValidate>
        <div className="auth-steps" aria-label={`Step ${step} of 3`}>{[1, 2, 3].map((n) => <i key={n} className={n <= step ? "on" : ""} />)}</div>
        <h2>{titles[step][0]}</h2>
        <p className="sub">{titles[step][1]}</p>
        {error && <div className="err" role="alert">{error}</div>}
        {info && <div className="ok-note"><MailCheck size={15} /> {info}</div>}

        {step === 1 && (
          <div className="field">
            <label htmlFor="fp_id">Email / Mobile Number</label>
            <input id="fp_id" type="text" inputMode="email" autoFocus value={id} placeholder="admin@travel.com or 9848000001"
              onChange={(e) => { setId(e.target.value); setError(""); }} />
          </div>
        )}

        {step === 2 && (
          <>
            <div className="field">
              <label htmlFor="fp_otp">One-Time Password</label>
              <input id="fp_otp" className="otp-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus
                value={otp} placeholder="••••••" onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }} />
            </div>
            <div className="auth-row">
              <button type="button" className="auth-link" disabled={wait > 0}
                onClick={() => { sendOtp(); setInfo("A new OTP has been sent"); }}>
                {wait > 0 ? `Resend OTP in ${wait}s` : "Resend OTP"}
              </button>
              <button type="button" className="auth-link" onClick={() => { setStep(1); setError(""); setInfo(""); }}>Change</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="field">
              <label htmlFor="fp_pw">New Password</label>
              <div className="pw-wrap">
                <input id="fp_pw" type={show ? "text" : "password"} autoComplete="new-password" autoFocus value={pw} placeholder="Minimum 6 characters"
                  onChange={(e) => { setPw(e.target.value); setError(""); }} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="fp_pw2">Confirm New Password</label>
              <input id="fp_pw2" type={show ? "text" : "password"} autoComplete="new-password" value={pw2} placeholder="Re-enter the new password"
                onChange={(e) => { setPw2(e.target.value); setError(""); }} />
            </div>
          </>
        )}

        <button className="btn" type="submit">{step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Update Password"}</button>
        {step === 1 && <div className="hint">Demo OTP: {DEMO_OTP}</div>}
        {step === 2 && <div className="hint">Demo OTP: {DEMO_OTP}</div>}
        <Link to="/login" className="auth-back"><ArrowLeft size={15} /> Back to login</Link>
      </form>
    </AuthLayout>
  );
}
