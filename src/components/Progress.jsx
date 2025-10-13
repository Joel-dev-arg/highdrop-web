export default function Progress({ value = 0, label }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="progress">
      <div className="progress-bar" style={{ width: `${width}%` }} />
      {label && <div className="progress-label">{label}</div>}
    </div>
  );
}
