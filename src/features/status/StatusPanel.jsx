import { useEffect, useState, useMemo } from "react";
import useTowerStatus from "../../hooks/useTowerStatus";
import useHumidityHistory from "../../hooks/useHumidityHistory";
import useTemperatureHistory from "../../hooks/useTemperatureHistory";
import useAlertSettings from "../../hooks/useAlertSettings";
import MiniSparkline from "../../components/MiniSparkline";

import Progress from "../../components/Progress";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import HumidityHistory from "./HumidityHistory";
import TemperatureHistory from "./TemperatureHistory";
import NutrientsHistory from "./NutrientsHistory";
import StarsRain from "../../components/StarsRain";
import { DropIcon, ThermoIcon, BeakerIcon, LeafIcon, TankIcon } from "../../components/Icons";

// estado → color
const toneForEstado = (estado) => {
  if (["Óptimo", "Estable", "Balanceado", "Suficiente"].includes(estado)) return "ok";
  if (["Alta", "Alto"].includes(estado)) return "warn";
  if (["Baja", "Bajo"].includes(estado)) return "danger";
  return "info";
};

// helpers de tiempo
const formatWeeksDays = (dias) => {
  const n = Number(dias);
  if (!Number.isFinite(n) || n < 0) return "0 días";
  const s = Math.floor(n / 7);
  const r = n % 7;
  let t = "";
  if (s > 0) t += s === 1 ? "1 semana" : `${s} semanas`;
  if (r > 0) t += (t ? " y " : "") + (r === 1 ? "1 día" : `${r} días`);
  if (!t) t = "0 días";
  return t;
};
const diffDaysFromDate = (dateLike) => {
  if (!dateLike) return NaN;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return NaN;
  const ONE = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / ONE));
};

export default function StatusPanel({ onReady }) {
  // ======= HOOKS (siempre arriba y sin condiciones) =======
  const { data, loading, reload } = useTowerStatus(60000);

  const { data: humHist } = useHumidityHistory({ range: "24h", step: 15 });
  const { data: tmpHist } = useTemperatureHistory({ range: "24h", step: 15 });
  const humPoints = humHist?.slice(-24).map(d => d.humidity ?? d?.humidity) ?? [];
  const tmpPoints = tmpHist?.slice(-24).map(d => d.temperature ?? d?.temperature) ?? [];

  const [openHumHistory, setOpenHumHistory] = useState(false);
  const [openTempHistory, setOpenTempHistory] = useState(false);
  const [openNutrHistory, setOpenNutrHistory] = useState(false);
  const [rainId, setRainId] = useState(0);

  useEffect(() => { onReady?.({ reload }); }, [onReady, reload]);
  useEffect(() => { if (!loading && data) setRainId(v => v + 1); }, [loading, data]);

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

  // ====== Crecimiento: calcular SIEMPRE (aunque data sea undefined) ======
  const diasSrv   = Number(data?.crecimiento?.dias);
  const tiempoSrv = data?.crecimiento?.tiempo;
  const fechaPlant =
    data?.crecimiento?.fecha ??
    data?.crecimiento?.fecha_plantacion ??
    data?.crecimiento?.fechaPlantacion ??
    null;

  const diasClient = useMemo(() => {
    if (Number.isFinite(diasSrv) && diasSrv > 0) return diasSrv;
    return diffDaysFromDate(fechaPlant);
  }, [diasSrv, fechaPlant]);

  const crecDias   = Number.isFinite(diasClient) && diasClient >= 0
    ? diasClient
    : (Number.isFinite(diasSrv) ? diasSrv : 0);

  const crecTiempo = (tiempoSrv && tiempoSrv !== "0 días")
    ? tiempoSrv
    : formatWeeksDays(crecDias);

  // ======= A PARTIR DE ACÁ PODEMOS HACER RETURNS =======
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

  // ====== Alertas ======
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

  return (
    <>
      <div className="panel-meta">
  <div className="meta-title">Panel de Estado</div>
  <div
    className="meta-tags"
    style={{ display: "flex", alignItems: "center", gap: 8 }}
  >
    {data.conexionOk ? (
      <>
        <Badge tone="ok">Conexión OK</Badge>
        <span className="muted">•</span>
        <span className="muted">Actualizado {data.actualizadoHace}</span>
      </>
    ) : (
      <>
        <Badge tone="danger">Sin conexión</Badge>
        <span className="muted">
          {data.errorMsg ?? "No se encuentra conectado el Arduino"}
        </span>
        <span className="muted">•</span>
        <span className="muted">Últimos datos: {data.actualizadoHace}</span>
      </>
    )}
  </div>
</div>


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
            <Badge tone={toneForEstado(data.humedad.estado)}>{data.humedad.estado}</Badge>
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
            <Badge tone={toneForEstado(data.temperatura.estado)}>{data.temperatura.estado}</Badge>
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

        {/* NUTRIENTES */}
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
            <Badge tone={toneForEstado(data.nutrientes.estado)}>{data.nutrientes.estado}</Badge>
          </div>
          <div className="stat-body">
            <div className="stat-value">pH {data.nutrientes.ph}</div>
            <div className="stat-helper">Ideal {ranges.ph.min}–{ranges.ph.max}</div>
          </div>
        </button>

        {/* CRECIMIENTO */}
        <button className="card card--notch">
          <div className="stat-head">
            <div className="stat-title">
              <span className="icon"><LeafIcon /></span>
              <span>Crecimiento</span>
            </div>
            <Badge tone="ok">{data.crecimiento.etapa}</Badge>
          </div>
          <div className="stat-body">
            <div className="stat-value">{crecTiempo}</div>
            <div className="stat-helper">
              {crecDias === 1 ? "1 día" : `${crecDias} días`} desde plantación
              {fechaPlant ? <> • <span className="muted">{new Date(fechaPlant).toLocaleString()}</span></> : null}
            </div>
          </div>
        </button>

        {/* NIVEL DE AGUA (2 columnas) */}
        <button className="card card--notch" style={{ gridColumn: "span 2" }}>
          <div className="stat-head">
            <div className="stat-title">
              <span className="icon"><TankIcon /></span>
              <span>Nivel de agua</span>
            </div>
            <Badge tone={toneForEstado(data.agua.estado)}>{data.agua.estado}</Badge>
          </div>
          <div className="stat-body">
            <div className="stat-value">{data.agua.porcentaje}%</div>
            <div className="stat-helper">Próximo relleno: {data.agua.proximo}</div>
            <Progress value={data.agua.porcentaje} />
          </div>
        </button>
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

      <StarsRain key={rainId} count={110} duration={2000} />
    </>
  );
}
