import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { signup } from "../../api/authApi";
import Button from "../../components/Button";
import { getCityImage } from "../../utils/travelImages";

export default function Signup({ onAuthenticated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError("Enter your details and a password of at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = await signup({ name: name.trim(), email: email.trim(), password });
      onAuthenticated(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={getCityImage("Jaipur")} alt="Jaipur palace at sunset" className="absolute inset-0 h-full w-full object-cover" />
        <div className="photo-wash absolute inset-0" />
        <div className="absolute bottom-14 left-14 text-white">
          <p className="font-mono-data text-xs uppercase tracking-[0.2em] text-white/70">Start wandering</p>
          <p className="mt-3 max-w-md font-display text-5xl font-bold leading-[1.05]">A blank map<br />is an invitation.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col gap-2">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron text-white">
            <Compass size={24} />
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Start planning
          </h1>
          <p className="text-sm text-muted">Create an account to build your first trip.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8"
        >
          {error && (
            <p className="mb-4 rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">
              {error}
            </p>
          )}

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-ink">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vraj Patel"
              className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1 block text-sm font-medium text-ink">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vraj@example.com"
              className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal"
            />
          </label>
          <label className="mb-5 block">
            <span className="mb-1 block text-sm font-medium text-ink">Password</span>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal" />
          </label>

          <Button type="submit" loading={loading} className="w-full">
            Create account
          </Button>

          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-teal-dark hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
      </div>
    </div>
  );
}
