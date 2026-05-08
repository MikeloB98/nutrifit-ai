import json
import uuid
from collections.abc import AsyncGenerator

from google.adk import Runner
from google.adk.agents import SequentialAgent
from google.adk.sessions import InMemorySessionService
from google.genai import types

from src.agents.data_consolidator import data_consolidator_agent
from src.agents.expert_advisor import expert_advisor_agent
from src.agents.nutrition_researcher import nutrition_researcher_agent
from src.agents.training_analyst import training_analyst_agent
from src.agents.voice_intake import voice_intake_agent
from src.models.advisor import AdvisorOutput
from src.models.api import AnalyzeResponse, UserProfile
from src.models.consolidated import ConsolidatedTable
from src.models.intake import IntakeOutput
from src.models.nutrition import NutritionOutput
from src.models.training import TrainingOutput
from src.utils.logging import get_logger

logger = get_logger("pipeline")

AGENT_STEPS = [
    ("voice_intake_agent", "Parseando entrada de voz..."),
    ("nutrition_researcher_agent", "Investigando valores nutricionales..."),
    ("training_analyst_agent", "Analizando entrenamiento..."),
    ("data_consolidator_agent", "Consolidando datos del día..."),
    ("expert_advisor_agent", "Generando recomendaciones del experto..."),
]

# Pipeline secuencial que ejecuta los 5 agentes en orden
pipeline_agent = SequentialAgent(
    name="nutrifit_pipeline",
    sub_agents=[
        voice_intake_agent,
        nutrition_researcher_agent,
        training_analyst_agent,
        data_consolidator_agent,
        expert_advisor_agent,
    ],
)

session_service = InMemorySessionService()


def _build_prompt(transcript: str, user_profile: UserProfile | None) -> str:
    """Construye el prompt inicial combinando transcript y perfil del usuario."""
    parts = [f"Transcripción del usuario:\n{transcript}"]
    if user_profile:
        profile_data = user_profile.model_dump(exclude_none=True)
        if profile_data:
            parts.append(f"\nPerfil del usuario:\n{json.dumps(profile_data, ensure_ascii=False)}")
    return "\n".join(parts)


async def run_pipeline_streaming(
    transcript: str,
    user_profile: UserProfile | None = None,
) -> AsyncGenerator[dict, None]:
    """Ejecuta el pipeline completo y emite eventos SSE con el progreso."""
    # Crear un session_service fresco por request para evitar que la conversación
    # previa contamine el contexto del nuevo análisis.
    request_session_service = InMemorySessionService()
    session_id = f"session_{uuid.uuid4().hex[:8]}"

    runner = Runner(
        app_name="nutrifit_ai",
        agent=pipeline_agent,
        session_service=request_session_service,
        auto_create_session=True,
    )

    prompt = _build_prompt(transcript, user_profile)
    message = types.Content(role="user", parts=[types.Part(text=prompt)])

    logger.info("Iniciando pipeline para: %s...", transcript[:80])

    current_agent = None
    agent_outputs: dict[str, str] = {}

    async for event in runner.run_async(
        user_id="default_user",
        session_id=session_id,
        new_message=message,
    ):
        # Detectar cambio de agente activo
        if hasattr(event, "author") and event.author != current_agent:
            current_agent = event.author
            for agent_name, step_msg in AGENT_STEPS:
                if agent_name == current_agent:
                    logger.info("Agente activo: %s", agent_name)
                    yield {"event": "progress", "data": {"agent": agent_name, "message": step_msg}}
                    break

        # Capturar contenido de texto de cada agente
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    author = getattr(event, "author", current_agent) or "unknown"
                    agent_outputs[author] = part.text

    # Parsear salidas de cada agente
    result = _parse_agent_outputs(agent_outputs)
    yield {"event": "complete", "data": result}


def _try_parse_json(text: str) -> dict:
    """Intenta extraer JSON de un texto que puede contener markdown u otro envoltorio."""
    clean = text.strip()

    # Remover bloques de código markdown si existen
    if "```" in clean:
        lines = clean.split("\n")
        filtered = []
        inside_block = False
        for line in lines:
            stripped = line.strip()
            if stripped.startswith("```"):
                inside_block = not inside_block
                continue
            if inside_block or not clean.startswith("```"):
                filtered.append(line)
        clean = "\n".join(filtered).strip()

    # Intentar parsear directamente
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        pass

    # Buscar el primer { y último } para extraer JSON embebido en texto
    start = clean.find("{")
    end = clean.rfind("}")
    if start != -1 and end != -1 and end > start:
        return json.loads(clean[start : end + 1])

    raise ValueError(f"No se pudo extraer JSON del texto: {clean[:200]}...")


def _parse_agent_outputs(outputs: dict[str, str]) -> dict:
    """Parsea las salidas de texto de los agentes en modelos Pydantic."""
    result = {}

    parsers: list[tuple[str, str, type]] = [
        ("voice_intake_agent", "intake", IntakeOutput),
        ("nutrition_researcher_agent", "nutrition", NutritionOutput),
        ("training_analyst_agent", "training", TrainingOutput),
        ("data_consolidator_agent", "consolidated", ConsolidatedTable),
        ("expert_advisor_agent", "advice", AdvisorOutput),
    ]

    for agent_name, key, model_cls in parsers:
        raw = outputs.get(agent_name, "")
        if raw:
            try:
                data = _try_parse_json(raw)
                result[key] = model_cls.model_validate(data).model_dump()
            except Exception as e:
                logger.warning("Error parseando salida de %s: %s", agent_name, e)
                result[key] = {"raw": raw, "parse_error": str(e)}
        else:
            logger.warning("Sin salida para %s", agent_name)
            result[key] = {}

    return result


async def run_pipeline(
    transcript: str,
    user_profile: UserProfile | None = None,
) -> AnalyzeResponse:
    """Ejecuta el pipeline completo y devuelve el resultado final."""
    final_result = {}
    async for event in run_pipeline_streaming(transcript, user_profile):
        if event["event"] == "complete":
            final_result = event["data"]

    return AnalyzeResponse.model_validate(final_result)
