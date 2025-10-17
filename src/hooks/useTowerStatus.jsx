// src/hooks/useTowerStatus.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import useAlertSettings from "./useAlertSettings";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const REQUEST_TIMEOUT_MS = 3000; // timeout corto por request

/* ========= helpers ========= */
function timeAgo(date) {
  const diff = Math.max(0, Date.now() - date.getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "justo ahora";
  if (m === 1) return "hace 1 min";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h === 1) return "hace 1 hora";
  if (h < 24) return `hace ${h} horas`;
  const d = Math.floor(h / 24);
  if (d === 1) return "hace 1 día";
  return `hace ${d} días`;
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
/* =========================== */

export default function useTowerStatus(pollMs = 60000, cultivoId = 1) {
  const { settings } = useAlertSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);

  const controller = useRef(null);
  const timer = useRef(null);
  const mounted = useRef(false);

  // helpers de estado según rangos de settings
  const asNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : undefined);
  const ranges = {
    humidity:    { min: asNum(settings?.humidity?.min) ?? 55, max: asNum(settings?.humidity?.max) ?? 70 },
    temperature: { min: asNum(settings?.temperature?.min) ?? 20, max: asNum(settings?.temperature?.max) ?? 26 },
    ph:          { min: asNum(settings?.ph?.min) ?? 5.5,  max: asNum(settings?.ph?.max) ?? 6.2 },
    water:       { min: 25 },
  };
  const estado = {
    humidity(v){ if (!Number.isFinite(v)) return "—"; return v < ranges.humidity.min ? "Baja" : v > ranges.humidity.max ? "Alta" : "Óptimo"; },
    temperature(v){ if (!Number.isFinite(v)) return "—"; return v < ranges.temperature.min ? "Baja" : v > ranges.temperature.max ? "Alta" : "Estable"; },
    ph(v){ if (!Number.isFinite(v)) return "—"; return v < ranges.ph.min ? "Bajo" : v > ranges.ph.max ? "Alto" : "Balanceado"; },
    water(p){ if (!Number.isFinite(p)) return "—"; return p <= ranges.water.min ? "Bajo" : "Suficiente"; },
  };

  // Marcá desconectado pero conservá los últimos datos si existen
  const setDisconnectedKeep = (msg = "No se encuentra conectado el Arduino") => {
    setData((prev) =>
      prev
        ? { ...prev, conexionOk: false, errorMsg: msg }
        : {
            conexionOk: false,
            errorMsg: msg,
            actualizadoHace: "—",
            humedad:     { value: NaN, estado: "—" },
            temperatura: { value: NaN, estado: "—" },
            nutrientes:  { ph: NaN,  estado: "—" },
            crecimiento: { etapa: "Desconocida", dias: 0, tiempo: "0 días" },
            agua:        { porcentaje: 0, estado: "—", proximo: "—" },
            luz:         { porcentaje: 0 },
          }
    );
  };

  const fetchLatest = useCallback(async () => {
    setLoading(true);

    // cancela la request previa si sigue viva
    controller.current?.abort();
    const ac = new AbortController();
    controller.current = ac;

    // timeout corto
    const tId = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);

    try {
      const url = `${API}/api/cultivos/${cultivoId}/detalles/latest`;
      const res = await fetch(url, { signal: ac.signal, headers: { "Cache-Control": "no-cache" } });

      if (!res.ok) { if (mounted.current) setDisconnectedKeep(); return; }

      const row = await res.json();
      console.log("[useTowerStatus] latest row:", row);

      // calcular métricas SIEMPRE que venga JSON del backend
      const humedad = Number(row?.humedad ?? NaN);
      const temp    = Number(row?.temperatura_ambiente ?? NaN);
      const ph      = Number(row?.nivel_pH ?? NaN);
      const agua    = Number(row?.nivel_agua ?? NaN);
      const luz     = Number(row?.nivel_luz ?? NaN);
      const ts      = row?.creado_en ? parseMySQLDate(row.creado_en) : new Date();

      const plantRaw =
        row?.fecha_plantacion ??
        row?.fechaPlantacion ??
        row?.plantacion ??
        null;
      const crecimiento = calcularCrecimientoDesde(plantRaw);

      // bandera de backend (si viene false, marcamos desconectado pero dejamos datos)
      const connected =
        row?.arduino_connected === undefined ? true : !!row.arduino_connected;

      if (!mounted.current) return;

      setData({
        conexionOk: connected,
        errorMsg: connected ? undefined : "No se encuentra conectado el Arduino",
        actualizadoHace: timeAgo(ts),
        humedad:     { value: humedad, estado: estado.humidity(humedad) },
        temperatura: { value: temp,    estado: estado.temperature(temp) },
        nutrientes:  { ph,             estado: estado.ph(ph) },
        crecimiento,
        agua:        { porcentaje: agua, estado: estado.water(agua), proximo: "2 días" },
        luz:         { porcentaje: luz },
      });
      setLastFetch(ts);
    } catch (e) {
      if (e?.name === "AbortError") {
        if (mounted.current) setDisconnectedKeep("No se encuentra conectado el Arduino (timeout)");
      } else {
        console.error("[useTowerStatus] error:", e);
        if (mounted.current) setDisconnectedKeep();
      }
    } finally {
      clearTimeout(tId);
      if (mounted.current) setLoading(false);
    }
  }, [cultivoId, settings]);

  useEffect(() => {
    mounted.current = true;
    fetchLatest();                                   // primera carga
    timer.current = setInterval(fetchLatest, pollMs); // luego cada pollMs
    return () => {
      mounted.current = false;
      controller.current?.abort();
      clearInterval(timer.current);
    };
  }, [fetchLatest, pollMs]);

  const reload = useCallback(() => fetchLatest(), [fetchLatest]);

  return { data, loading, reload, lastFetch };
}
