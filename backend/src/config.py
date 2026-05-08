import os
from dotenv import load_dotenv

load_dotenv()

# --- LLM Configuration ---
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# LiteLLM (modelos open source)
LITELLM_MODEL = os.getenv("LITELLM_MODEL", "ollama/llama3.1")
LITELLM_BASE_URL = os.getenv("LITELLM_BASE_URL", "http://localhost:11434")

# --- Server ---
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def get_model_name() -> str:
    """Devuelve el nombre del modelo a usar según el provider configurado."""
    if LLM_PROVIDER == "litellm":
        return LITELLM_MODEL
    return GEMINI_MODEL
