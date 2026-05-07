import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as empleadoService from "../services/empleado.service.js";
import * as planillaService from "../services/planilla.service.js";

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function Dashboard() {
  const [empleados, setEmpleados] = useState([]);
  const [planillas, setPlanillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError("");
      setLoading(true);
      try {
        const [e, p] = await Promise.all([
          empleadoService.getEmpleados(),
          planillaService.getPlanillas(),
        ]);
        if (!cancelled) {
          setEmpleados(e);
          setPlanillas(p);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || "Error al cargar datos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalEmpleados = empleados.length;
  const activos = empleados.filter((x) => x.activo).length;
  const totalPlanillas = planillas.length;
  const recientes = empleados.slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Resumen rápido del sistema</p>
      </div>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Empleados" value={totalEmpleados} />
            <StatCard label="Empleados activos" value={activos} />
            <StatCard label="Planillas generadas" value={totalPlanillas} />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Empleados recientes</h2>
              <Link
                to="/empleados"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Ver todos
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">Nombre</th>
                    <th className="px-5 py-3 font-medium">Cargo</th>
                    <th className="px-5 py-3 font-medium">Salario</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recientes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                        No hay empleados aún.{" "}
                        <Link to="/empleados" className="text-brand-600 font-medium">
                          Crear uno
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    recientes.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80">
                        <td className="px-5 py-3 font-medium text-slate-900">
                          {emp.nombre} {emp.apellido}
                        </td>
                        <td className="px-5 py-3 text-slate-600">{emp.cargo}</td>
                        <td className="px-5 py-3 tabular-nums text-slate-700">
                          S/ {Number(emp.salario).toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={
                              emp.activo
                                ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                                : "inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                            }
                          >
                            {emp.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
