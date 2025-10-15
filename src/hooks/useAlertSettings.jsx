// src/hooks/useAlertSettings.jsx
import { useCallback, useEffect, useState } from "react";
import { getAlertSettings, updateAlertSettings } from "../api/alerts";

export const PRESETS = {
  lechuga:    { temperature:{min:20,max:26,enabled:true}, humidity:{min:55,max:70,enabled:true}, ph:{min:5.5,max:6.2,enabled:true} },
  aromaticas: { temperature:{min:22,max:28,enabled:true}, humidity:{min:50,max:65,enabled:true}, ph:{min:5.8,max:6.5,enabled:true} },
};

export default function useAlertSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAlertSettings();
      setSettings(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Escuchar cambios guardados en otras partes de la app
    const onUpd = (e) => setSettings(e.detail);
    window.addEventListener("alerts:updated", onUpd);
    return () => window.removeEventListener("alerts:updated", onUpd);
  }, [refresh]);

  const save = useCallback(async (partial) => {
    const next = { ...(settings ?? {}), ...partial };
    const saved = await updateAlertSettings(next);
    setSettings(saved);
    return saved;
  }, [settings]);

  const applyPreset = useCallback((key) => {
    const p = PRESETS[key];
    if (!p) return;
    setSettings((cur) => ({
      preset: key,
      temperature: { ...(cur?.temperature ?? {}), ...p.temperature },
      humidity:    { ...(cur?.humidity ?? {}),    ...p.humidity },
      ph:          { ...(cur?.ph ?? {}),          ...p.ph },
    }));
  }, []);

  return { settings, loading, refresh, save, applyPreset, setSettings };
}
    