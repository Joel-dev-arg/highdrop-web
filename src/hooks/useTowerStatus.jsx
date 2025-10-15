// src/hooks/useTowerStatus.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import useAlertSettings from "./useAlertSettings";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function timeAgo(date) {
  const diff = Math.max(0, Date.now() - date.getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "justo ahora";
  if (m === 1) return "hace 1 min";
  return `hace ${m} min`;
}

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
    humidity:   { min: asNum(settings?.humidity?.min) ?? 55, max: asNum(settings?.humidity?.max) ?? 70 },
    temperature:{ min: asNum(settings?.temperature?.min) ?? 20, max: asNum(settings?.temperature?.max) ?? 26 },
    ph:         { min: asNum(settings?.ph?.min) ?? 5.5,  max: asNum(settings?.ph?.max) ?? 6.2 },
    water:      { min: 25 },
  };

  const estado = {
    humidity(v){ if (!Number.isFinite(v)) return "—"; return v < ranges.humidity.min ? "Baja" : v > ranges.humidity.max ? "Alta" : "Óptimo"; },
    temperature(v){ if (!Number.isFinite(v)) return "—"; return v < ranges.temperature.min ? "Baja" : v > ranges.temperature.max ? "Alta" : "Estable"; },
    ph(v){ if (!Number.isFinite(v)) return "—"; return v < ranges.ph.min ? "Bajo" : v > ranges.ph.max ? "Alto" : "Balanceado"; },
    water(p){ if (!Number.isFinite(p)) return "—"; return p <= ranges.water.min ? "Bajo" : "Suficiente"; },
  };

  const fetchLatest = useCallback(async () => {
    setLoading(true);

    // cancelar request previa si sigue viva
    controller.current?.abort();
    const ac = new AbortController();
    controller.current = ac;

    try {
      const res = await fetch(`${API}/api/cultivos/${cultivoId}/detalles/latest`, { signal: ac.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const row = await res.json();

      const humedad = Number(row?.humedad ?? NaN);
      const temp    = Number(row?.temperatura_ambiente ?? NaN);
      const ph      = Number(row?.nivel_pH ?? NaN);
      const agua    = Number(row?.nivel_agua ?? NaN);
      const luz     = Number(row?.nivel_luz ?? NaN);
      const ts      = row?.creado_en ? new Date(row.creado_en) : new Date();

      if (!mounted.current) return; // evita setState si se desmontó

      setData({
        conexionOk: true,
        actualizadoHace: timeAgo(ts),

        humedad:     { value: humedad, estado: estado.humidity(humedad) },
        temperatura: { value: temp,    estado: estado.temperature(temp) },
        nutrientes:  { ph,             estado: estado.ph(ph) },

        crecimiento: { etapa: "Etapa vegetativa", semana: "Semana 3", progreso: 72 }, // placeholder si aún no está en DB
        agua:        { porcentaje: agua, estado: estado.water(agua), proximo: "2 días" },
        luz:         { porcentaje: luz },
      });
      setLastFetch(ts);
    } catch (e) {
      if (e?.name === "AbortError") {
        // request abortada a propósito: no loguear ni cambiar estado
        return;
      }
      console.error(e);
      if (!mounted.current) return;
      setData(prev => (prev ? { ...prev, conexionOk: false } : null));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [cultivoId, settings]);

  useEffect(() => {
    mounted.current = true;
    fetchLatest();                                  // primera carga
    timer.current = setInterval(fetchLatest, pollMs); // auto cada pollMs
    return () => {
      mounted.current = false;
      controller.current?.abort();
      clearInterval(timer.current);
    };
  }, [fetchLatest, pollMs]);

  const reload = useCallback(() => fetchLatest(), [fetchLatest]);

  return { data, loading, reload, lastFetch };
}
