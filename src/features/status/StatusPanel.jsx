import { useEffect, useState } from "react";
import useTowerStatus from "../../hooks/useTowerStatus";
import useHumidityHistory from "../../hooks/useHumidityHistory";
import useTemperatureHistory from "../../hooks/useTemperatureHistory";
import useAlertSettings from "../../hooks/useAlertSettings"; // ⬅️ NUEVO
import MiniSparkline from "../../components/MiniSparkline";

import StatCard from "../../components/StatCard";
import Progress from "../../components/Progress";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import HumidityHistory from "./HumidityHistory";
import TemperatureHistory from "./TemperatureHistory";
import NutrientsHistory from "./NutrientsHistory";
import StarsRain from "../../components/StarsRain";
import { DropIcon, ThermoIcon, BeakerIcon, LeafIcon, TankIcon } from "../../components/Icons";

export default function StatusPanel({ onReady }) {
  const { data, loading, reload } = useTowerStatus(60000);

  // Historial para sparklines (24h muestreado cada 15m → 96 pts máx)
  const { data: humHist } = useHumidityHistory?.({ range: "24h", step: 15 }) ?? { data: [] };
  const { data: tmpHist } = useTemperatureHistory?.({ range: "24h", step: 15 }) ?? { data: [] };
  const humPoints = humHist?.slice(-24).map(d => d.humidity ?? d?.humidity) ?? [];
  const tmpPoints = tmpHist?.slice(-24).map(d => d.temperature ?? d?.temperature) ?? [];

  // Modales
  const [openHumHistory, setOpenHumHistory] = useState(false);
  const [openTempHistory, setOpenTempHistory] = useState(false);
  const [openNutrHistory, setOpenNutrHistory] = useState(false);

  // Lluvia de estrellas (solo al cargar/recargar)
  const [rainId, setRainId] = useState(0);

  // Exponer reload al Header
  useEffect(() => { onReady?.({ reload }); }, [onReady, reload]);

  // Dispara lluvia al recibir datos
  useEffect(() => { if (!loading && data) setRainId(v => v + 1); }, [loading, data]);

  // ======== AJUSTES DE ALERTAS (leídos del hook) ========
  const { settings } = useAlertSettings();
  const asNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const ranges = {
    humidity: {
      enabled: settings?.humidity?.enabled ?? true,
      min: asNum(settings?.humidity?.min) ?? 55,
      max: asNum(settings?.humidity?.max) ?? 70,
    },
    temperature: {
      enabled: settings?.temperature?.enabled ?? true,
      min: asNum(settings?.temperature?.min) ?? 20,
      max: asNum(settings?.temperature?.max) ?? 26,
    },
    ph: {
      enabled: settings?.ph?.enabled ?? true,
      min: asNum(settings?.ph?.min) ?? 5.5,
      max: asNum(settings?.ph?.max) ?? 6.2,
    },
  };
  // ======================================================

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

  // ================= EVALUACIÓN DE ALERTAS =================
  const alerts = [];
  const add = (msg) => alerts.push({ msg });

  if (ranges.humidity.enabled) {
    const v = Number(data.humedad?.value);
    if (Number.isFinite(v)) {
      if (v < ranges.humidity.min) add(`Humedad baja (${v}% < ${ranges.humidity.min}%)`);
      else if (v > ranges.humidity.max) add(`Humedad alta (${v}% > ${ranges.humidity.max}%)`);
    }
  }
  if (ranges.temperature.enabled) {
    const v = Number(data.temperatura?.value);
    if (Number.isFinite(v)) {
      if (v < ranges.temperature.min) add(`Temperatura baja (${v}°C < ${ranges.temperature.min}°C)`);
      else if (v > ranges.temperature.max) add(`Temperatura alta (${v}°C > ${ranges.temperature.max}°C)`);
    }
  }
  if (ranges.ph.enabled) {
    const v = Number(data.nutrientes?.ph);
    if (Number.isFinite(v)) {
      if (v < ranges.ph.min) add(`pH bajo (${v} < ${ranges.ph.min})`);
      else if (v > ranges.ph.max) add(`pH alto (${v} > ${ranges.ph.max})`);
    }
  }
  // =========================================================

  return (
    <>
      <div className="panel-meta">
        <div className="meta-title">Panel de Estado</div>
        <div className="meta-tags" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge tone={data.conexionOk ? "ok" : "warn"}>
            {data.conexionOk ? "Conexión OK" : "Sin conexión"}
          </Badge>
          <span className="muted">•</span>
          <span className="muted">Actualizado {data.actualizadoHace}</span>
        </div>
      </div>

      {/* Banner de alertas */}
      {alerts.length > 0 && (
        <div className="alertbar">
          <span className="alertbar-dot" aria-hidden></span>
          <div className="alertbar-text">
            {alerts.map((a, i) => <span className="alertbar-item" key={i}>⚠️ {a.msg}</span>)}
          </div>
        </div>
      )}

      <div className="grid">
        {/* HUMEDAD */}
        <button
          className="card card--notch clickable"
          onClick={() => setOpenHumHistory(true)}
          role="button"
          aria-label="Abrir historial de humedad"
        >
          <div className="stat-head">
            <div className="stat-title">
              <span className="icon"><DropIcon /></span>
              <span>Humedad</span>
            </div>
            <Badge tone="ok">{data.humedad.estado}</Badge>
          </div>
          <div className="stat-body">
            <div className="stat-value">{data.humedad.value}%</div>
            <div className="stat-helper">Ideal {ranges.humidity.min}–{ranges.humidity.max}%</div>
            {humPoints.length > 4 && (
              <div style={{ marginTop: 8 }}>
                <MiniSparkline points={humPoints} />
              </div>
            )}
          </div>
        </button>

        {/* TEMPERATURA */}
        <button
          className="card card--notch clickable"
          onClick={() => setOpenTempHistory(true)}
          role="button"
          aria-label="Abrir historial de temperatura"
        >
          <div className="stat-head">
            <div className="stat-title">
              <span className="icon"><ThermoIcon /></span>
              <span>Temperatura</span>
            </div>
            <Badge tone="ok">{data.temperatura.estado}</Badge>
          </div>
          <div className="stat-body">
            <div className="stat-value">{data.temperatura.value}°C</div>
            <div className="stat-helper">Ideal {ranges.temperature.min}–{ranges.temperature.max}°C</div>
            {tmpPoints.length > 4 && (
              <div style={{ marginTop: 8 }}>
                <MiniSparkline points={tmpPoints} />
              </div>
            )}
          </div>
        </button>

        {/* NUTRIENTES (pH) */}
        <button
          className="card card--notch clickable"
          onClick={() => setOpenNutrHistory(true)}
          role="button"
          aria-label="Abrir historial de pH"
        >
          <div className="stat-head">
            <div className="stat-title">
              <span className="icon"><BeakerIcon /></span>
              <span>Nutrientes</span>
            </div>
            <Badge tone="info">{data.nutrientes.estado}</Badge>
          </div>
          <div className="stat-body">
            <div className="stat-value">pH {data.nutrientes.ph}</div>
            <div className="stat-helper">Ideal {ranges.ph.min}–{ranges.ph.max}</div>
          </div>
        </button>

        {/* CRECIMIENTO */}
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

        {/* NIVEL DE AGUA */}
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

      <Modal open={openNutrHistory} onClose={() => setOpenNutrHistory(false)} title="Historial de pH">
        <NutrientsHistory />
      </Modal>

      {/* 🌠 Lluvia de estrellas solo al cargar/recargar */}
      <StarsRain key={rainId} count={110} duration={2000} />
    </>
  );
}
