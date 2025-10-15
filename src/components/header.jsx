export default function Header({ onRefresh, onOpenSettings }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo" aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M12 2c3.5 3.9 8 8.1 8 12.4A8 8 0 1 1 4 14.4C4 10.1 8.5 5.9 12 2Z" fill="currentColor"/>
          </svg>
        </span>
        <div>
          <div className="title">HighDrop – Hidroponía Inteligente</div>
          <div className="subtitle">Monitoreo en tiempo real de torre vertical</div>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn--ghost" onClick={onOpenSettings}>Ajustes</button>
        <button className="btn btn--primary" onClick={onRefresh}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M17.7 6.3A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.76-4.24L14 10h6V4l-2.3 2.3Z" fill="currentColor"/>
          </svg>
          <span style={{ marginLeft: 6 }}>Actualizar</span>
        </button>
      </div>
    </header>
  );
}
