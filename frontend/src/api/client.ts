export interface UserProfile {
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  sex?: "male" | "female";
  activity_level?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal?: "recomposition" | "muscle_gain" | "fat_loss";
}

export interface AnalyzeRequest {
  transcript: string;
  user_profile?: UserProfile;
}

export interface ProgressEvent {
  agent: string;
  message: string;
}

export interface NutrientProfile {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  carbs_sugar_g: number;
  carbs_fiber_g: number;
  fat_g: number;
  fat_saturated_g: number;
  fat_unsaturated_g: number;
  fat_trans_g: number;
  sodium_mg: number;
  micronutrients: Record<string, number>;
}

export interface FoodAnalysis {
  original_item: string;
  ingredients: string[];
  per_100g: NutrientProfile;
  per_serving: NutrientProfile;
  serving_size: string;
  source: string;
}

export interface NutritionOutput {
  food_analyses: FoodAnalysis[];
  daily_total: NutrientProfile;
}

export interface ExerciseAnalysis {
  original_item: string;
  exercise_type: string;
  estimated_calories_burned: number;
  volume_total_kg?: number;
  estimated_1rm?: number;
  met_value: number;
  duration_minutes: number;
  intensity: string;
  notes: string;
}

export interface TrainingOutput {
  exercise_analyses: ExerciseAnalysis[];
  total_calories_burned: number;
  training_type_summary: string;
  estimated_tdee_contribution: number;
}

export interface DailyBalance {
  total_calories_in: number;
  total_calories_burned_training: number;
  estimated_bmr?: number;
  estimated_tdee?: number;
  net_caloric_balance: number;
  protein_g: number;
  protein_per_kg?: number;
  carbs_g: number;
  fat_g: number;
  macro_ratio: Record<string, number>;
  nutrition_quality_score: number;
  fiber_g: number;
  sodium_mg: number;
  hydration_note: string;
  micronutrient_highlights: Record<string, string>;
}

export interface ConsolidatedTable {
  date: string;
  meals_summary: Record<string, unknown>[];
  training_summary: Record<string, unknown>[];
  daily_balance: DailyBalance;
  charts_data: Record<string, unknown>;
}

export interface AdvisorOutput {
  doing_well: string[];
  needs_improvement: string[];
  recommendations: string[];
  overall_score: string;
  motivational_note: string;
  priority_action: string;
}

export interface AnalyzeResult {
  intake: unknown;
  nutrition: NutritionOutput;
  training: TrainingOutput;
  consolidated: ConsolidatedTable;
  advice: AdvisorOutput;
}

export async function analyzeDay(
  request: AnalyzeRequest,
  onProgress: (event: ProgressEvent) => void,
): Promise<AnalyzeResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let result: AnalyzeResult | null = null;
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const dataStr = line.slice(5).trim();
        if (!dataStr) continue;
        try {
          const data = JSON.parse(dataStr);
          // Detect whether it's a progress or complete event by checking for 'agent' key
          if ("agent" in data) {
            onProgress(data as ProgressEvent);
          } else {
            result = data as AnalyzeResult;
          }
        } catch {
          // skip unparseable lines
        }
      } else if (line.startsWith("event:")) {
        // SSE event type line — we handle data lines above
      }
    }
  }

  if (!result) throw new Error("No se recibió resultado del análisis");
  return result;
}
