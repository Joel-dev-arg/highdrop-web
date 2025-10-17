export default function Progress({ value = 0, label }) {
  const n = Number(String(value).replace('%', ''));
  const width = Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

  return (
    <div className="progress" role="meter" aria-valuenow={width} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar" style={{ width: `${width}%` }} />
      {label && <div className="progress-label">{label}</div>}
    </div>
  );
}
