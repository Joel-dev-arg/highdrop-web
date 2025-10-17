// src/hooks/useTemperatureHistory.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getTemperatureHistoryRaw } from "../api/status";

/** Downsample promedio por “stepMin” minutos (una cifra decimal) */
function downsample(items, stepMin) {
  if (stepMin <= 1) return items;
  const out = [];
  let acc = [];
  let prevBucket = null;

  for (const it of items) {
    const ts = it.ts instanceof Date ? it.ts : new Date(it.ts);
    const temperature = Number(it.temperature);
    const bucket = Math.floor(ts.getTime() / (stepMin * 60 * 1000));

    if (prevBucket === null) prevBucket = bucket;
    if (bucket !== prevBucket) {
      const avg = Math.round((acc.reduce((s, x) => s + x.temperature, 0) / acc.length) * 10) / 10;
      out.push({ ts: acc[acc.length - 1].ts, temperature: avg });
      acc = [];
      prevBucket = bucket;
    }
    acc.push({ ts, temperature });
  }

  if (acc.length) {
    const avg = Math.round((acc.reduce((s, x) => s + x.temperature, 0) / acc.length) * 10) / 10;
    out.push({ ts: acc[acc.length - 1].ts, temperature: avg });
  }
  return out;
}

/**
 * @param {{ range?: "1h"|"6h"|"24h"|"7d", step?: number, cultivoId?: number }} params
 */
export default function useTemperatureHistory({ range = "24h", step = 5, cultivoId = 1 } = {}) {
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
      // Si la API no usa cultivoId aún, lo ignora.
      const raw = await getTemperatureHistoryRaw({ minutes, cultivoId });
      const normalized = (raw || []).map(it => ({
        ts: it.ts instanceof Date ? it.ts : new Date(it.ts),
        temperature: Number(it.temperature),
      })).filter(it => Number.isFinite(it.temperature) && it.ts instanceof Date && !isNaN(it.ts));
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
