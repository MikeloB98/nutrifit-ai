interface QualityGaugeProps {
  score: number;
}

export function QualityGauge({ score }: QualityGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const rotation = (clampedScore / 100) * 180 - 90; // -90 to 90 degrees
  const color =
    clampedScore >= 80
      ? "#A3E635"
      : clampedScore >= 60
        ? "#fbbf24"
        : clampedScore >= 40
          ? "#fb923c"
          : "#f87171";

  return (
    <div className="animate-fade-in bg-dark-card rounded-xl border border-dark-border p-5 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-dark-muted mb-4 uppercase tracking-wider">
        Calidad Nutricional
      </h3>

      <div className="relative w-40 h-24 overflow-hidden">
        {/* Background arc */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-18 border-[8px] border-dark-surface rounded-t-full border-b-0" />

        {/* Colored arc */}
        <svg className="absolute bottom-0 left-1/2 -translate-x-1/2" width="144" height="72" viewBox="0 0 144 72">
          <path
            d="M 8 72 A 64 64 0 0 1 136 72"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(clampedScore / 100) * 201} 201`}
            className="transition-all duration-1000"
          />
        </svg>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="w-0.5 h-14 bg-dark-text rounded-full mx-auto" />
        </div>

        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-dark-text" />
      </div>

      <div className="mt-3 flex flex-col items-center">
        <span className="text-3xl font-bold font-[var(--font-mono)]" style={{ color }}>
          {clampedScore.toFixed(0)}
        </span>
        <span className="text-xs text-dark-muted">de 100</span>
      </div>
    </div>
  );
}
