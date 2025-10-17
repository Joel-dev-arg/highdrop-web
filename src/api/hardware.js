// src/api/hardware.js
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getActiveCultivo() {
  const r = await fetch(`${API}/api/hardware/active-cultivo`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json(); // { id }
}

export async function setActiveCultivo(id) {
  const r = await fetch(`${API}/api/hardware/active-cultivo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json(); // { ok:true, id }
}
