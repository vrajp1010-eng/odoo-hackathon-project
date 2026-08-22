import { Compass, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 text-navy"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-saffron text-white shadow-sm">
            <Compass size={20} strokeWidth={2.2} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            GlobeTrotter
          </span>
        </button>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/trips/new")}
              className="hidden items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:flex"
            >
              <Plus size={16} /> New trip
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink">{user.name}</p>
              <p className="text-xs leading-tight text-muted">{user.email}</p>
            </div>
            <button onClick={() => navigate("/profile")} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-light font-mono-data text-sm font-semibold text-teal-dark" aria-label="Open profile">
              {user.name?.[0]?.toUpperCase() || "?"}
            </button>
            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-muted hover:bg-navy/5 hover:text-coral"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
