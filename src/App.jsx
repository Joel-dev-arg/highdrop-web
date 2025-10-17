// App.jsx
import { useRef, useState } from "react";
import Header from "./components/header.jsx";
import Modal from "./components/Modal.jsx";
import AlertSettings from "./features/settings/AlertSettings.jsx";
import TowerView from "./features/tower/TowerView.jsx";
import StatusPanel from "./features/status/StatusPanel.jsx";

// 👉 nuevos
import CultivosPanel from "./features/cultivos/CultivosPanel.jsx";
import CultivoInfoCard from "./features/cultivos/CultivoInfoCard.jsx";

export default function App() {
  const statusApiRef = useRef({ reload: () => {} });
  const [openSettings, setOpenSettings] = useState(false);

  // id del cultivo seleccionado
  const [selectedCultivoId, setSelectedCultivoId] = useState(null);

  return (
    <div className="page">
      <Header
        onRefresh={() => statusApiRef.current.reload()}
        onOpenSettings={() => setOpenSettings(true)}
      />

      <main className="layout layout--3cols">{/* ← ver CSS abajo */}
        {/* IZQUIERDA: ABM */}
        <section className="panel-left">
          <CultivosPanel
            selectedId={selectedCultivoId}
            onSelect={setSelectedCultivoId}
          />
        </section>

        {/* CENTRO: TORRE */}
        <section className="panel-center">
          <div className="media-card">
            <TowerView selectedCultivoId={selectedCultivoId} />
          </div>
        </section>

        {/* DERECHA: Ficha + KPIs */}
        <aside className="panel-right">
          <CultivoInfoCard cultivoId={selectedCultivoId} />
          <StatusPanel
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
