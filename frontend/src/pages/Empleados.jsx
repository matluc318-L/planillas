import { useEffect, useState } from "react";
import Modal from "../components/Modal.jsx";
import * as empleadoService from "../services/empleado.service.js";

const emptyForm = {
  nombre: "",
  apellido: "",
  dni: "",
  correo: "",
  telefono: "",
  cargo: "",
  salario: "",
  fechaIngreso: "",
  activo: true,
};

function toInputDate(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 10);
}

export default function Empleados() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function refresh(search) {
    setError("");
    setLoading(true);
    try {
      const data = await empleadoService.getEmpleados(search || undefined);
      setList(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const term = q.trim() || undefined;
    const delay = q.trim() === "" ? 0 : 300;
    const t = setTimeout(() => refresh(term), delay);
    return () => clearTimeout(t);
  }, [q]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(emp) {
    setEditing(emp);
    setForm({
      nombre: emp.nombre,
      apellido: emp.apellido,
      dni: emp.dni,
      correo: emp.correo,
      telefono: emp.telefono,
      cargo: emp.cargo,
      salario: String(emp.salario),
      fechaIngreso: toInputDate(emp.fechaIngreso),
      activo: emp.activo,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        salario: Number(form.salario),
        fechaIngreso: form.fechaIngreso,
      };
      if (editing) {
        await empleadoService.updateEmpleado(editing.id, payload);
      } else {
        await empleadoService.createEmpleado(payload);
      }
      setModalOpen(false);
      await refresh(q.trim() || undefined);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    setError("");
    try {
      await empleadoService.deleteEmpleado(deleteTarget.id);
      setDeleteTarget(null);
      await refresh(q.trim() || undefined);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Empleados</h1>
          <p className="text-slate-600 mt-1">Administra el personal de la empresa</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700"
        >
          Nuevo empleado
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="search"
          placeholder="Buscar por nombre, DNI, correo, cargo…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:max-w-md rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        />
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
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Nombre</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">DNI</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Correo</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Cargo</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Salario</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Ingreso</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                      No hay resultados.
                    </td>
                  </tr>
                ) : (
                  list.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {emp.nombre} {emp.apellido}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{emp.dni}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                        {emp.correo}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{emp.cargo}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-700 whitespace-nowrap">
                        S/ {Number(emp.salario).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {toInputDate(emp.fechaIngreso)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
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
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => openEdit(emp)}
                          className="text-brand-600 hover:text-brand-700 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(emp)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Eliminar
                        </button>
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
        title={editing ? "Editar empleado" : "Nuevo empleado"}
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
              form="empleado-form"
              disabled={saving}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        }
      >
        <form id="empleado-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600">Nombre</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600">Apellido</label>
            <input
              required
              value={form.apellido}
              onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600">DNI</label>
            <input
              required
              value={form.dni}
              onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600">Correo</label>
            <input
              type="email"
              required
              value={form.correo}
              onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600">Teléfono</label>
            <input
              required
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600">Cargo</label>
            <input
              required
              value={form.cargo}
              onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600">Salario</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.salario}
              onChange={(e) => setForm((f) => ({ ...f, salario: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600">Fecha de ingreso</label>
            <input
              type="date"
              required
              value={form.fechaIngreso}
              onChange={(e) => setForm((f) => ({ ...f, fechaIngreso: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              id="activo"
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="activo" className="text-sm text-slate-700">
              Empleado activo
            </label>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !saving && setDeleteTarget(null)}
        title="Eliminar empleado"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={confirmDelete}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? "Eliminando…" : "Eliminar"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          ¿Seguro que deseas eliminar a{" "}
          <span className="font-semibold text-slate-900">
            {deleteTarget?.nombre} {deleteTarget?.apellido}
          </span>
          ? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
