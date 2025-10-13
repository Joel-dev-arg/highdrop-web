import { useRef } from "react";
import Header from "./components/Header.jsx";
import TowerView from "./features/tower/TowerView.jsx";
import StatusPanel from "./features/status/StatusPanel.jsx";

export default function App() {
  const statusApiRef = useRef({ reload: () => {} });

  return (
    <div className="page">
      <Header onRefresh={() => statusApiRef.current.reload()} />
      <main className="layout">
        <section className="panel-left">
          <TowerView />
        </section>
        <aside className="panel-right">
          <StatusPanel onReady={(api) => (statusApiRef.current = api)} />
        </aside>
      </main>
    </div>
  );
}
