import api from "./api.js";

export async function getPlanillas() {
  const { data } = await api.get("/planillas");
  return data;
}

export async function createPlanilla(payload) {
  const { data } = await api.post("/planillas", payload);
  return data;
}
