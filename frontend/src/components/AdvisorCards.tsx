import type { AdvisorOutput } from "../api/client";

interface AdvisorCardsProps {
  data: AdvisorOutput;
}

export function AdvisorCards({ data }: AdvisorCardsProps) {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-dark-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-accent" />
          Analisis del Experto
        </h3>
        <span
          className="text-2xl font-bold font-[var(--font-mono)] px-4 py-1 rounded-lg border"
          style={{
            color: getScoreColor(data.overall_score),
            borderColor: getScoreColor(data.overall_score) + "40",
            backgroundColor: getScoreColor(data.overall_score) + "10",
          }}
        >
          {data.overall_score}
        </span>
      </div>

      {/* Priority action banner */}
      <div className="bg-gradient-to-r from-lime-accent/10 to-transparent border border-lime-accent/20 rounded-xl p-4">
        <p className="text-xs text-lime-accent font-semibold uppercase tracking-wider mb-1">
          Accion prioritaria para manana
        </p>
        <p className="text-dark-text font-medium">{data.priority_action}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Doing well */}
        <div className="bg-dark-card rounded-xl border border-green-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-green-400">Lo que haces bien</h4>
          </div>
          <ul className="space-y-2">
            {data.doing_well.map((item, i) => (
              <li key={i} className="text-sm text-dark-muted leading-relaxed flex gap-2">
                <span className="text-green-400 mt-1 shrink-0">+</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Needs improvement */}
        <div className="bg-dark-card rounded-xl border border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-amber-400">Puedes mejorar</h4>
          </div>
          <ul className="space-y-2">
            {data.needs_improvement.map((item, i) => (
              <li key={i} className="text-sm text-dark-muted leading-relaxed flex gap-2">
                <span className="text-amber-400 mt-1 shrink-0">!</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-dark-card rounded-xl border border-blue-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-blue-400">Recomendaciones</h4>
          </div>
          <ul className="space-y-2">
            {data.recommendations.map((item, i) => (
              <li key={i} className="text-sm text-dark-muted leading-relaxed flex gap-2">
                <span className="text-blue-400 mt-1 shrink-0">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Motivational note */}
      <div className="text-center p-4 bg-dark-surface rounded-xl border border-dark-border">
        <p className="text-dark-text italic">"{data.motivational_note}"</p>
      </div>
    </div>
  );
}

function getScoreColor(score: string): string {
  if (score.startsWith("A")) return "#A3E635";
  if (score.startsWith("B")) return "#60a5fa";
  if (score.startsWith("C")) return "#fbbf24";
  if (score.startsWith("D")) return "#fb923c";
  return "#f87171";
}
