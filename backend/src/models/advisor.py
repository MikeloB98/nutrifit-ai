from pydantic import BaseModel


class AdvisorOutput(BaseModel):
    doing_well: list[str]
    needs_improvement: list[str]
    recommendations: list[str]
    overall_score: str
    motivational_note: str
    priority_action: str
