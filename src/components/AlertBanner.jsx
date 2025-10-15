export default function AlertBanner({ alerts=[], onOpenSettings }){
  if (!alerts.length) return null;
  return (
    <div className="alert-banner" role="status" aria-live="polite">
      <div className="alert-dot" />
      <div className="alert-text">
        {alerts.slice(0,3).map((a,i)=> <span key={i} className="alert-item">• {a.msg}</span>)}
        {alerts.length > 3 && <span> +{alerts.length-3} más</span>}
      </div>
      <button className="btn btn--ghost btn--sm" onClick={onOpenSettings}>Ajustar alertas</button>
    </div>
  );
}
