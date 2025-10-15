/*import { setSimulatedStatus, clearSimulatedStatus } from "../api/status";

export default function DebugBar({ onReload }) {
  if (import.meta.env.PROD) return null;                 // ocultar en prod
  const hasDebug = new URLSearchParams(location.search).get("debug") === "1";
  if (!hasDebug) return null;                            // mostrar solo con ?debug=1

  const btn = (label, onClick) => (
    <button className="btn btn--ghost" onClick={onClick} style={{ fontSize: 12 }}>
      {label}
    </button>
  );

  return (
    <div style={{
      position: "fixed", bottom: 12, right: 12, zIndex: 60,
      display: "flex", gap: 8, padding: 8, borderRadius: 12,
      background: "rgba(255,255,255,.9)", border: "1px solid rgba(0,0,0,.08)",
      boxShadow: "0 8px 16px rgba(0,0,0,.08)"
    }}>
      {btn("Temp alta (29°C)", () => { setSimulatedStatus({ temperatura: { value: 29 } }); onReload?.(); })}
      {btn("Humedad baja (48%)", () => { setSimulatedStatus({ humedad: { value: 48 } }); onReload?.(); })}
      {btn("pH alto (6.6)", () => { setSimulatedStatus({ nutrientes: { ph: 6.6 } }); onReload?.(); })}
      {btn("Reset", () => { clearSimulatedStatus(); onReload?.(); })}
    </div>
  );
}
*/