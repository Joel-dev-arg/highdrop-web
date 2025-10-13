import { useState } from "react";
import useHumidityHistory from "../../hooks/useHumidityHistory";

export default function HumidityHistory() {
  const [range, setRange] = useState("24h");
  const [step, setStep] = useState(5); // minutos: 1, 5, 15
  const { data, loading, reload } = useHumidityHistory({ range, step });

  return (
    <div>
      <div className="toolbar">
        <div className="btn-group">
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="1h">Última 1 h</option>
            <option value="6h">Últimas 6 h</option>
            <option value="24h">Últimas 24 h</option>
            <option value="7d">Últimos 7 días</option>
          </select>
          <select value={step} onChange={(e) => setStep(Number(e.target.value))}>
            <option value={1}>Cada 1 min</option>
            <option value={5}>Cada 5 min</option>
            <option value={15}>Cada 15 min</option>
          </select>
          <button className="btn btn--ghost" onClick={reload}>Aplicar</button>
        </div>
        <div className="muted">
          {/* ejemplo de leyenda */}
          Lecturas {step}m • Rango ideal 55–70%
        </div>
      </div>

      <div className="table card">
        <div className="table-head">
          <div>Fecha y hora</div>
          <div>Humedad</div>
        </div>
        <div className="table-body">
          {loading ? (
            <div className="muted" style={{ padding: "8px 0" }}>Cargando…</div>
          ) : (
            data.slice(-200).reverse().map((row, i) => (
              <div className="table-row" key={i}>
                <div>{row.ts.toISOString().slice(0,16).replace("T"," ")}</div>
                <div>{row.humidity}%</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
