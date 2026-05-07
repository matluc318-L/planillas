import { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal.jsx";
import * as empleadoService from "../services/empleado.service.js";
import * as planillaService from "../services/planilla.service.js";

function calcPreview(base, desc, bono) {
  const b = Number(base) || 0;
  const d = Number(desc) || 0;
  const bo = Number(bono) || 0;
  if (Number.isNaN(b) || Number.isNaN(d) || Number.isNaN(bo)) return null;
  return Math.round((b - d + bo) * 100) / 100;
}

export default function Planillas() {
  const [planillas, setPlanillas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    empleadoId: "",
    salarioBase: "",
    descuento: "0",
    bono: "0",
  });

  async function load() {
    setError("");
    setLoading(true);
    try {
      const [p, e] = await Promise.all([
        planillaService.getPlanillas(),
        empleadoService.getEmpleados(),
      ]);
      setPlanillas(p);
      setEmpleados(e.filter((x) => x.activo));
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar planillas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const preview = useMemo(
    () => calcPreview(form.salarioBase, form.descuento, form.bono),
    [form.salarioBase, form.descuento, form.bono]
  );

  function openModal() {
    setForm({ empleadoId: "", salarioBase: "", descuento: "0", bono: "0" });
    setModalOpen(true);
  }

  function onSelectEmpleado(id) {
    const emp = empleados.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      empleadoId: id,
      salarioBase: emp ? String(emp.salario) : "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await planillaService.createPlanilla({
        empleadoId: form.empleadoId,
        salarioBase: Number(form.salarioBase),
        descuento: Number(form.descuento) || 0,
        bono: Number(form.bono) || 0,
      });
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo generar la planilla");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Planillas</h1>
          <p className="text-slate-600 mt-1">
            Genera planillas con salario base, descuentos y bonos
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700"
        >
          Generar planilla
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-slate-500 text-center">Cargando…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Empleado</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Salario base</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Descuento</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Bono</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Sueldo neto</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planillas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      Aún no hay planillas registradas.
                    </td>
                  </tr>
                ) : (
                  planillas.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {p.empleado.nombre} {p.empleado.apellido}
                        <span className="block text-xs font-normal text-slate-500">
                          {p.empleado.cargo}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-700 whitespace-nowrap">
                        S/ {Number(p.salarioBase).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-700 whitespace-nowrap">
                        S/ {Number(p.descuento).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-700 whitespace-nowrap">
                        S/ {Number(p.bono).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 tabular-nums font-semibold text-emerald-700 whitespace-nowrap">
                        S/ {Number(p.sueldoFinal).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleString("es-PE")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title="Generar planilla"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="planilla-form"
              disabled={saving}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar planilla"}
            </button>
          </div>
        }
      >
        <form id="planilla-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">Empleado</label>
            <select
              required
              value={form.empleadoId}
              onChange={(e) => onSelectEmpleado(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">Selecciona un empleado activo</option>
              {empleados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} {e.apellido} — {e.cargo}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Salario base</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.salarioBase}
                onChange={(e) => setForm((f) => ({ ...f, salarioBase: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Descuento</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.descuento}
                onChange={(e) => setForm((f) => ({ ...f, descuento: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Bono</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.bono}
                onChange={(e) => setForm((f) => ({ ...f, bono: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Vista previa sueldo neto
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {preview === null ? "—" : `S/ ${preview.toFixed(2)}`}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Fórmula: salario base − descuento + bono
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
