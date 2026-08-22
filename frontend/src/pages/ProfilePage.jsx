import { useState } from "react";
import { Check, Mail, UserRound } from "lucide-react";
import Button from "../components/Button";
import { updateUser } from "../api/authApi";

export default function ProfilePage({ user, onUserUpdated }) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const updatedUser = await updateUser(user.id, { name: name.trim(), email: email.trim() });
      onUserUpdated(updatedUser);
      setMessage("Profile updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Your account</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">Profile & settings</h1>
        <p className="mt-2 text-sm text-muted">Keep your traveler details current across your plans.</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 flex items-center gap-4 border-b border-line pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-light font-display text-2xl font-bold text-teal-dark">{name[0]?.toUpperCase() || "?"}</div>
          <div><p className="font-semibold text-ink">Traveler profile</p><p className="text-sm text-muted">Used for your personal trip workspace</p></div>
        </div>
        {error && <p className="mb-4 rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">{error}</p>}
        {message && <p className="mb-4 flex items-center gap-2 rounded-lg bg-teal-light px-3 py-2 text-sm text-teal-dark"><Check size={16} /> {message}</p>}
        <label className="mb-5 block"><span className="mb-1.5 block text-sm font-semibold text-ink">Full name</span><span className="relative block"><UserRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-line py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal" /></span></label>
        <label className="mb-7 block"><span className="mb-1.5 block text-sm font-semibold text-ink">Email address</span><span className="relative block"><Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-line py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal" /></span></label>
        <Button type="submit" loading={saving}>Save changes</Button>
      </form>
    </div>
  );
}
