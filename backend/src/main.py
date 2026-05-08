import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from src.config import FRONTEND_URL
from src.models.api import AnalyzeRequest
from src.pipeline import run_pipeline_streaming

app = FastAPI(
    title="NutriFit AI",
    description="Sistema multi-agente de análisis nutricional y rendimiento físico",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    """Ejecuta el pipeline de análisis y envía progreso por SSE."""

    async def event_generator():
        try:
            async for event in run_pipeline_streaming(
                transcript=request.transcript,
                user_profile=request.user_profile,
            ):
                yield {
                    "event": event["event"],
                    "data": json.dumps(event["data"], ensure_ascii=False),
                }
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}, ensure_ascii=False),
            }

    return EventSourceResponse(event_generator())
