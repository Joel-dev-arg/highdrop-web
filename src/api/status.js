// --- LOG AL CARGAR EL MÓDULO ---
console.log("[status.js] cargado");

// REAL ONLY
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CULTIVO_ID = Number(import.meta.env.VITE_CULTIVO_ID || 1);

function timeAgo(d) {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m <= 0) return "justo ahora";
  if (m === 1) return "hace 1 min";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h === 1) return "hace 1 hora";
  if (h < 24) return `hace ${h} horas`;
  const dA = Math.floor(h / 24);
  if (dA === 1) return "hace 1 día";
  return `hace ${dA} días`;
}

function parseMySQLDate(val) {
  if (val instanceof Date) return val;
  if (!val && val !== 0) return new Date(NaN);
  if (typeof val === "number") return new Date(val);
  if (typeof val === "string") {
    const iso = val.includes("T") ? val : val.replace(" ", "T");
    let d = new Date(iso);
    if (!Number.isFinite(d.getTime())) d = new Date(iso + "Z");
    return d;
  }
  return new Date(val);
}

const RH = { min: 55, max: 70 };
const TT = { min: 20, max: 26 };
const PH = { min: 5.5, max: 6.2 };
const estadoRango = (v, min, max, low, high, ok) =>
  v < min ? low : v > max ? high : ok;

function formatoSemanasDias(dias) {
  const s = Math.floor(dias / 7);
  const r = dias % 7;
  let t = "";
  if (s > 0) t += s === 1 ? "1 semana" : `${s} semanas`;
  if (r > 0) t += (t ? " y " : "") + (r === 1 ? "1 día" : `${r} días`);
  if (!t) t = "0 días";
  return t;
}

function calcularCrecimientoDesde(fechaPlantacion) {
  const start = parseMySQLDate(fechaPlantacion);
  if (!Number.isFinite(start.getTime())) {
    return { etapa: "Desconocida", dias: 0, tiempo: "0 días", fecha: null };
  }
  const hoy = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const dias = Math.max(0, Math.floor((hoy.getTime() - start.getTime()) / msPerDay));

  let etapa = "Desconocida";
  if (dias <= 7) etapa = "Germinación";
  else if (dias <= 21) etapa = "Vegetativa";
  else if (dias <= 35) etapa = "Desarrollo";
  else etapa = "Cosecha";

  return { etapa, dias, tiempo: formatoSemanasDias(dias), fecha: start.toISOString() };
}

async function getFechaPlantacionConFallback(cultivoId) {
  try {
    const resCultivo = await fetch(`${API}/api/cultivos/${cultivoId}`);
    if (resCultivo.ok) {
      const cj = await resCultivo.json();
      const co = Array.isArray(cj) ? cj[0] : (cj?.data ?? cj);
      const plantRaw =
        co?.fecha_plantacion ?? co?.fechaPlantacion ?? co?.plantacion ??
        co?.fecha ?? co?.created_at ?? co?.creado_en ?? null;
      if (plantRaw) return parseMySQLDate(plantRaw);
    }
  } catch (e) {
    console.warn("[status.js] fallback cultivo error:", e);
  }

  try {
    const resHist = await fetch(`${API}/api/cultivos/${cultivoId}/detalles?limit=2000`);
    if (resHist.ok) {
      const rowsDesc = await resHist.json();
      if (Array.isArray(rowsDesc) && rowsDesc.length > 0) {
        const oldest = rowsDesc[rowsDesc.length - 1];
        if (oldest?.creado_en) return parseMySQLDate(oldest.creado_en);
      }
    }
  } catch (e) {
    console.warn("[status.js] fallback historial error:", e);
  }

  return new Date(NaN);
}

