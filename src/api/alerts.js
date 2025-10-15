// src/api/alerts.js
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE = `${API}/api/alerts`;

function parseSettings(raw) {
  const asNum = (v, d) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };
  return {
    preset: raw?.preset ?? "lechuga",
    temperature: {
      enabled: raw?.temperature?.enabled ?? true,
      min: asNum(raw?.temperature?.min, 20),
      max: asNum(raw?.temperature?.max, 26),
    },
    humidity: {
      enabled: raw?.humidity?.enabled ?? true,
      min: asNum(raw?.humidity?.min, 55),
      max: asNum(raw?.humidity?.max, 70),
    },
    ph: {
      enabled: raw?.ph?.enabled ?? true,
      min: asNum(raw?.ph?.min, 5.5),
      max: asNum(raw?.ph?.max, 6.2),
    },
  };
}

export async function getAlertSettings() {
  const r = await fetch(`${BASE}/settings`);
  if (!r.ok) throw new Error("alerts_get_failed");
  const raw = await r.json();
  return parseSettings(raw);
}

export async function updateAlertSettings(payload) {
  const numeric = parseSettings(payload); // normalizamos números
  const res = await fetch(`${BASE}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(numeric),
  });
  if (!res.ok) throw new Error("alerts_put_failed");
  const saved = await res.json();
  const parsed = parseSettings(saved);
  window.dispatchEvent(new CustomEvent("alerts:updated", { detail: parsed }));
  return parsed;
}
