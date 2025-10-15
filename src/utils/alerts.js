export function evaluateAlerts(statusData, settings){
  if (!statusData || !settings) return [];
  const out = [];

  const check = (key, label, value, unit="") => {
    const cfg = settings[key];
    if (!cfg?.enabled || value == null) return;
    if (value < cfg.min) out.push({ key, level: "warn", msg: `${label} bajo (${value}${unit} < ${cfg.min}${unit})` });
    else if (value > cfg.max) out.push({ key, level: "warn", msg: `${label} alto (${value}${unit} > ${cfg.max}${unit})` });
  };

  check("temperature", "Temperatura", statusData.temperatura?.value, "°C");
  check("humidity",    "Humedad",     statusData.humedad?.value, "%");
  check("ph",          "pH",          statusData.nutrientes?.ph, "");

  return out;
}
