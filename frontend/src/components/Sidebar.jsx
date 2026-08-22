import { NavLink } from "react-router-dom";
import { BarChart3, LayoutDashboard, PlusCircle, UserRound } from "lucide-react";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/trips/new", label: "New Trip", icon: PlusCircle },
  { to: "/profile", label: "Profile", icon: UserRound },
];

function linkClasses({ isActive }) {
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-teal-light text-teal-dark"
      : "text-muted hover:bg-navy/5 hover:text-ink"
  }`;
}

function mobileLinkClasses({ isActive }) {
  return `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium ${
    isActive ? "text-teal-dark" : "text-muted"
  }`;
}

export default function Sidebar({ user }) {
  const links = user?.is_admin
    ? [...LINKS, { to: "/admin", label: "Analytics", icon: BarChart3 }]
    : LINKS;
  return (
    <>
      {/* Desktop: left rail */}
      <nav className="hidden w-60 shrink-0 flex-col gap-1 border-r border-line/80 px-5 py-8 md:flex">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Travel planning</p>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClasses}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile: fixed bottom tab bar */}
      <nav className="fixed inset-x-3 bottom-3 z-30 flex rounded-2xl border border-line bg-card/95 p-1 shadow-lg backdrop-blur md:hidden">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={mobileLinkClasses}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
