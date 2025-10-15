import { useState, useMemo } from "react";
import useNutrientsHistory from "../../hooks/useNutrientsHistory";

function phState(ph) {
  // Ideal 5.5–6.2
  if (ph >= 5.5 && ph <= 6.2) return { label: "Óptimo", tone: "ok" };
  if (ph < 5.5) return { label: "Bajo", tone: "warn" };
  return { label: "Alto", tone: "warn" };
}

export default function NutrientsHistory() {
  const [range, setRange] = useState("24h");
  const [step, setStep] = useState(5);
  const { data, loading, reload } = useNutrientsHistory({ range, step });

  const last = useMemo(() => data[data.length - 1], [data]);
  const status = last ? phState(last.ph) : { label: "—", tone: "info" };

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
        <div className="muted">pH ideal 5.5–6.2</div>
      </div>

      <div className="table card">
        <div className="table-head" style={{ gridTemplateColumns: "1fr 100px" }}>
          <div>Fecha y hora</div>
          <div>pH</div>
        </div>
        <div className="table-body">
          {loading ? (
            <div className="muted" style={{ padding: "8px 0" }}>Cargando…</div>
          ) : (
            data.slice(-200).reverse().map((row, i) => (
              <div className="table-row" key={i} style={{ gridTemplateColumns: "1fr 100px" }}>
                <div>{row.ts.toISOString().slice(0,16).replace("T"," ")}</div>
                <div>{row.ph.toFixed(1)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <div className="stat-head">
          <div className="stat-title"><span>Nivel actual</span></div>
          <span className={`badge badge--${status.tone}`}>{status.label}</span>
        </div>
        <div className="stat-body">
          <div className="stat-helper">
            Último pH: {last ? last.ph.toFixed(1) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
