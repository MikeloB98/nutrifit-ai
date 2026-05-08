from pydantic import BaseModel


class DailyBalance(BaseModel):
    total_calories_in: float
    total_calories_burned_training: float
    estimated_bmr: float | None = None
    estimated_tdee: float | None = None
    net_caloric_balance: float
    protein_g: float
    protein_per_kg: float | None = None
    carbs_g: float
    fat_g: float
    macro_ratio: dict[str, float]
    nutrition_quality_score: float
    fiber_g: float
    sodium_mg: float
    hydration_note: str = ""
    micronutrient_highlights: dict[str, str] = {}


class ConsolidatedTable(BaseModel):
    date: str
    meals_summary: list[dict]
    training_summary: list[dict]
    daily_balance: DailyBalance
    charts_data: dict = {}
