import type { AnalyzeResult } from "../api/client";
import { AdvisorCards } from "../components/AdvisorCards";
import { CalorieBalance } from "../components/CalorieBalance";
import { MacroChart } from "../components/MacroChart";
import { NutritionTable } from "../components/NutritionTable";
import { QualityGauge } from "../components/QualityGauge";
import { TrainingTable } from "../components/TrainingTable";

interface ResultsProps {
  data: AnalyzeResult;
  onBack: () => void;
}

export function Results({ data, onBack }: ResultsProps) {
  const { nutrition, training, consolidated, advice } = data;
  const balance = consolidated.daily_balance;

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-text tracking-tight">
            Tu dia — <span className="text-lime-accent">{consolidated.date}</span>
          </h1>
          <p className="text-dark-muted text-sm mt-1">Analisis completo de nutricion y entrenamiento</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-muted hover:text-dark-text hover:border-dark-muted transition-colors"
        >
          Nuevo analisis
        </button>
      </div>

      {/* Visual summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MacroChart
          protein={balance.protein_g}
          carbs={balance.carbs_g}
          fat={balance.fat_g}
        />
        <CalorieBalance
          caloriesIn={balance.total_calories_in}
          caloriesBurned={balance.total_calories_burned_training}
          netBalance={balance.net_caloric_balance}
        />
        <QualityGauge score={balance.nutrition_quality_score} />
      </div>

      {/* Data tables */}
      <div className="space-y-8 mb-8">
        <NutritionTable data={nutrition} />
        <TrainingTable data={training} />
      </div>

      {/* Expert advisor */}
      <AdvisorCards data={advice} />
    </div>
  );
}
