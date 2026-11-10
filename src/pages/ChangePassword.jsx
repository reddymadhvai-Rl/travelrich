import { useState } from "react";
import { KeyRound, Lock, ShieldCheck, Eye, EyeOff, CircleCheck, TriangleAlert } from "lucide-react";

const FIELDS = [
  ["current", "Current Password", "Enter your current password"],
  ["next", "New Password", "Minimum 6 characters"],
  ["confirm", "Confirm New Password", "Re-enter the new password"],
];

function strength(p) {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return p ? Math.max(1, s) : 0;
}
const LABEL = ["", "Weak", "Fair", "Good", "Strong"];

export default function ChangePassword() {
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({});
  const [msg, setMsg] = useState(null);
  const st = strength(f.next);

  const submit = (e) => {
    e.preventDefault();
    if (f.next.length < 6) return setMsg({ ok: false, t: "New password must be at least 6 characters" });
    if (f.next !== f.confirm) return setMsg({ ok: false, t: "Passwords do not match" });
    // TODO: call your API here
    setMsg({ ok: true, t: "Password changed successfully" });
    setF({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="cp-wrap">
      <div className="cp-card">
        <aside className="cp-side">
          <div className="cp-ico"><KeyRound size={28} /></div>
          <h3 className="hed">Keep your account secure</h3>
          <p>Update your password regularly and never share it with anyone.</p>
          <ul className="cp-tips">
            <li><CircleCheck size={15} /> At least 6 characters long</li>
            <li><CircleCheck size={15} /> Mix upper and lower case letters</li>
            <li><CircleCheck size={15} /> Add numbers and symbols</li>
            <li><CircleCheck size={15} /> Don't reuse an old password</li>
          </ul>
        </aside>

        <form className="cp-form" onSubmit={submit}>
          <h4>Change Password</h4>
          <p>Enter your current password, then choose a new one.</p>

          {msg && (
            <div className={`cp-msg ${msg.ok ? "ok" : "bad"}`}>
              {msg.ok ? <CircleCheck size={16} /> : <TriangleAlert size={16} />} {msg.t}
            </div>
          )}

          {FIELDS.map(([k, label, ph]) => (
            <div className="cp-field" key={k}>
              <label htmlFor={`cp_${k}`}>{label}</label>
              <div className="cp-input">
                <Lock size={16} />
                <input id={`cp_${k}`} type={show[k] ? "text" : "password"} required placeholder={ph} value={f[k]}
                  autoComplete={k === "current" ? "current-password" : "new-password"}
                  onChange={(e) => { setF({ ...f, [k]: e.target.value }); setMsg(null); }} />
                <button type="button" onClick={() => setShow({ ...show, [k]: !show[k] })} aria-label={show[k] ? "Hide password" : "Show password"}>
                  {show[k] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {k === "next" && f.next && (
                <div className="cp-meter" aria-label={`Strength: ${LABEL[st]}`}>
                  <div>{[1, 2, 3, 4].map((i) => <i key={i} className={i <= st ? `on s${st}` : ""} />)}</div>
                  <span>{LABEL[st]}</span>
                </div>
              )}
            </div>
          ))}

          <button className="btn cp-btn" type="submit"><ShieldCheck size={16} /> Update Password</button>
        </form>
      </div>
    </div>
  );
}