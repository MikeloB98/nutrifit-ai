from pydantic import BaseModel


class MealItem(BaseModel):
    name: str
    is_recipe: bool
    estimated_quantity: str
    raw_text: str


class ExerciseItem(BaseModel):
    name: str
    details: str
    duration_minutes: float | None = None
    raw_text: str


class IntakeOutput(BaseModel):
    meals: list[MealItem]
    exercises: list[ExerciseItem]
    date: str
