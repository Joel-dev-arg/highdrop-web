import { useEffect, useState, useMemo } from "react";
import { getHumidityHistoryRaw } from "../api/status";

// downsample por paso en minutos
function downsample(items, stepMin) {
  if (stepMin <= 1) return items;
  const out = [];
  let acc = [];
  let prevBucket = null;
  for (const it of items) {
    const bucket = Math.floor(it.ts.getTime() / (stepMin * 60 * 1000));
    if (prevBucket === null) prevBucket = bucket;
    if (bucket !== prevBucket) {
      const avg = Math.round(acc.reduce((s, x) => s + x.humidity, 0) / acc.length);
      out.push({ ts: acc[acc.length - 1].ts, humidity: avg });
      acc = [];
      prevBucket = bucket;
    }
    acc.push(it);
  }
  if (acc.length) {
    const avg = Math.round(acc.reduce((s, x) => s + x.humidity, 0) / acc.length);
    out.push({ ts: acc[acc.length - 1].ts, humidity: avg });
  }
  return out;
}

export default function useHumidityHistory({ range = "24h", step = 5 } = {}) {
  // range: "1h" | "6h" | "24h" | "7d"
  const minutes = useMemo(() => {
    return range === "1h" ? 60 :
           range === "6h" ? 360 :
           range === "24h" ? 1440 :        // 24h
           10080;                           // 7d
  }, [range]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const raw = await getHumidityHistoryRaw({ minutes });
    const ds = downsample(raw, step);
    setData(ds);
    setLoading(false);
  }

  useEffect(() => { load(); }, [minutes, step]);

  return { data, loading, reload: load };
}
