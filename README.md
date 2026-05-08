# NutriFit AI

**NutriFit AI** is a full-stack web application that analyzes a user's daily nutrition and physical training through a pipeline of five specialized AI agents. The user can dictate or type what they ate and how they trained, then receive a complete analysis with personalized recommendations from a sports nutrition perspective.

```text
[Voice/Text] -> Agent 1 (Voice Intake) -> Agent 2 (Nutrition Researcher) -> Agent 3 (Training Analyst) -> Agent 4 (Data Consolidator) -> Agent 5 (Expert Advisor)
```

---

## Prerequisites

| Requirement | Minimum version | Notes |
|-------------|-----------------|-------|
| Python | 3.13+ | Required for the backend |
| Node.js | 20+ | Required for the frontend |
| uv | Latest | Python package manager |
| Google API Key | - | Required for Gemini 2.5 Flash and Google Search grounding |
| Browser | Chrome/Edge | Recommended for Web Speech API support |

### Get a Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Create a new project or select an existing one.
3. Generate an API key.
4. Copy the key; you will need it in the environment setup step.

---

## Installation and Startup

### Clone the Repository

```bash
git clone <repo-url>
cd nutrifit-ai
```

### Configure Environment Variables

```bash
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

### Backend

```bash
cd backend
uv sync                          # install dependencies from pyproject.toml
uv run uvicorn src.main:app --reload --port 8000
```

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev                      # starts at http://localhost:5173
```

### Quick Start

Starts the backend and frontend together:

```bash
chmod +x run.sh
./run.sh
```

### Run Tests

```bash
cd backend
uv run pytest tests/ -v
```

---

## LLM Configuration

Model configuration is centralized in `backend/src/config.py` and controlled through environment variables in `.env`.

### Gemini Default

```env
LLM_PROVIDER=gemini
GOOGLE_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.5-flash
```

### Open-Source Model Through LiteLLM

```env
LLM_PROVIDER=litellm
LITELLM_MODEL=ollama/llama3.1
LITELLM_BASE_URL=http://localhost:11434
```

To use LiteLLM, install the extra dependency (`uv add litellm`) and run the model locally, for example through Ollama.

Important implementation note: the nutrition and training agents currently use ADK's `google_search` tool, so a fully local/open-source setup also needs replacement search tooling.

---

## Project Structure

```text
nutrifit-ai/
├── backend/
│   ├── pyproject.toml                 # Dependencies and uv configuration
│   ├── src/
│   │   ├── main.py                    # FastAPI app with REST and SSE endpoints
│   │   ├── pipeline.py                # Sequential ADK pipeline orchestration
│   │   ├── config.py                  # Centralized settings and LLM configuration
│   │   ├── agents/
│   │   │   ├── voice_intake.py        # Agent 1: parses voice/text into meals and exercises
│   │   │   ├── nutrition_researcher.py # Agent 2: researches nutrition values with Google Search
│   │   │   ├── training_analyst.py    # Agent 3: estimates calories and strength metrics
│   │   │   ├── data_consolidator.py   # Agent 4: combines data into a daily summary
│   │   │   └── expert_advisor.py      # Agent 5: generates sports nutrition recommendations
│   │   ├── models/
│   │   │   ├── intake.py              # MealItem, ExerciseItem, IntakeOutput
│   │   │   ├── nutrition.py           # NutrientProfile, FoodAnalysis, NutritionOutput
│   │   │   ├── training.py            # ExerciseAnalysis, TrainingOutput
│   │   │   ├── consolidated.py        # DailyBalance, ConsolidatedTable
│   │   │   ├── advisor.py             # AdvisorOutput
│   │   │   └── api.py                 # UserProfile, AnalyzeRequest, AnalyzeResponse
│   │   └── utils/
│   │       └── logging.py             # Logger helper and agent execution decorator
│   └── tests/
│       └── test_e2e.py                # Pydantic model and endpoint tests
├── frontend/
│   ├── package.json
│   ├── vite.config.ts                 # Vite config with Tailwind and backend proxy
│   ├── index.html                     # HTML shell with fonts
│   ├── src/
│   │   ├── App.tsx                    # Main app state and view orchestration
│   │   ├── index.css                  # Tailwind CSS custom dark theme
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Home screen with voice input
│   │   │   ├── Results.tsx            # Dashboard with tables and charts
│   │   │   └── Profile.tsx            # User profile modal
│   │   ├── components/
│   │   │   ├── VoiceRecorder.tsx      # Microphone button and transcript editor
│   │   │   ├── ProgressIndicator.tsx  # Pipeline progress indicator
│   │   │   ├── NutritionTable.tsx     # Meal table with macros
│   │   │   ├── TrainingTable.tsx      # Exercise table with volume and calories
│   │   │   ├── MacroChart.tsx         # Macronutrient pie chart with Recharts
│   │   │   ├── CalorieBalance.tsx     # Calorie balance visualization
│   │   │   ├── QualityGauge.tsx       # Nutrition quality gauge from 0 to 100
│   │   │   └── AdvisorCards.tsx       # Expert advice cards
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.ts # Web Speech API hook
│   │   │   └── useAnalysis.ts         # Analysis API hook
│   │   └── api/
│   │       └── client.ts              # HTTP client with SSE parsing
│   └── tailwind.config.ts
├── docs/
│   ├── README.md                      # Technical documentation
│   ├── GUIDE.md                       # User guide
│   ├── ARCHITECTURE.md                # Architecture documentation
│   ├── CODEBASE_OVERVIEW.md           # Full codebase overview
│   └── AI_INTERVIEW_BRIEF.md          # Interview-focused AI summary
├── .env.example                       # Environment variable template
├── Makefile                           # Quick commands for install, dev, and test
└── run.sh                             # One-command startup script
```

