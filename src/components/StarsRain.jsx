import { useEffect, useMemo, useState } from "react";

export default function StarsRain({ count = 100, duration = 2000 }) {
  const [stars, setStars] = useState([]);

  const config = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100;
      const size = 2 + Math.random() * 4;       // 2–6 px
      const delay = Math.random() * 0.6;        // escalonado
      const dur = 1 + Math.random() * 1.2;      // 1–2.2s
      const opacity = 0.8 + Math.random() * 0.2;
      // 15% verdes, 10% azules, resto blancas
      const tint = Math.random() < 0.15 ? "green" : (Math.random() < 0.25 ? "blue" : "white");
      arr.push({ left, size, delay, dur, opacity, tint });
    }
    return arr;
  }, [count]);

  useEffect(() => {
    setStars(config);
    const t = setTimeout(() => setStars([]), duration);
    return () => clearTimeout(t);
  }, [config, duration]);

  if (!stars.length) return null;

  return (
    <div className="stars-overlay">
      {stars.map((s, idx) => (
        <span
          key={idx}
          className={`star star--${s.tint}`}
          style={{
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}
