import { useEffect, useMemo, useState } from "react";
import { getTemperatureHistoryRaw } from "../api/status";

// Agrupa puntos por "stepMin" y promedia
function downsample(items, stepMin) {
  if (stepMin <= 1) return items;
  const out = [];
  let acc = [];
  let prevBucket = null;

  for (const it of items) {
    const bucket = Math.floor(it.ts.getTime() / (stepMin * 60 * 1000));
    if (prevBucket === null) prevBucket = bucket;
    if (bucket !== prevBucket) {
      const avg =
        Math.round((acc.reduce((s, x) => s + x.temperature, 0) / acc.length) * 10) / 10;
      out.push({ ts: acc[acc.length - 1].ts, temperature: avg });
      acc = [];
      prevBucket = bucket;
    }
    acc.push(it);
  }
  if (acc.length) {
    const avg =
      Math.round((acc.reduce((s, x) => s + x.temperature, 0) / acc.length) * 10) / 10;
    out.push({ ts: acc[acc.length - 1].ts, temperature: avg });
  }
  return out;
}

export default function useTemperatureHistory({ range = "24h", step = 5 } = {}) {
  // range: "1h" | "6h" | "24h" | "7d"
  const minutes = useMemo(() => {
    return range === "1h" ? 60 :
           range === "6h" ? 360 :
           range === "24h" ? 1440 : 10080; // 7d
  }, [range]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const raw = await getTemperatureHistoryRaw({ minutes });
    const ds = downsample(raw, step);
    setData(ds);
    setLoading(false);
  }

  useEffect(() => { load(); }, [minutes, step]);

  return { data, loading, reload: load };
}
