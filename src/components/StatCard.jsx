import Badge from "./Badge";

export default function StatCard({
  icon, title, value, helper, badge, tone = "ok", children, full = false
}) {
  return (
    <div className={`card ${full ? "card--full" : ""}`}>
      <div className="stat-head">
        <div className="stat-title">
          <span className="icon">{icon}</span>
          <span>{title}</span>
        </div>
        {badge && <Badge tone={tone}>{badge}</Badge>}
      </div>
      <div className="stat-body">
        {value && <div className="stat-value">{value}</div>}
        {helper && <div className="stat-helper">{helper}</div>}
        {children}
      </div>
    </div>
  );
}
