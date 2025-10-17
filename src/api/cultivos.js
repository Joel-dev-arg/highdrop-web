const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const listCultivos = async () => {
  const r = await fetch(`${API}/api/cultivos`);
  if (!r.ok) throw new Error("No se pudieron listar los cultivos");
  return r.json();
};

export const getCultivo = async (id) => {
  const r = await fetch(`${API}/api/cultivos/${id}`);
  if (!r.ok) throw new Error("No se pudo obtener el cultivo");
  return r.json();
};

export const createCultivo = async (payload) => {
  const r = await fetch(`${API}/api/cultivos`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("No se pudo crear el cultivo");
  return r.json();
};

export const updateCultivo = async (id, payload) => {
  const r = await fetch(`${API}/api/cultivos/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("No se pudo actualizar el cultivo");
  return r.json();
};

export const deleteCultivo = async (id) => {
  const r = await fetch(`${API}/api/cultivos/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("No se pudo eliminar el cultivo");
  return r.json();
};
