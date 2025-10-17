// src/features/cultivos/CultivoInfoCard.jsx
import { useEffect, useState } from "react";
import { getCultivo } from "../../api/cultivos";

export default function CultivoInfoCard({ cultivoId }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!cultivoId) { setData(null); return; }
    (async () => {
      try { setData(await getCultivo(cultivoId)); setErr(""); }
      catch (e) { setErr(e.message); }
    })();
  }, [cultivoId]);

  if (!cultivoId) return (
    <div className="card">
      <div className="meta-title">Cultivo</div>
      <div className="muted">Seleccioná un cultivo de la izquierda para ver su información.</div>
    </div>
  );

  if (err) return <div className="card">Error: {err}</div>;
  if (!data) return <div className="card">Cargando…</div>;

  const dias = data.fecha_plantacion ? Math.floor((Date.now() - new Date(data.fecha_plantacion)) / 86400000) : null;

  return (
    <div className="card card--notch">
      <div className="stat-head">
        <div className="stat-title"><div className="icon">🌱</div> Información del cultivo</div>
        <span className="badge badge--success">{data.tipo}</span>
      </div>
      <div className="stat-body">
        <div><b>Nombre:</b> {data.nombre}</div>
        <div><b>Plantado:</b> {data.fecha_plantacion ? new Date(data.fecha_plantacion).toLocaleString() : "—"} {dias!=null && <span className="muted">({dias} días)</span>}</div>
        <ul className="list">
          <li>Id: {data.id_cultivo}</li>
        </ul>
      </div>
    </div>
  );
}
