export async function getTowerStatus() {
  // simulación de API
  await new Promise(r => setTimeout(r, 150));
  return {
    conexionOk: true,
    actualizadoHace: "hace 1 min",
    humedad: { value: 62, rango: "55–70%", estado: "Óptimo" },
    temperatura: { value: 23, rango: "20–26°C", estado: "Estable" },
    nutrientes: { ec: 1.8, ph: 5.9, recomendado: "5.5–6.2", estado: "Balanceado" },
    crecimiento: { etapa: "Etapa vegetativa", semana: "Semana 3", progreso: 72 },
    agua: { porcentaje: 88, estado: "Suficiente", proximo: "2 días" }
  };
}

export async function getHumidityHistoryRaw({ minutes = 60 * 24 } = {}) {
  const now = new Date();
  const items = [];
  for (let i = minutes - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 1000);
    const base = 62 + 5 * Math.sin(i / 30);
    const noise = (Math.random() - 0.5) * 2;
    const val = Math.max(45, Math.min(80, Math.round(base + noise)));
    items.push({ ts: d, humidity: val });
  }
  return items;
}

export async function getTemperatureHistoryRaw({ minutes = 60 * 24 } = {}) {
  const now = new Date();
  const items = [];
  for (let i = minutes - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 1000);
    const base = 23 + 2.5 * Math.sin(i / 40);
    const noise = (Math.random() - 0.5) * 0.8;
    const val = Math.round(base + noise);
    items.push({ ts: d, temperature: Math.max(16, Math.min(35, val)) });
  }
  return items;
}