/** === ÚLTIMO ESTADO (con logs fuertes) === */
export async function getTowerStatus() {
  const url = `${API}/api/cultivos/${CULTIVO_ID}/detalles/latest`;
  console.log("[status.js] getTowerStatus → fetch:", url);

  let row;
  try {
    const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
    console.log("[status.js] latest status =", res.status);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    row = await res.json();
  } catch (e) {
    console.error("[status.js] ERROR fetching latest:", e);
    // devolvemos algo visible para debug
    return {
      conexionOk: false,
      actualizadoHace: "—",
      humedad: { value: NaN, estado: "—" },
      temperatura: { value: NaN, estado: "—" },
      nutrientes: { ph: NaN, estado: "—" },
      agua: { porcentaje: 0, estado: "—", proximo: "—" },
      luz: { porcentaje: 0 },
      crecimiento: { etapa: "Desconocida", dias: 0, tiempo: "0 días", fecha: null },
    };
  }

  console.log("LATEST ROW:", row); // <- esto DEBE aparecer

  // Preferir fecha_plantacion del latest (si tu backend la incluye con JOIN)
  const fechaPlantacionRow = row?.fecha_plantacion ?? row?.fechaPlantacion ?? null;
  const fechaPlantacion = fechaPlantacionRow
    ? parseMySQLDate(fechaPlantacionRow)
    : await getFechaPlantacionConFallback(CULTIVO_ID);

  const crecimiento = calcularCrecimientoDesde(fechaPlantacion);

  const humedad = Number(row?.humedad ?? NaN);
  const temp    = Number(row?.temperatura_ambiente ?? NaN);
  const ph      = Number(row?.nivel_pH ?? NaN);
  const agua    = Number(row?.nivel_agua ?? NaN);
  const luz     = Number(row?.nivel_luz ?? NaN);
  const ts      = row?.creado_en ? parseMySQLDate(row.creado_en) : new Date();

  return {
    conexionOk: true,
    actualizadoHace: timeAgo(ts),

    humedad:     { value: humedad, estado: estadoRango(humedad, RH.min, RH.max, "Baja", "Alta", "Óptimo") },
    temperatura: { value: temp,    estado: estadoRango(temp, TT.min, TT.max, "Baja", "Alta", "Estable") },
    nutrientes:  { ph,             estado: estadoRango(ph, PH.min, PH.max, "Bajo", "Alto", "Balanceado") },

    agua: { porcentaje: agua, estado: agua <= 25 ? "Bajo" : "Suficiente", proximo: "2 días" },
    luz:  { porcentaje: luz },

    crecimiento, // {etapa, dias, tiempo, fecha}
  };
}

/** Históricos */
export async function getHumidityHistoryRaw({ minutes = 60 * 24 } = {}) {
  const limit = Math.max(1, Math.min(2000, minutes));
  const res = await fetch(`${API}/api/cultivos/${CULTIVO_ID}/detalles?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rowsDesc = await res.json();
  const rowsAsc = rowsDesc.slice().reverse();
  return rowsAsc.map(r => ({
    ts: parseMySQLDate(r.creado_en),
    humidity: Number(r?.humedad ?? 0),
  }));
}

export async function getTemperatureHistoryRaw({ minutes = 60 * 24 } = {}) {
  const limit = Math.max(1, Math.min(2000, minutes));
  const res = await fetch(`${API}/api/cultivos/${CULTIVO_ID}/detalles?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rowsDesc = await res.json();
  const rowsAsc = rowsDesc.slice().reverse();
  return rowsAsc.map(r => ({
    ts: parseMySQLDate(r.creado_en),
    temperature: Number(r?.temperatura_ambiente ?? 0),
  }));
}

export async function getNutrientsHistoryRaw({ minutes = 60 * 24 } = {}) {
  const limit = Math.max(1, Math.min(2000, minutes));
  const res = await fetch(`${API}/api/cultivos/${CULTIVO_ID}/detalles?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rowsDesc = await res.json();
  const rowsAsc = rowsDesc.slice().reverse();
  return rowsAsc.map(r => ({
    ts: parseMySQLDate(r.creado_en),
    ph: Number(r?.nivel_pH ?? 0),
  }));
}
