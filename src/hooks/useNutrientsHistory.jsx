import { useEffect, useMemo, useState } from "react";
import { getNutrientsHistoryRaw } from "../api/status";

function downsample(items, stepMin) {
  if (stepMin <= 1) return items;
  const out = [];
  let acc = [], prevBucket = null;

  const flush = () => {
    if (!acc.length) return;
    const avgPh = Math.round((acc.reduce((s, x) => s + x.ph, 0) / acc.length) * 10) / 10;
    out.push({ ts: acc[acc.length - 1].ts, ph: avgPh });
    acc = [];
  };

  for (const it of items) {
    const bucket = Math.floor(it.ts.getTime() / (stepMin * 60 * 1000));
    if (prevBucket === null) prevBucket = bucket;
    if (bucket !== prevBucket) { flush(); prevBucket = bucket; }
    acc.push(it);
  }
  flush();
  return out;
}

export default function useNutrientsHistory({ range = "24h", step = 5 } = {}) {
  const minutes = useMemo(() => (
    range === "1h" ? 60 :
    range === "6h" ? 360 :
    range === "24h" ? 1440 : 10080
  ), [range]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const raw = await getNutrientsHistoryRaw({ minutes });
    setData(downsample(raw, step));
    setLoading(false);
  }

  useEffect(() => { load(); }, [minutes, step]);

  return { data, loading, reload: load };
}
