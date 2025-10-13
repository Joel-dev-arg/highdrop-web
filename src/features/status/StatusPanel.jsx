import { useEffect, useState } from "react";
import useTowerStatus from "../../hooks/useTowerStatus";
import StatCard from "../../components/StatCard";
import Progress from "../../components/Progress";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import HumidityHistory from "./HumidityHistory";
import TemperatureHistory from "./TemperatureHistory"; // ⬅️ nuevo
import { DropIcon, ThermoIcon, BeakerIcon, LeafIcon, TankIcon } from "../../components/Icons";

export default function StatusPanel({ onReady }) {
  const { data, loading, reload } = useTowerStatus(60000);
  const [openHumHistory, setOpenHumHistory] = useState(false);
  const [openTempHistory, setOpenTempHistory] = useState(false); // ⬅️ nuevo

  useEffect(() => { onReady?.({ reload }); }, [onReady, reload]);

  if (loading || !data) {
    return (
      <>
        <div className="panel-meta">
          <div className="meta-title">Panel de Estado</div>
          <div className="meta-tags"><Badge tone="info">Cargando…</Badge></div>
        </div>
        <div className="grid"><div className="card">Obteniendo datos…</div></div>
      </>
    );
  }

  return (
    <>
      <div className="panel-meta">
        <div className="meta-title">Panel de Estado</div>
        <div className="meta-tags">
          <Badge tone={data.conexionOk ? "ok" : "warn"}>
            {data.conexionOk ? "Conexión OK" : "Sin conexión"}
          </Badge>
          <span className="muted">•</span>
          <span className="muted">Actualizado {data.actualizadoHace}</span>
        </div>
      </div>

      <div className="grid">
        {/* HUMEDAD (abre modal) */}
        <button className="card clickable" onClick={() => setOpenHumHistory(true)}>
          <div className="stat-head">
            <div className="stat-title">
              <span className="icon"><DropIcon /></span>
              <span>Humedad</span>
            </div>
            <Badge tone="ok">{data.humedad.estado}</Badge>
          </div>
          <div className="stat-body">
            <div className="stat-value">{data.humedad.value}%</div>
            <div className="stat-helper">Rango ideal {data.humedad.rango}</div>
          </div>
        </button>

        {/* TEMPERATURA (abre modal) */}
        <button className="card clickable" onClick={() => setOpenTempHistory(true)}>
          <div className="stat-head">
            <div className="stat-title">
              <span className="icon"><ThermoIcon /></span>
              <span>Temperatura</span>
            </div>
            <Badge tone="ok">{data.temperatura.estado}</Badge>
          </div>
          <div className="stat-body">
            <div className="stat-value">{data.temperatura.value}°C</div>
            <div className="stat-helper">Rango ideal {data.temperatura.rango}</div>
          </div>
        </button>

        {/* el resto igual */}
        <StatCard
          icon={<BeakerIcon />}
          title="Nutrientes"
          value={`${data.nutrientes.ph} pH`}
          helper={`pH ${data.nutrientes.ph} • Recomendado ${data.nutrientes.recomendado}`}
          badge={data.nutrientes.estado}
          tone="info"
        />
        <StatCard
          icon={<LeafIcon />}
          title="Crecimiento"
          badge={data.crecimiento.etapa}
          tone="ok"
        >
          <ul className="list">
            <li>{data.crecimiento.semana}</li>
            <li>{data.crecimiento.progreso}% desarrollado</li>
          </ul>
        </StatCard>
        <StatCard icon={<TankIcon />} title="Nivel de agua" badge={data.agua.estado} tone="ok" full>
          <Progress value={data.agua.porcentaje} />
          <div className="stat-helper">
            Depósito al {data.agua.porcentaje}% • Próximo relleno estimado: {data.agua.proximo}
          </div>
        </StatCard>
      </div>

      {/* Modales */}
      <Modal open={openHumHistory} onClose={() => setOpenHumHistory(false)} title="Historial de Humedad">
        <HumidityHistory />
      </Modal>

      <Modal open={openTempHistory} onClose={() => setOpenTempHistory(false)} title="Historial de Temperatura">
        <TemperatureHistory />
      </Modal>
    </>
  );
}
