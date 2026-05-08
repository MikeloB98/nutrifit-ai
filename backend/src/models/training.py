from pydantic import BaseModel


class ExerciseAnalysis(BaseModel):
    original_item: str
    exercise_type: str
    estimated_calories_burned: float
    volume_total_kg: float | None = None
    estimated_1rm: float | None = None
    met_value: float
    duration_minutes: float
    intensity: str
    notes: str = ""


class TrainingOutput(BaseModel):
    exercise_analyses: list[ExerciseAnalysis]
    total_calories_burned: float
    training_type_summary: str
    estimated_tdee_contribution: float
