/* Demo authentication helpers – replace the bodies with real API calls.
   Accounts can sign in with email OR mobile number. */
const ACCOUNT = { email: "admin@travel.com", phone: "9848000001", password: "admin123" };
const PW_KEY = "travel_admin_pw";

export const DEMO_OTP = "123456";
export const digits = (v) => String(v || "").replace(/\D/g, "");
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
export const isMobile = (v) => {
  const d = digits(v);
  return d.length === 10 || (d.length === 12 && d.startsWith("91"));
};
/** "Enter a valid email or mobile" check – returns an error string or "". */
export const validateIdentifier = (v) => (isEmail(v) || isMobile(v) ? "" : "Enter a valid email address or 10-digit mobile number");

const tenDigits = (v) => digits(v).slice(-10);
export const matchesAccount = (id) =>
  isEmail(id) ? id.trim().toLowerCase() === ACCOUNT.email : isMobile(id) && tenDigits(id) === ACCOUNT.phone;

const currentPassword = () => {
  try { return localStorage.getItem(PW_KEY) || ACCOUNT.password; } catch { return ACCOUNT.password; }
};
export const checkLogin = (id, pw) => matchesAccount(id) && pw === currentPassword();
export const resetPassword = (pw) => { try { localStorage.setItem(PW_KEY, pw); } catch { /* ignore */ } };

/** Masks the destination shown on the OTP step: a***n@travel.com / ******0001 */
export const mask = (id) =>
  isEmail(id)
    ? id.trim().replace(/^(.)(.*)(.@)/, (_, a, m, z) => a + "*".repeat(Math.max(m.length, 2)) + z)
    : "******" + tenDigits(id).slice(-4);
