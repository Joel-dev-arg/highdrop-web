import useAlertSettings, { PRESETS } from "../../hooks/useAlertSettings";

export default function AlertSettings({ onClose, onSaved }){
  const { settings, setSettings, loading, save, applyPreset } = useAlertSettings();
  if (loading || !settings) return <div>Cargando…</div>;

  const setRange = (key, field, val) =>
    setSettings({ ...settings, [key]: { ...settings[key], [field]: val } });

  const toggle = (key) =>
    setSettings({ ...settings, [key]: { ...settings[key], enabled: !settings[key].enabled } });

  const submit = async (e) => {
    e.preventDefault();
    const s = await save(settings);
    onSaved?.(s);
    onClose?.();
  };

  return (
    <form onSubmit={submit} className="settings">
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <div className="btn-group">
          <button type="button" className="btn btn--ghost" onClick={() => applyPreset("lechuga")}>Preset: Lechuga</button>
          <button type="button" className="btn btn--ghost" onClick={() => applyPreset("aromaticas")}>Preset: Aromáticas</button>
        </div>
        <div className="muted">Definí mínimos y máximos. Las alertas se activan fuera del rango.</div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { key:"temperature", label:"Temperatura (°C)" },
          { key:"humidity",    label:"Humedad (%)"    },
          { key:"ph",          label:"pH"            },
        ].map(({key,label}) => (
          <div className="card" key={key}>
            <div className="stat-head">
              <div className="stat-title"><span>{label}</span></div>
              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                <input type="checkbox" checked={settings[key].enabled} onChange={() => toggle(key)} />
                Activar
              </label>
            </div>
            <div className="stat-body" style={{ gap:10 }}>
              <div className="range-row">
                <label className="muted">Mín</label>
                <input type="number" step={key==="ph" ? "0.1" : "1"} value={settings[key].min}
                       onChange={(e)=> setRange(key,"min", Number(e.target.value))} />
              </div>
              <div className="range-row">
                <label className="muted">Máx</label>
                <input type="number" step={key==="ph" ? "0.1" : "1"} value={settings[key].max}
                       onChange={(e)=> setRange(key,"max", Number(e.target.value))} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12, gap:8 }}>
        <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn--primary">Guardar</button>
      </div>
    </form>
  );
}
