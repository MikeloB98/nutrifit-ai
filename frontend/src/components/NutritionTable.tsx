import type { NutritionOutput } from "../api/client";

interface NutritionTableProps {
  data: NutritionOutput;
}

export function NutritionTable({ data }: NutritionTableProps) {
  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold text-dark-text mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-lime-accent" />
        Tabla Nutricional
      </h3>
      <div className="overflow-x-auto rounded-xl border border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-dark-surface text-dark-muted text-left">
              <th className="px-4 py-3 font-medium">Alimento</th>
              <th className="px-4 py-3 font-medium text-right">Porcion</th>
              <th className="px-4 py-3 font-medium text-right">Calorias</th>
              <th className="px-4 py-3 font-medium text-right">Proteina</th>
              <th className="px-4 py-3 font-medium text-right">Carbos</th>
              <th className="px-4 py-3 font-medium text-right">Grasa</th>
            </tr>
          </thead>
          <tbody>
            {data.food_analyses.map((food, i) => (
              <tr
                key={i}
                className="border-t border-dark-border hover:bg-dark-surface/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-dark-text">{food.original_item}</span>
                  {food.ingredients.length > 1 && (
                    <span className="block text-xs text-dark-muted mt-0.5">
                      {food.ingredients.join(", ")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-dark-muted font-[var(--font-mono)] text-xs">
                  {food.serving_size}
                </td>
                <td className="px-4 py-3 text-right font-[var(--font-mono)] text-xs">
                  {food.per_serving.calories_kcal.toFixed(0)}
                </td>
                <td className="px-4 py-3 text-right font-[var(--font-mono)] text-xs text-blue-400">
                  {food.per_serving.protein_g.toFixed(1)}g
                </td>
                <td className="px-4 py-3 text-right font-[var(--font-mono)] text-xs text-amber-400">
                  {food.per_serving.carbs_g.toFixed(1)}g
                </td>
                <td className="px-4 py-3 text-right font-[var(--font-mono)] text-xs text-rose-400">
                  {food.per_serving.fat_g.toFixed(1)}g
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="border-t-2 border-lime-accent/30 bg-dark-surface font-semibold">
              <td className="px-4 py-3 text-lime-accent" colSpan={2}>
                TOTAL DEL DIA
              </td>
              <td className="px-4 py-3 text-right font-[var(--font-mono)] text-sm">
                {data.daily_total.calories_kcal.toFixed(0)}
              </td>
              <td className="px-4 py-3 text-right font-[var(--font-mono)] text-sm text-blue-400">
                {data.daily_total.protein_g.toFixed(1)}g
              </td>
              <td className="px-4 py-3 text-right font-[var(--font-mono)] text-sm text-amber-400">
                {data.daily_total.carbs_g.toFixed(1)}g
              </td>
              <td className="px-4 py-3 text-right font-[var(--font-mono)] text-sm text-rose-400">
                {data.daily_total.fat_g.toFixed(1)}g
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
