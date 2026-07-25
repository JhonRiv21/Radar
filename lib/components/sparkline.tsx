const WIDTH = 100;
const HEIGHT = 32;

export function Sparkline({
  points,
  color = "#38bdf8",
}: {
  points: number[];
  color?: string;
}) {
  if (points.length < 2) return null;

  const max = Math.max(...points, 1);
  const step = WIDTH / (points.length - 1);
  const coords = points.map((value, i) => {
    const x = i * step;
    const y = HEIGHT - (value / max) * (HEIGHT - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${coords.join(" L")}`;
  const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;
  const gradientId = `spark-${points.join("-")}`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
