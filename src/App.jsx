import { useRef, useState } from "react";
import Header from "./components/header.jsx";                 // ⬅️ corregido casing
import Modal from "./components/Modal.jsx";
import AlertSettings from "./features/settings/AlertSettings.jsx";
import TowerView from "./features/tower/TowerView.jsx";
import StatusPanel from "./features/status/StatusPanel.jsx";

export default function App() {
  const statusApiRef = useRef({ reload: () => {} });
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <div className="page">
      <Header
        onRefresh={() => statusApiRef.current.reload()}
        onOpenSettings={() => setOpenSettings(true)}
      />

      <main className="layout">
        <section className="panel-left">
          <TowerView />
        </section>

        <aside className="panel-right">
          <StatusPanel onReady={(api) => (statusApiRef.current = api)} />
        </aside>
      </main>

      {/* Modal de Ajustes de Alertas */}
      <Modal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        title="Ajustes de Alertas"
      >
        <AlertSettings
          onClose={() => setOpenSettings(false)}
          onSaved={() => statusApiRef.current.reload()} // recarga panel al guardar
        />
      </Modal>
    </div>
  );
}
