// App.jsx
import { useEffect, useRef, useState } from "react";
import Header from "./components/header.jsx";
import Modal from "./components/Modal.jsx";
import AlertSettings from "./features/settings/AlertSettings.jsx";
import TowerView from "./features/tower/TowerView.jsx";
import StatusPanel from "./features/status/StatusPanel.jsx";
import CultivosPanel from "./features/cultivos/CultivosPanel.jsx";

// 👇 nuevo: API para sincronizar cultivo activo con el backend
import { setActiveCultivo, getActiveCultivo } from "./api/hardware";

export default function App() {
  const statusApiRef = useRef({ reload: () => {} });
  const [openSettings, setOpenSettings] = useState(false);

  // null = hasta que leamos el activo del backend o el usuario elija uno
  const [selectedCultivoId, setSelectedCultivoId] = useState(null);

  // 1) Al montar, leer el cultivo activo del backend para inicializar
  useEffect(() => {
    (async () => {
      try {
        const { id } = await getActiveCultivo();
        if (id && Number.isInteger(id)) setSelectedCultivoId(id);
      } catch (e) {
        console.warn("[App] No se pudo leer active-cultivo:", e?.message || e);
      }
    })();
  }, []);

  // 2) Cada vez que cambia el seleccionado, avisar al backend
  useEffect(() => {
    if (!selectedCultivoId) return;
    setActiveCultivo(selectedCultivoId)
      .then(() => {
        // refrescar panel de estado para que pegue al /:id/detalles/latest correcto
        statusApiRef.current.reload?.();
      })
      .catch((e) => console.warn("[App] setActiveCultivo falló:", e?.message || e));
  }, [selectedCultivoId]);

  return (
    <div className="page">
      <Header
        onRefresh={() => statusApiRef.current.reload()}
        onOpenSettings={() => setOpenSettings(true)}
      />

      <main className="layout layout--3cols">
        {/* IZQUIERDA: lista/ABM de cultivos */}
        <section className="panel-left">
          <CultivosPanel
            selectedId={selectedCultivoId}
            onSelect={setSelectedCultivoId}
          />
        </section>

        {/* CENTRO: torre */}
        <section className="panel-center">
          <div className="media-card">
            <TowerView selectedCultivoId={selectedCultivoId} />
          </div>
        </section>

        {/* DERECHA: KPIs */}
        <aside className="panel-right">
          <StatusPanel
            key={selectedCultivoId ?? "none"}   // fuerza remount al cambiar de cultivo
            selectedCultivoId={selectedCultivoId}
            onReady={(api) => (statusApiRef.current = api)}
          />
        </aside>
      </main>

      <Modal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        title="Ajustes de Alertas"
      >
        <AlertSettings
          onClose={() => setOpenSettings(false)}
          onSaved={() => statusApiRef.current.reload()}
        />
      </Modal>
    </div>
  );
}