---

## API Reference

### `GET /api/health`

Checks whether the server is running.

**Response:**

```json
{
  "status": "ok"
}
```

### `POST /api/analyze`

Runs the complete analysis pipeline. Returns a Server-Sent Events stream with progress updates and the final result.

**Request Body:**

```json
{
  "transcript": "I ate rice with chicken and trained bench press 4x10 at 80kg",
  "user_profile": {
    "weight_kg": 78,
    "height_cm": 178,
    "age": 30,
    "sex": "male",
    "goal": "recomposition"
  }
}
```

The `user_profile` field is optional. If it is omitted, calculations use less personalized estimates.

**Response SSE Stream:**

Progress events:

```text
event: progress
data: {"agent": "voice_intake_agent", "message": "Parsing voice input..."}

event: progress
data: {"agent": "nutrition_researcher_agent", "message": "Researching nutrition values..."}
```

Final event:

```text
event: complete
data: {
  "intake": {
    "meals": [
      {"name": "rice with chicken", "is_recipe": true, "estimated_quantity": "1 plate", "raw_text": "rice with chicken"}
    ],
    "exercises": [
      {"name": "bench press", "details": "4 sets of 10 at 80kg", "duration_minutes": null, "raw_text": "bench press 4x10 at 80kg"}
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
    "training_type_summary": "Upper-body strength",
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
      "nutrition_quality_score": 72
    }
  },
  "advice": {
    "doing_well": ["Good protein intake for your current profile."],
    "needs_improvement": ["Fiber is below the recommended 25g/day target."],
    "recommendations": ["Add green vegetables at dinner to increase fiber."],
    "overall_score": "B+",
    "motivational_note": "Good training consistency today.",
    "priority_action": "Add 200g of broccoli or spinach to tomorrow's dinner."
  }
}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Error: GOOGLE_API_KEY not set` | Check your `.env` file and make sure `GOOGLE_API_KEY` has a valid value. |
| Web Speech API does not work | Use Chrome or Edge and grant microphone permission when prompted. |
| `uv: command not found` | Install uv: `curl -LsSf https://astral.sh/uv/install.sh \| sh`. |
| Nutrition agent returns empty data | Check your internet connection. Google Search grounding requires web access. |
| `ModuleNotFoundError: No module named 'src'` | Run the backend from the `backend/` folder: `cd backend && uv run uvicorn src.main:app`. |
| Frontend cannot connect to backend | Make sure the backend is running on port 8000. Vite automatically proxies `/api` requests. |
| `npm ERR! Could not resolve dependency` | Delete `node_modules` and `package-lock.json`, then run `npm install` again. |
| Pipeline timeout | The agents use Google Search, so the full pipeline can take 30 to 60 seconds. Wait for completion. |
