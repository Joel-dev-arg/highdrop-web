import { useEffect, useState } from "react";
import { getTowerStatus } from "../api/status";

export default function useTowerStatus(refreshMs = 60000) { // 1 min
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await getTowerStatus();
    setData(res);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  return { data, loading, reload: load };
}
