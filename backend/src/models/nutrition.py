from pydantic import BaseModel


class NutrientProfile(BaseModel):
    calories_kcal: float = 0.0
    protein_g: float = 0.0
    carbs_g: float = 0.0
    carbs_sugar_g: float = 0.0
    carbs_fiber_g: float = 0.0
    fat_g: float = 0.0
    fat_saturated_g: float = 0.0
    fat_unsaturated_g: float = 0.0
    fat_trans_g: float = 0.0
    sodium_mg: float = 0.0
    micronutrients: dict[str, float] = {}


class FoodAnalysis(BaseModel):
    original_item: str
    ingredients: list[str] = []
    per_100g: NutrientProfile
    per_serving: NutrientProfile
    serving_size: str
    source: str


class NutritionOutput(BaseModel):
    food_analyses: list[FoodAnalysis]
    daily_total: NutrientProfile
