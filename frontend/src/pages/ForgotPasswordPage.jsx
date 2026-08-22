import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import Button from "../components/Button";
import { requestPasswordReset, resetPassword } from "../api/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(event) {
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      const result = await requestPasswordReset(email.trim());
      setMessage(result.message);
      if (result.reset_token) setToken(result.reset_token);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function handleReset(event) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const result = await resetPassword(token, password);
      setMessage(result.message);
      setToken(""); setPassword("");
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"><ArrowLeft size={16} /> Back to login</Link>
        <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron text-white"><KeyRound size={23} /></span>
          <h1 className="font-display text-3xl font-bold text-ink">Reset your password</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Request a local reset link, then choose a new password.</p>
          {error && <p className="mt-5 rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">{error}</p>}
          {message && <p className="mt-5 rounded-lg bg-teal-light px-3 py-2 text-sm text-teal-dark">{message}</p>}
          <form onSubmit={handleRequest} className="mt-6">
            <label className="block text-sm font-semibold text-ink">Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-teal" /></label>
            <Button type="submit" loading={loading} className="mt-4 w-full">Create reset link</Button>
          </form>
          {token && <form onSubmit={handleReset} className="mt-7 border-t border-line pt-6">
            <label className="block text-sm font-semibold text-ink">Reset token<input value={token} onChange={(e) => setToken(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-xs outline-none focus:border-teal" /></label>
            <label className="mt-4 block text-sm font-semibold text-ink">New password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-teal" /></label>
            <Button type="submit" loading={loading} className="mt-4 w-full">Set new password</Button>
          </form>}
        </div>
      </div>
    </main>
  );
}
