// src/CultivosView.jsx
import { useEffect, useState } from "react";
import StatusPanel from "./views/status/StatusPanel";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CultivosView() {
  const [cultivos, setCultivos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/cultivos`, { headers: { "Cache-Control": "no-cache" } });
        const rows = await res.json();
        if (!alive) return;
        setCultivos(rows || []);
        if (!selectedId && rows?.length) setSelectedId(rows[0].id_cultivo);
      } catch (e) {
        console.error("[CultivosView] error:", e);
        setCultivos([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []); // carga inicial

  return (
    <div className="layout layout--3cols">
      {/* Columna izquierda: lista de cultivos */}
      <aside className="panel-left">
        <div className="card">
          <div className="meta-title" style={{ marginBottom: 8 }}>Cultivos</div>

          {loading && <div className="muted">Cargando cultivos…</div>}
          {!loading && cultivos.length === 0 && (
            <div className="muted">No hay cultivos creados.</div>
          )}

          <div className="cultivos-list" style={{ marginTop: 8 }}>
            {cultivos.map((c) => (
              <button
                key={c.id_cultivo}
                className={`cultivo-item ${selectedId === c.id_cultivo ? "cultivo-item--active" : ""}`}
                onClick={() => setSelectedId(c.id_cultivo)}
              >
                <div className="cultivo-item__left">
                  <span className="cultivo-dot" />
                  <strong>{c.nombre}</strong>
                </div>
                <span className="muted">{c.tipo}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Centro (opcional, imagen/lo que tengas) */}
      <section className="panel-center">{/* opcional */}</section>

      {/* Derecha: StatusPanel del cultivo seleccionado */}
      <main className="panel-right">
        {selectedId ? (
          <StatusPanel cultivoId={selectedId} />
        ) : (
          <div className="card">Elegí un cultivo para ver su estado.</div>
        )}
      </main>
    </div>
  );
}
