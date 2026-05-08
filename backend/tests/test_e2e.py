"""
Test E2E del pipeline de NutriFit AI.

Usa un ejemplo hardcoded para verificar que el pipeline completo funciona
desde la transcripción de voz hasta las recomendaciones del experto.
"""

import os

import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app

requires_api_key = pytest.mark.skipif(
    not os.getenv("GOOGLE_API_KEY"),
    reason="GOOGLE_API_KEY no configurada — test requiere acceso a Gemini",
)

EXAMPLE_TRANSCRIPT = (
    "He comido arroz con pollo y una ensalada. "
    "He entrenado pecho: press banca 4x10 a 80kg y aperturas 3x12 a 14kg."
)


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@requires_api_key
@pytest.mark.asyncio
async def test_analyze_returns_sse_stream(client: AsyncClient):
    """Verifica que el endpoint /api/analyze devuelve un stream SSE."""
    response = await client.post(
        "/api/analyze",
        json={
            "transcript": EXAMPLE_TRANSCRIPT,
            "user_profile": {
                "weight_kg": 78,
                "height_cm": 178,
                "age": 30,
                "sex": "male",
                "goal": "recomposition",
            },
        },
        headers={"Accept": "text/event-stream"},
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")


@requires_api_key
@pytest.mark.asyncio
async def test_analyze_without_profile(client: AsyncClient):
    """Verifica que el endpoint funciona sin perfil de usuario."""
    response = await client.post(
        "/api/analyze",
        json={"transcript": EXAMPLE_TRANSCRIPT},
        headers={"Accept": "text/event-stream"},
    )
    assert response.status_code == 200


@requires_api_key
@pytest.mark.asyncio
async def test_analyze_empty_transcript(client: AsyncClient):
    """Verifica que una transcripción vacía no causa error 500."""
    response = await client.post(
        "/api/analyze",
        json={"transcript": ""},
        headers={"Accept": "text/event-stream"},
    )
    # Should still return 200 (SSE stream) even if content is minimal
    assert response.status_code == 200


def test_pydantic_models_validation():
    """Verifica que los modelos Pydantic se pueden instanciar correctamente."""
    from src.models.advisor import AdvisorOutput
    from src.models.consolidated import ConsolidatedTable, DailyBalance
    from src.models.intake import ExerciseItem, IntakeOutput, MealItem
    from src.models.nutrition import FoodAnalysis, NutrientProfile, NutritionOutput
    from src.models.training import ExerciseAnalysis, TrainingOutput

    # IntakeOutput
    intake = IntakeOutput(
        meals=[
            MealItem(name="arroz con pollo", is_recipe=True, estimated_quantity="1 plato", raw_text="arroz con pollo"),
            MealItem(name="ensalada", is_recipe=False, estimated_quantity="1 ración", raw_text="una ensalada"),
        ],
        exercises=[
            ExerciseItem(name="press banca", details="4x10 a 80kg", raw_text="press banca 4x10 a 80kg"),
        ],
        date="2026-04-10",
    )
    assert len(intake.meals) == 2
    assert intake.meals[0].is_recipe is True

    # NutrientProfile
    profile = NutrientProfile(
        calories_kcal=500, protein_g=40, carbs_g=50, carbs_sugar_g=5,
        carbs_fiber_g=8, fat_g=15, fat_saturated_g=3, fat_unsaturated_g=10,
        fat_trans_g=0, sodium_mg=400, micronutrients={"iron_mg": 3.5},
    )
    assert profile.calories_kcal == 500

    # NutritionOutput
    nutrition = NutritionOutput(
        food_analyses=[
            FoodAnalysis(
                original_item="arroz con pollo", ingredients=["arroz", "pollo"],
                per_100g=profile, per_serving=profile, serving_size="1 plato",
                source="USDA",
            ),
        ],
        daily_total=profile,
    )
    assert len(nutrition.food_analyses) == 1

    # TrainingOutput
    training = TrainingOutput(
        exercise_analyses=[
            ExerciseAnalysis(
                original_item="press banca", exercise_type="strength",
                estimated_calories_burned=150, volume_total_kg=3200,
                estimated_1rm=106.7, met_value=6.0, duration_minutes=20,
                intensity="high",
            ),
        ],
        total_calories_burned=150,
        training_type_summary="Fuerza tren superior",
        estimated_tdee_contribution=150,
    )
    assert training.total_calories_burned == 150

    # ConsolidatedTable
    consolidated = ConsolidatedTable(
        date="2026-04-10",
        meals_summary=[{"name": "arroz con pollo", "calories": 500}],
        training_summary=[{"name": "press banca", "calories_burned": 150}],
        daily_balance=DailyBalance(
            total_calories_in=1800, total_calories_burned_training=450,
            net_caloric_balance=-150, protein_g=140, carbs_g=180, fat_g=55,
            macro_ratio={"protein": 31, "carbs": 40, "fat": 29},
            nutrition_quality_score=72, fiber_g=18, sodium_mg=1800,
        ),
    )
    assert consolidated.daily_balance.protein_g == 140

    # AdvisorOutput
    advice = AdvisorOutput(
        doing_well=["Buen volumen de entrenamiento"],
        needs_improvement=["Falta fibra"],
        recommendations=["Añade verdura verde"],
        overall_score="B+",
        motivational_note="Sigue así, vas por buen camino.",
        priority_action="Añade 200g de brócoli en la cena.",
    )
    assert advice.overall_score == "B+"
