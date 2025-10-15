// REAL ONLY
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CULTIVO_ID = Number(import.meta.env.VITE_CULTIVO_ID || 1);

function timeAgo(d) {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m <= 0) return "justo ahora";
  if (m === 1) return "hace 1 min";
  return `hace ${m} min`;
}

const RH = { min: 55, max: 70 };
const TT = { min: 20, max: 26 };
const PH = { min: 5.5, max: 6.2 };
const estadoRango = (v, min, max, low, high, ok) =>
  v < min ? low : v > max ? high : ok;

/** Último estado para StatusPanel */
export async function getTowerStatus() {
  const res = await fetch(`${API}/api/cultivos/${CULTIVO_ID}/detalles/latest`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const row = await res.json();

  const humedad = Number(row?.humedad ?? NaN);
  const temp    = Number(row?.temperatura_ambiente ?? NaN);
  const ph      = Number(row?.nivel_pH ?? NaN);
  const agua    = Number(row?.nivel_agua ?? NaN);
  const luz     = Number(row?.nivel_luz ?? NaN);
  const ts      = row?.creado_en ? new Date(row.creado_en) : new Date();

  return {
    conexionOk: true,
    actualizadoHace: timeAgo(ts),

    humedad:     { value: humedad, estado: estadoRango(humedad, RH.min, RH.max, "Baja", "Alta", "Óptimo") },
    temperatura: { value: temp,    estado: estadoRango(temp, TT.min, TT.max, "Baja", "Alta", "Estable") },
    nutrientes:  { ph,             estado: estadoRango(ph, PH.min, PH.max, "Bajo", "Alto", "Balanceado") },

    agua: { porcentaje: agua, estado: agua <= 25 ? "Bajo" : "Suficiente", proximo: "2 días" },
    luz:  { porcentaje: luz },

    // placeholders hasta que tengas esto en DB
    crecimiento: { etapa: "Etapa vegetativa", semana: "Semana 3", progreso: 72 },
  };
}

/** Histórico de humedad: devuelve ASC con {ts: Date, humidity: number} */
export async function getHumidityHistoryRaw({ minutes = 60 * 24 } = {}) {
  const limit = Math.max(1, Math.min(2000, minutes));
  const res = await fetch(`${API}/api/cultivos/${CULTIVO_ID}/detalles?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rowsDesc = await res.json();
  const rowsAsc = rowsDesc.slice().reverse(); // backend devuelve DESC

  return rowsAsc.map(r => ({
    ts: new Date(r.creado_en),
    humidity: Number(r?.humedad ?? 0),
  }));
}

/** Histórico de temperatura: devuelve ASC con {ts: Date, temperature: number} */
export async function getTemperatureHistoryRaw({ minutes = 60 * 24 } = {}) {
  const limit = Math.max(1, Math.min(2000, minutes));
  const res = await fetch(`${API}/api/cultivos/${CULTIVO_ID}/detalles?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rowsDesc = await res.json();
  const rowsAsc = rowsDesc.slice().reverse();

  return rowsAsc.map(r => ({
    ts: new Date(r.creado_en),
    temperature: Number(r?.temperatura_ambiente ?? 0),
  }));
}

/** Histórico de pH: devuelve ASC con {ts: Date, ph: number} */
export async function getNutrientsHistoryRaw({ minutes = 60 * 24 } = {}) {
  const limit = Math.max(1, Math.min(2000, minutes));
  const res = await fetch(`${API}/api/cultivos/${CULTIVO_ID}/detalles?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rowsDesc = await res.json();
  const rowsAsc = rowsDesc.slice().reverse();

  return rowsAsc.map(r => ({
    ts: new Date(r.creado_en),
    ph: Number(r?.nivel_pH ?? 0),
  }));
}
