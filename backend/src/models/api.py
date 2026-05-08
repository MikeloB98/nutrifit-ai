from pydantic import BaseModel

from src.models.advisor import AdvisorOutput
from src.models.consolidated import ConsolidatedTable
from src.models.intake import IntakeOutput
from src.models.nutrition import NutritionOutput
from src.models.training import TrainingOutput


class UserProfile(BaseModel):
    weight_kg: float | None = None
    height_cm: float | None = None
    age: int | None = None
    sex: str | None = None  # "male" | "female"
    activity_level: str | None = None  # "sedentary" | "light" | "moderate" | "active" | "very_active"
    goal: str | None = None  # "recomposition" | "muscle_gain" | "fat_loss"


class AnalyzeRequest(BaseModel):
    transcript: str
    user_profile: UserProfile | None = None


class AnalyzeResponse(BaseModel):
    intake: IntakeOutput
    nutrition: NutritionOutput
    training: TrainingOutput
    consolidated: ConsolidatedTable
    advice: AdvisorOutput
