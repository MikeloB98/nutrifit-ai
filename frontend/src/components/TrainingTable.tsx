import type { TrainingOutput } from "../api/client";

interface TrainingTableProps {
  data: TrainingOutput;
}

export function TrainingTable({ data }: TrainingTableProps) {
  const intensityColor: Record<string, string> = {
    low: "text-green-400",
    moderate: "text-yellow-400",
    high: "text-orange-400",
    very_high: "text-red-400",
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold text-dark-text mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-lime-accent" />
        Entrenamiento
      </h3>
      <div className="overflow-x-auto rounded-xl border border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-dark-surface text-dark-muted text-left">
              <th className="px-4 py-3 font-medium">Ejercicio</th>
              <th className="px-4 py-3 font-medium text-right">Tipo</th>
              <th className="px-4 py-3 font-medium text-right">Duracion</th>
              <th className="px-4 py-3 font-medium text-right">Volumen</th>
              <th className="px-4 py-3 font-medium text-right">Intensidad</th>
              <th className="px-4 py-3 font-medium text-right">Calorias</th>
            </tr>
          </thead>
          <tbody>
            {data.exercise_analyses.map((ex, i) => (
              <tr
                key={i}
                className="border-t border-dark-border hover:bg-dark-surface/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-dark-text">{ex.original_item}</span>
                  {ex.notes && (
                    <span className="block text-xs text-dark-muted mt-0.5">{ex.notes}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-dark-surface border border-dark-border">
                    {ex.exercise_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-[var(--font-mono)] text-xs">
                  {ex.duration_minutes.toFixed(0)} min
                </td>
                <td className="px-4 py-3 text-right font-[var(--font-mono)] text-xs">
                  {ex.volume_total_kg ? `${ex.volume_total_kg.toLocaleString()} kg` : "-"}
                </td>
                <td className={`px-4 py-3 text-right text-xs font-medium ${intensityColor[ex.intensity] || "text-dark-muted"}`}>
                  {ex.intensity}
                </td>
                <td className="px-4 py-3 text-right font-[var(--font-mono)] text-xs text-lime-accent">
                  {ex.estimated_calories_burned.toFixed(0)} kcal
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-lime-accent/30 bg-dark-surface font-semibold">
              <td className="px-4 py-3 text-lime-accent" colSpan={5}>
                TOTAL QUEMADO
              </td>
              <td className="px-4 py-3 text-right font-[var(--font-mono)] text-sm text-lime-accent">
                {data.total_calories_burned.toFixed(0)} kcal
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-dark-muted text-xs mt-2">{data.training_type_summary}</p>
    </div>
  );
}
