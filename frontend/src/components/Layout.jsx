import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-paper/80">
      <Navbar user={user} onLogout={onLogout} />
      <div className="mx-auto flex max-w-[1320px]">
        <Sidebar user={user} />
        <main className="page-enter min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-8 md:pb-12 md:pt-10 lg:px-12">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
