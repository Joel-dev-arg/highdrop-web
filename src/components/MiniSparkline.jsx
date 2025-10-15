export default function MiniSparkline({ points=[], width=120, height=28 }) {
  if (!points.length) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v, i) => {
    const x = (i/(points.length-1)) * width;
    const y = height - ((v - min) / Math.max(1, (max-min))) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };
  const d = points.map(norm).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={d} fill="none" stroke="url(#g)" strokeWidth="2"/>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#18a957"/>
          <stop offset="100%" stopColor="#4fd18b"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
