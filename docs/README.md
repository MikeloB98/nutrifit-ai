# NutriFit AI — Documentacion Tecnica

**NutriFit AI** es una web app fullstack que analiza tu nutricion y rendimiento fisico diario mediante un pipeline de 5 agentes de IA especializados. Dicta por voz lo que has comido y entrenado, y recibe un analisis completo con recomendaciones de un experto en recomposicion corporal.

```
[Voz/Texto] → Agent 1 (Voice Intake) → Agent 2 (Nutrition Researcher) → Agent 3 (Training Analyst) → Agent 4 (Data Consolidator) → Agent 5 (Expert Advisor)
```

---

## Requisitos Previos

| Requisito | Version minima | Notas |
|-----------|---------------|-------|
| Python | 3.13+ | Requerido para el backend |
| Node.js | 20+ | Requerido para el frontend |
| uv | Ultima | Gestor de paquetes Python |
| Google API Key | - | Para Gemini 2.5 Flash |
| Navegador | Chrome/Edge | Web Speech API requiere estos navegadores |

### Obtener una API Key de Google

1. Ve a [Google AI Studio](https://aistudio.google.com/apikey).
2. Crea un nuevo proyecto o selecciona uno existente.
3. Genera una API Key.
4. Copia la key — la necesitaras en el siguiente paso.

---

## Instalacion y Lanzamiento

### Clonar el repositorio

```bash
git clone <url-del-repo>
cd nutrifit-ai
```

### Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env y añade tu GOOGLE_API_KEY
```

### Backend

```bash
cd backend
uv sync                          # instala dependencias desde pyproject.toml
uv run uvicorn src.main:app --reload --port 8000
```

### Frontend (en otra terminal)

```bash
cd frontend
npm install
npm run dev                      # arranca en http://localhost:5173
```

### Opcion rapida (lanza backend + frontend juntos)

```bash
chmod +x run.sh
./run.sh
```

### Correr tests

```bash
cd backend
uv run pytest tests/ -v
```

---

## Configuracion del Modelo LLM

La configuracion del modelo esta centralizada en `backend/src/config.py` y se controla via variables de entorno en `.env`:

### Gemini (por defecto)

```env
LLM_PROVIDER=gemini
GOOGLE_API_KEY=tu-api-key-aqui
GEMINI_MODEL=gemini-2.5-flash
```

### Modelo open source via LiteLLM

```env
LLM_PROVIDER=litellm
LITELLM_MODEL=ollama/llama3.1
LITELLM_BASE_URL=http://localhost:11434
```

Para usar LiteLLM, necesitas instalar la dependencia adicional (`uv add litellm`) y tener el modelo corriendo localmente (e.g., via Ollama).

---

## Estructura del Proyecto

```
nutrifit-ai/
├── backend/
│   ├── pyproject.toml                 # Dependencias y config de uv
│   ├── src/
│   │   ├── main.py                    # FastAPI app con endpoints REST + SSE
│   │   ├── pipeline.py                # Orquestacion secuencial del pipeline ADK
│   │   ├── config.py                  # Settings centralizados y config del modelo LLM
│   │   ├── agents/
│   │   │   ├── voice_intake.py        # Agent 1: parsea entrada de voz en comidas/ejercicios
│   │   │   ├── nutrition_researcher.py # Agent 2: investiga valores nutricionales via Google Search
│   │   │   ├── training_analyst.py    # Agent 3: calcula gasto calorico y metricas de fuerza
│   │   │   ├── data_consolidator.py   # Agent 4: cruza datos y genera tabla consolidada
│   │   │   └── expert_advisor.py      # Agent 5: genera recomendaciones como nutricionista deportivo
│   │   ├── models/
│   │   │   ├── intake.py              # MealItem, ExerciseItem, IntakeOutput
│   │   │   ├── nutrition.py           # NutrientProfile, FoodAnalysis, NutritionOutput
│   │   │   ├── training.py            # ExerciseAnalysis, TrainingOutput
│   │   │   ├── consolidated.py        # DailyBalance, ConsolidatedTable
│   │   │   ├── advisor.py             # AdvisorOutput
│   │   │   └── api.py                 # UserProfile, AnalyzeRequest, AnalyzeResponse
│   │   └── utils/
│   │       └── logging.py             # Logger configurado y decorador de agentes
│   └── tests/
│       └── test_e2e.py                # Tests de modelos Pydantic y endpoints
├── frontend/
│   ├── package.json
│   ├── vite.config.ts                 # Vite config con Tailwind y proxy al backend
│   ├── index.html                     # HTML con fuentes Plus Jakarta Sans + JetBrains Mono
│   ├── src/
│   │   ├── App.tsx                    # App principal con routing y estado global
│   │   ├── index.css                  # Tailwind CSS con tema dark custom
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Pantalla principal con input de voz
│   │   │   ├── Results.tsx            # Dashboard con tablas y graficos
│   │   │   └── Profile.tsx            # Modal de perfil de usuario
│   │   ├── components/
│   │   │   ├── VoiceRecorder.tsx      # Boton de microfono + transcripcion
│   │   │   ├── ProgressIndicator.tsx  # Indicador de progreso del pipeline
│   │   │   ├── NutritionTable.tsx     # Tabla de comidas con macros
│   │   │   ├── TrainingTable.tsx      # Tabla de ejercicios con volumen y calorias
│   │   │   ├── MacroChart.tsx         # Grafico circular de macronutrientes (Recharts)
│   │   │   ├── CalorieBalance.tsx     # Barra de balance calorico
│   │   │   ├── QualityGauge.tsx       # Gauge de calidad nutricional 0-100
│   │   │   └── AdvisorCards.tsx       # Cards del experto (bien/mejorar/recomendaciones)
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.ts # Hook para Web Speech API
│   │   │   └── useAnalysis.ts         # Hook para llamar al pipeline
│   │   └── api/
│   │       └── client.ts              # Cliente HTTP con soporte SSE
│   └── tailwind.config.ts
├── docs/
│   ├── README.md                      # Esta documentacion
│   ├── GUIDE.md                       # Guia de usuario
│   └── ARCHITECTURE.md                # Documentacion de arquitectura
├── .env.example                       # Template de variables de entorno
├── Makefile                           # Comandos rapidos (install, dev, test)
└── run.sh                             # Script para lanzar todo con un comando
```

---

## API Reference

### `GET /api/health`

Verifica que el servidor esta corriendo.

**Response:**
```json
{
  "status": "ok"
}
```

### `POST /api/analyze`

Ejecuta el pipeline completo de analisis. Devuelve un stream SSE (Server-Sent Events) con el progreso de cada agente y el resultado final.

**Request Body:**
```json
{
  "transcript": "He comido arroz con pollo y he entrenado press banca 4x10 a 80kg",
  "user_profile": {
    "weight_kg": 78,
    "height_cm": 178,
    "age": 30,
    "sex": "male",
    "goal": "recomposition"
  }
}
```

El campo `user_profile` es opcional. Si se omite, los calculos usaran valores por defecto.

**Response (SSE stream):**

Eventos de progreso:
```
event: progress
data: {"agent": "voice_intake_agent", "message": "Parseando entrada de voz..."}

event: progress
data: {"agent": "nutrition_researcher_agent", "message": "Investigando valores nutricionales..."}
```

Evento final:
```
event: complete
data: {
  "intake": {
    "meals": [
      {"name": "arroz con pollo", "is_recipe": true, "estimated_quantity": "1 plato", "raw_text": "arroz con pollo"}
    ],
    "exercises": [
      {"name": "press banca", "details": "4 series de 10 a 80kg", "duration_minutes": null, "raw_text": "press banca 4x10 a 80kg"}
    ],
    "date": "2026-04-10"
  },
  "nutrition": {
    "food_analyses": [...],
    "daily_total": {"calories_kcal": 1450, "protein_g": 110, "carbs_g": 160, "fat_g": 45, ...}
  },
  "training": {
    "exercise_analyses": [...],
    "total_calories_burned": 320,
    "training_type_summary": "Fuerza tren superior",
    "estimated_tdee_contribution": 320
  },
  "consolidated": {
    "date": "2026-04-10",
    "daily_balance": {
      "total_calories_in": 1450,
      "total_calories_burned_training": 320,
      "net_caloric_balance": -370,
      "protein_g": 110,
      "carbs_g": 160,
      "fat_g": 45,
      "macro_ratio": {"protein": 30, "carbs": 44, "fat": 26},
      "nutrition_quality_score": 72,
      ...
    }
  },
  "advice": {
    "doing_well": ["Buena ingesta proteica en rango 1.4g/kg"],
    "needs_improvement": ["La fibra esta por debajo de 25g"],
    "recommendations": ["Añade verdura verde en la cena para cubrir fibra"],
    "overall_score": "B+",
    "motivational_note": "Buen dia de entrenamiento, sigue con esa consistencia.",
    "priority_action": "Añade 200g de brocoli o espinacas en la cena de mañana."
  }
}
```

---

## Troubleshooting

| Problema | Solucion |
|----------|----------|
| `Error: GOOGLE_API_KEY not set` | Revisa tu archivo `.env` y asegurate de que `GOOGLE_API_KEY` tiene un valor valido |
| Web Speech API no funciona | Usa Chrome o Edge. Asegurate de dar permiso al microfono cuando el navegador lo solicite |
| `uv: command not found` | Instala uv: `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| El agente de nutricion devuelve datos vacios | Verifica tu conexion a internet. Google Search Grounding requiere acceso web |
| `ModuleNotFoundError: No module named 'src'` | Asegurate de ejecutar desde la carpeta `backend/`: `cd backend && uv run uvicorn src.main:app` |
| El frontend no conecta con el backend | Verifica que el backend esta corriendo en el puerto 8000. El proxy de Vite redirige `/api` automaticamente |
| `npm ERR! Could not resolve dependency` | Borra `node_modules` y `package-lock.json`, luego ejecuta `npm install` de nuevo |
| Timeout en el pipeline | Los agentes usan Google Search, lo que puede tardar 30-60 segundos. Espera a que complete |
