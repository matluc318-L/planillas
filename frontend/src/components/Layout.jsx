import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  [
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand-600 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-white">
        <div className="p-5">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-md" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Panel</p>
              <p className="font-semibold text-slate-800 leading-tight">Planillas</p>
            </div>
          </div>
        </div>
        <nav className="px-3 pb-4 flex md:flex-col gap-1 overflow-x-auto">
          <NavLink to="/" end className={linkClass}>
            <span aria-hidden>◆</span> Dashboard
          </NavLink>
          <NavLink to="/empleados" className={linkClass}>
            <span aria-hidden>◎</span> Empleados
          </NavLink>
          <NavLink to="/planillas" className={linkClass}>
            <span aria-hidden>▤</span> Planillas
          </NavLink>
        </nav>
        <div className="hidden md:block px-5 py-4 mt-auto border-t border-slate-100">
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <span className="font-semibold text-slate-800">Menú</span>
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-brand-600"
          >
            Salir
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
