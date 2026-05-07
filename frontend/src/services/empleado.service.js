import api from "./api.js";

export async function getEmpleados(q) {
  const params = q ? { q } : {};
  const { data } = await api.get("/empleados", { params });
  return data;
}

export async function createEmpleado(payload) {
  const { data } = await api.post("/empleados", payload);
  return data;
}

export async function updateEmpleado(id, payload) {
  const { data } = await api.put(`/empleados/${id}`, payload);
  return data;
}

export async function deleteEmpleado(id) {
  await api.delete(`/empleados/${id}`);
}
