interface CalorieBalanceProps {
  caloriesIn: number;
  caloriesBurned: number;
  netBalance: number;
}

export function CalorieBalance({ caloriesIn, caloriesBurned, netBalance }: CalorieBalanceProps) {
  const max = Math.max(caloriesIn, caloriesBurned, 1);
  const inPct = (caloriesIn / max) * 100;
  const burnedPct = (caloriesBurned / max) * 100;

  return (
    <div className="animate-fade-in bg-dark-card rounded-xl border border-dark-border p-5">
      <h3 className="text-sm font-semibold text-dark-muted mb-4 uppercase tracking-wider">
        Balance Calorico
      </h3>

      <div className="space-y-4">
        {/* Calories in */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-dark-muted">Ingeridas</span>
            <span className="font-[var(--font-mono)] text-dark-text">
              {caloriesIn.toFixed(0)} kcal
            </span>
          </div>
          <div className="h-3 bg-dark-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-lime-accent rounded-full transition-all duration-700"
              style={{ width: `${inPct}%` }}
            />
          </div>
        </div>

        {/* Calories burned */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-dark-muted">Quemadas (entreno)</span>
            <span className="font-[var(--font-mono)] text-dark-text">
              {caloriesBurned.toFixed(0)} kcal
            </span>
          </div>
          <div className="h-3 bg-dark-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-700"
              style={{ width: `${burnedPct}%` }}
            />
          </div>
        </div>

        {/* Net balance */}
        <div className="pt-3 border-t border-dark-border flex justify-between items-center">
          <span className="text-sm text-dark-muted">Balance neto</span>
          <span
            className={`text-lg font-bold font-[var(--font-mono)] ${
              netBalance > 0 ? "text-lime-accent" : "text-orange-400"
            }`}
          >
            {netBalance > 0 ? "+" : ""}
            {netBalance.toFixed(0)} kcal
          </span>
        </div>
      </div>
    </div>
  );
}
