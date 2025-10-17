// src/hooks/useHumidityHistory.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getHumidityHistoryRaw } from "../api/status";

/** Downsample promedio por “stepMin” minutos */
function downsample(items, stepMin) {
  if (stepMin <= 1) return items;
  const out = [];
  let acc = [];
  let prevBucket = null;

  for (const it of items) {
    const ts = it.ts instanceof Date ? it.ts : new Date(it.ts);
    const humidity = Number(it.humidity);
    const bucket = Math.floor(ts.getTime() / (stepMin * 60 * 1000));

    if (prevBucket === null) prevBucket = bucket;
    if (bucket !== prevBucket) {
      const avg = Math.round(acc.reduce((s, x) => s + x.humidity, 0) / acc.length);
      out.push({ ts: acc[acc.length - 1].ts, humidity: avg });
      acc = [];
      prevBucket = bucket;
    }
    acc.push({ ts, humidity });
  }

  if (acc.length) {
    const avg = Math.round(acc.reduce((s, x) => s + x.humidity, 0) / acc.length);
    out.push({ ts: acc[acc.length - 1].ts, humidity: avg });
  }
  return out;
}

/**
 * @param {{ range?: "1h"|"6h"|"24h"|"7d", step?: number, cultivoId?: number }} params
 */
export default function useHumidityHistory({ range = "24h", step = 5, cultivoId = 1 } = {}) {
  // rango en minutos
  const minutes = useMemo(() => {
    return range === "1h" ? 60 :
           range === "6h" ? 360 :
           range === "24h" ? 1440 : 10080; // 7d
  }, [range]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Nota: si tu API actual no acepta cultivoId, lo ignorará sin romper.
      const raw = await getHumidityHistoryRaw({ minutes, cultivoId });
      const normalized = (raw || []).map(it => ({
        ts: it.ts instanceof Date ? it.ts : new Date(it.ts),
        humidity: Number(it.humidity),
      })).filter(it => Number.isFinite(it.humidity) && it.ts instanceof Date && !isNaN(it.ts));
      const ds = downsample(normalized, step);
      if (mounted.current) setData(ds);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [minutes, step, cultivoId]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  return { data, loading, reload: load };
}
