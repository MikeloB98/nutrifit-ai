# NutriFit AI Codebase Overview

## 1. What This Project Is

NutriFit AI is a full-stack web application that analyzes a user's daily nutrition and physical training from a natural-language transcript. The user can speak or type what they ate and how they trained, and the system turns that free-form input into structured nutrition data, training metrics, calorie balance, visual charts, and personalized coaching advice.

The core product idea is simple:

```text
Voice or text input
-> AI parsing
-> nutrition research
-> training analysis
-> daily consolidation
-> expert recommendations
-> dashboard
```

The backend is built around a sequential pipeline of five AI agents. Each agent has a specialized role and passes its output to the next step. The frontend provides the user interface: voice capture, profile management, progress feedback, and the final dashboard.

This is not a generic calorie tracker where the user manually searches for foods. The app is designed around natural input: "I ate rice with chicken and trained bench press 4x10 at 80kg." The AI pipeline interprets that input and produces the analysis.

## 2. System Architecture

NutriFit AI has two main runtime systems:

- `backend/`: Python FastAPI service using Google ADK agents, Pydantic models, and Server-Sent Events.
- `frontend/`: React + Vite + TypeScript client with speech recognition and dashboard components.

At a high level, the architecture looks like this:

```text
Browser
  |
  | User speaks or types transcript
  v
React frontend
  |
  | POST /api/analyze
  v
FastAPI backend
  |
  | SequentialAgent pipeline
  v
5 AI agents
  |
  | validated JSON result streamed through SSE
  v
React dashboard
```

The frontend and backend communicate through `/api/analyze`. That endpoint returns a Server-Sent Events stream instead of a normal one-shot JSON response. This lets the frontend show live progress as each AI agent starts working.

The backend validates the final outputs with Pydantic models before sending the result to the frontend. This gives the app clear contracts for meals, nutrition, training, consolidated daily data, and expert advice.

## 3. Repository Structure

The repository is organized into backend, frontend, documentation, and root-level helper scripts.

```text
nutrifit-ai/
├── backend/
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── src/
│   │   ├── main.py
│   │   ├── pipeline.py
│   │   ├── config.py
│   │   ├── agents/
│   │   ├── models/
│   │   └── utils/
│   └── tests/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── api/
│       ├── components/
│       ├── hooks/
│       └── pages/
├── docs/
│   ├── README.md
│   ├── GUIDE.md
│   ├── ARCHITECTURE.md
│   └── CODEBASE_OVERVIEW.md
├── .env.example
├── Makefile
└── run.sh
```

Important backend files:

- `backend/src/main.py`: FastAPI app and HTTP/SSE endpoints.
- `backend/src/pipeline.py`: orchestration of the five-agent Google ADK pipeline.
- `backend/src/config.py`: environment-driven model and server configuration.
- `backend/src/agents/`: one module per AI agent.
- `backend/src/models/`: Pydantic contracts for all major data shapes.
- `backend/tests/test_e2e.py`: health, model validation, and API tests.

Important frontend files:

- `frontend/src/App.tsx`: main application state and view switching.
- `frontend/src/api/client.ts`: typed API client and SSE stream parser.
- `frontend/src/hooks/useSpeechRecognition.ts`: browser speech recognition wrapper.
- `frontend/src/pages/Profile.tsx`: user profile modal.
- `frontend/src/pages/Results.tsx`: dashboard composition.
- `frontend/src/components/`: reusable dashboard/input/progress components.
- `frontend/src/index.css`: Tailwind v4 theme and global styles.

Root-level helpers:

- `Makefile`: shortcuts for install, dev, test, and clean commands.
- `run.sh`: checks dependencies, installs packages, creates `.env` if needed, and starts both servers.
- `.env.example`: template for Google/Gemini, optional LiteLLM, and server settings.

## 4. End-to-End User Flow

The user flow starts in the browser.

1. The user opens the frontend.
2. The user either clicks the microphone and speaks, or types directly into the transcript box.
3. The transcript appears in the text area and can be edited before submission.
4. The user can optionally open the profile modal and save weight, height, age, sex, activity level, and goal.
5. The profile is stored in the browser's `localStorage` under `nutrifit_profile`.
6. When the user clicks "Analizar mi dia", the frontend sends the transcript and profile to the backend.
7. The backend starts the AI pipeline and streams progress events as each agent becomes active.
8. The frontend shows a five-step progress indicator.
9. When the backend emits the final `complete` event, the frontend switches to the results dashboard.
10. The dashboard displays macro distribution, calorie balance, nutrition quality, food table, training table, and expert advice.

The frontend does not persist completed analyses between sessions. The saved user profile persists locally, but analysis results live in React state and are lost when the page reloads.

## 5. Backend Architecture

The backend is a FastAPI application.

### FastAPI Entry Point

`backend/src/main.py` creates the app and configures CORS. It exposes:

- `GET /api/health`: basic health check returning `{"status": "ok"}`.
- `POST /api/analyze`: starts the AI analysis pipeline and returns an SSE stream.

`/api/analyze` accepts an `AnalyzeRequest`:

```json
{
  "transcript": "He comido arroz con pollo y he entrenado press banca 4x10 a 80kg",
  "user_profile": {
    "weight_kg": 78,
    "height_cm": 178,
    "age": 30,
    "sex": "male",
    "activity_level": "moderate",
    "goal": "recomposition"
  }
}
```

`user_profile` is optional. The app can still run with only a transcript, but calculations that depend on body data are less personalized.

### Pipeline Orchestration

`backend/src/pipeline.py` is the core backend file. It defines a Google ADK `SequentialAgent` named `nutrifit_pipeline`.

The pipeline runs these sub-agents in order:

```python
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
```

For each request, `run_pipeline_streaming()` creates a fresh `InMemorySessionService`. This is important because it avoids conversation history from one analysis contaminating another user's analysis.

The pipeline builds a prompt containing:

- the raw transcript
- optional serialized user profile data

Then it runs the ADK runner asynchronously. As ADK emits events, the backend:

- detects which agent is currently active
- emits a `progress` SSE event for that agent
- captures each agent's text output
- parses each agent output as JSON after the pipeline finishes
- validates parsed JSON with the matching Pydantic model
- emits one final `complete` SSE event

### SSE Events

Progress events look like:

```text
event: progress
data: {"agent":"voice_intake_agent","message":"Parseando entrada de voz..."}
```

The final event contains the complete analysis:

```text
event: complete
data: {"intake": {...}, "nutrition": {...}, "training": {...}, "consolidated": {...}, "advice": {...}}
```

If something fails inside the endpoint event generator, `main.py` emits an `error` event with the exception message.

### JSON Parsing and Validation

Each agent is expected to output valid JSON. `pipeline.py` includes `_try_parse_json()` to handle common LLM formatting issues, such as JSON wrapped in Markdown code fences or explanatory text around the JSON.

After parsing, `_parse_agent_outputs()` validates each output with the correct Pydantic model:

- `voice_intake_agent` -> `IntakeOutput`
- `nutrition_researcher_agent` -> `NutritionOutput`
- `training_analyst_agent` -> `TrainingOutput`
- `data_consolidator_agent` -> `ConsolidatedTable`
- `expert_advisor_agent` -> `AdvisorOutput`

If parsing fails for a specific agent, the backend stores a fallback object containing the raw output and parse error. This is useful for debugging, but it also means the frontend may receive a shape it does not fully expect.

## 6. The 5-Agent AI Pipeline

The backend uses five specialized agents instead of a single large prompt. This makes the system easier to reason about, debug, and extend.

### 1. Voice Intake Agent

File: `backend/src/agents/voice_intake.py`

Purpose: convert free-form user text into structured meals and exercises.

It identifies:

- foods and meals
- whether each meal is a recipe or individual food
- estimated quantities
- exercise names
- exercise details such as sets, reps, weight, duration, and intensity clues
- the date of the analysis

Output model: `IntakeOutput`.

Example output shape:

```json
{
  "meals": [
    {
      "name": "arroz con pollo",
      "is_recipe": true,
      "estimated_quantity": "1 plato",
      "raw_text": "arroz con pollo"
    }
  ],
  "exercises": [
    {
      "name": "press banca",
      "details": "4 series de 10 repeticiones a 80kg",
      "duration_minutes": null,
      "raw_text": "press banca 4x10 a 80kg"
    }
  ],
  "date": "2026-04-10"
}
```

### 2. Nutrition Researcher Agent

File: `backend/src/agents/nutrition_researcher.py`

Purpose: estimate nutritional values for everything the user ate.

This agent uses ADK's `google_search` tool. For individual foods, it searches nutritional values directly. For recipes, it decomposes the dish into likely ingredients and estimates ingredient quantities.

It produces:

- per-food analysis
- ingredient lists
- per-100g nutrient data
- per-serving nutrient data
- calories, protein, carbs, sugar, fiber, fat, sodium, and micronutrients
- daily nutrition totals
- source names such as USDA, BEDCA, MyFitnessPal, or FatSecret

Output model: `NutritionOutput`.

### 3. Training Analyst Agent

File: `backend/src/agents/training_analyst.py`

Purpose: estimate exercise workload, calories burned, and training metrics.

This agent also uses ADK's `google_search` tool, mainly for MET values and exercise-energy estimates.

For strength training, it estimates:

- total volume: sets x reps x weight
- one-rep max using the Epley formula
- training duration when not provided
- calories burned
- MET value
- intensity

For cardio, it estimates:

- MET value
- calories burned using MET x body weight x duration
- intensity classification

Output model: `TrainingOutput`.

### 4. Data Consolidator Agent

File: `backend/src/agents/data_consolidator.py`

Purpose: combine nutrition and training into one daily picture.

It calculates:

- total calories eaten
- calories burned during training
- estimated BMR when profile data is available
- estimated TDEE when activity data is available
- net calorie balance
- total protein, carbs, and fat
- protein per kg when body weight is available
- macro ratios
- fiber and sodium totals
- nutrition quality score from 0 to 100
- chart-ready data
- table-ready meal and training summaries

Output model: `ConsolidatedTable`.

### 5. Expert Advisor Agent

File: `backend/src/agents/expert_advisor.py`

Purpose: turn the numbers into useful coaching advice.

It speaks in Spanish as a direct but motivating sports nutrition expert. It prioritizes body recomposition concepts such as protein intake, calorie balance, food quality, training volume, recovery, and adherence.

It produces:

- what the user did well
- what needs improvement
- concrete recommendations
- an overall letter score
- one motivational note
- one priority action for tomorrow

Output model: `AdvisorOutput`.

## 7. Data Models and API Contracts

The backend uses Pydantic models as the source of truth for data contracts. The frontend mirrors these types in TypeScript in `frontend/src/api/client.ts`.

### User Profile and API Models

File: `backend/src/models/api.py`

`UserProfile` contains optional personalization data:

- `weight_kg`
- `height_cm`
- `age`
- `sex`
- `activity_level`
- `goal`

`AnalyzeRequest` contains:

- `transcript`
- optional `user_profile`

`AnalyzeResponse` contains:

- `intake`
- `nutrition`
- `training`
- `consolidated`
- `advice`

### Intake Models

File: `backend/src/models/intake.py`

The intake models describe what the user said before any nutrition or training calculations happen.

- `MealItem`: food name, recipe flag, estimated quantity, original text.
- `ExerciseItem`: exercise name, details, optional duration, original text.
- `IntakeOutput`: lists of meals and exercises plus date.

### Nutrition Models

File: `backend/src/models/nutrition.py`

Nutrition data is centered on `NutrientProfile`, which contains:

- calories
- protein
- carbohydrates
- sugar
- fiber
- fat
- saturated, unsaturated, and trans fat
- sodium
- micronutrients

`FoodAnalysis` stores nutrient data for one food or recipe, both per 100g and per serving.

`NutritionOutput` contains all food analyses plus a `daily_total`.

### Training Models

File: `backend/src/models/training.py`

`ExerciseAnalysis` stores:

- original item
- exercise type
- estimated calories burned
- optional strength volume
- optional estimated 1RM
- MET value
- duration
- intensity
- notes

`TrainingOutput` contains all exercise analyses, total calories burned, a summary, and estimated TDEE contribution.

### Consolidated Models

File: `backend/src/models/consolidated.py`

`DailyBalance` is the main summary of the day. It contains:

- calories in
- training calories burned
- optional BMR
- optional TDEE
- net calorie balance
- protein, carbs, and fat
- optional protein per kg
- macro ratio
- nutrition quality score
- fiber
- sodium
- hydration note
- micronutrient highlights

`ConsolidatedTable` contains:

- date
- meal summary rows
- training summary rows
- daily balance
- chart data

### Advisor Models

File: `backend/src/models/advisor.py`

`AdvisorOutput` contains:

- `doing_well`
- `needs_improvement`
- `recommendations`
- `overall_score`
- `motivational_note`
- `priority_action`

This model directly powers the advice cards in the dashboard.

## 8. Frontend Architecture

The frontend is a React app built with Vite and TypeScript.

### App State and Views

File: `frontend/src/App.tsx`

`App.tsx` owns the main application state:

- current view: `home` or `results`
- latest analysis result
- loading state
- error state
- current progress step
- profile modal visibility
- user profile loaded from `localStorage`

When the user starts an analysis, `App.tsx` calls `analyzeDay()` from the API client. While the backend streams progress events, `App.tsx` updates `currentStep`. When the final result arrives, it switches to the results view.

### API Client and SSE Parsing

File: `frontend/src/api/client.ts`

The frontend sends:

```ts
fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(request),
});
```

The response is read as a stream with `response.body.getReader()`. The client parses lines beginning with `data:`.

The client decides whether a parsed message is progress or final data by checking for an `agent` key:

- if the object has `agent`, it is a `ProgressEvent`
- otherwise, it is treated as the final `AnalyzeResult`

This is a lightweight SSE parser tailored to the backend's current event shapes.

### Speech Recognition

File: `frontend/src/hooks/useSpeechRecognition.ts`

This hook wraps the browser Web Speech API:

- `window.SpeechRecognition`
- `window.webkitSpeechRecognition`

It configures recognition as:

- continuous
- interim results enabled
- language set to `es-ES`

The hook exposes:

- current transcript
- whether the browser supports speech recognition
- whether it is currently listening
- start/stop controls
- transcript reset
- manual transcript setter

Chrome and Edge are the best-supported browsers for this feature. If speech recognition is not supported, the user can still type directly into the textarea.

### Voice Input

File: `frontend/src/components/VoiceRecorder.tsx`

This component renders:

- large microphone button
- listening animation
- browser support message
- transcript textarea
- clear button
- analyze button

The component does not call the backend directly. Instead, it calls `onTranscriptReady(text)` when the user clicks analyze.

### Profile Modal

File: `frontend/src/pages/Profile.tsx`

The profile modal lets users enter:

- weight
- height
- age
- sex
- activity level
- goal

`App.tsx` saves the profile to `localStorage`, so the user does not have to re-enter it every time.

### Progress Indicator

File: `frontend/src/components/ProgressIndicator.tsx`

This component displays the same five pipeline steps as the backend:

1. Parse input
2. Research nutrition
3. Analyze training
4. Consolidate data
5. Generate advice

It marks previous steps as complete, highlights the active step, and shows the current backend progress message.

### Results Dashboard

File: `frontend/src/pages/Results.tsx`

The results dashboard composes several smaller components:

- `MacroChart`: protein, carbs, and fat pie chart using Recharts.
- `CalorieBalance`: calories eaten vs calories burned during training.
- `QualityGauge`: nutrition quality score from 0 to 100.
- `NutritionTable`: food-level nutrition rows and daily totals.
- `TrainingTable`: exercise rows and total calories burned.
- `AdvisorCards`: expert feedback, recommendations, score, priority action, and motivational note.

The dashboard expects the backend result to match the TypeScript interfaces in `client.ts`.

## 9. Configuration and Environment Variables

Configuration is defined in `backend/src/config.py` and `.env.example`.

Main variables:

```env
LLM_PROVIDER=gemini
GOOGLE_API_KEY=your-key-here
GEMINI_MODEL=gemini-2.5-flash

BACKEND_PORT=8000
FRONTEND_URL=http://localhost:5173
```

Optional Vertex AI variables are documented in `.env.example`:

```env
GOOGLE_GENAI_USE_VERTEXAI=TRUE
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=europe-west4
```

Optional LiteLLM-related variables are also present:

```env
LITELLM_MODEL=ollama/llama3.1
LITELLM_BASE_URL=http://localhost:11434
```

Current implementation note: `get_model_name()` returns `LITELLM_MODEL` when `LLM_PROVIDER=litellm`, but LiteLLM is not listed as a backend dependency in `pyproject.toml`. Also, the nutrition and training agents use ADK's `google_search` tool, so a non-Gemini path would need replacement search tooling or additional integration work.

Frontend API calls are proxied by Vite:

```ts
server: {
  proxy: {
    "/api": "http://localhost:8000",
  },
}
```

This lets frontend code call `/api/analyze` without hardcoding the backend origin during local development.

## 10. Running the Project

### Prerequisites

The project expects:

- Python 3.13 or newer according to `backend/pyproject.toml`
- Node.js 20 or newer
- `uv` for Python dependency management
- Google API key for real Gemini/Google Search pipeline execution
- Chrome or Edge for the best voice recognition support

### Environment Setup

From the repository root:

```bash
cp .env.example .env
```

Then edit `.env` and set:

```env
GOOGLE_API_KEY=your-real-key
```

### Backend

```bash
cd backend
uv sync
uv run uvicorn src.main:app --reload --port 8000
```

The backend should be available at:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/api/health
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

### Combined Startup

From the repository root:

```bash
chmod +x run.sh
./run.sh
```

`run.sh` checks for `uv` and `node`, creates `.env` from `.env.example` if it is missing, installs backend and frontend dependencies, and starts both servers.

### Makefile Shortcuts

From the repository root:

```bash
make install
make dev-backend
make dev-frontend
make dev
make test
```

`make clean` removes backend `.venv`, frontend `node_modules`, and frontend `dist`.

## 11. Testing

Backend tests live in `backend/tests/test_e2e.py`.

Run them with:

```bash
cd backend
uv run pytest tests/ -v
```

Current test coverage includes:

- `GET /api/health`
- SSE endpoint response status and content type when `GOOGLE_API_KEY` is configured
- analyze endpoint without profile when `GOOGLE_API_KEY` is configured
- analyze endpoint with empty transcript when `GOOGLE_API_KEY` is configured
- Pydantic model validation

Observed local test status:

```text
2 passed, 3 skipped
```

The three skipped tests require `GOOGLE_API_KEY`. Without that key, the full AI pipeline is not executed during tests. The passing tests validate the health endpoint and the core Pydantic model shapes.

## 12. Known Caveats and Implementation Notes

The system works as a clear prototype-style full-stack AI app, but there are important implementation details to understand.

### LLM JSON Output Is Critical

The backend expects each agent to output JSON. `pipeline.py` includes defensive parsing for code fences and embedded JSON, but the frontend ultimately expects the final data to match the normal result shape.

If an agent produces malformed JSON, the backend may include a fallback object with `raw` and `parse_error`. That is useful for debugging, but the current frontend is not built to gracefully render all parse-error cases.

### Full Pipeline Requires Gemini/Google API Access

The real nutrition and training research agents use ADK's `google_search` tool. That means full end-to-end execution depends on Google/Gemini configuration, not just local Python code.

### LiteLLM Is Only Partially Configured

The configuration file can return a LiteLLM model name, and `.env.example` documents LiteLLM variables. However, LiteLLM is not installed as a backend dependency, and agents that rely on Google Search would still need replacement tooling for a fully local/open-source model path.

### Date Handling Comes From the Agent Prompt

The intake agent prompt asks the LLM to return the current date. The server does not currently inject a deterministic date value into the output model. This means date correctness depends on the model following the prompt and having the right temporal context.

### Frontend Assumes Successful Validated Data

Dashboard components call methods like `.toFixed()` on numeric fields. This is fine for normal validated responses, but parse-error fallback objects from the backend could cause rendering problems if they reach the dashboard.

### `useAnalysis` and `Home.tsx` Are Currently Unused

`frontend/src/hooks/useAnalysis.ts` and `frontend/src/pages/Home.tsx` exist and implement analysis-related logic, but `App.tsx` currently manages the home screen and analysis state inline. This is not necessarily harmful, but it is duplicated logic and could be cleaned up later.

### `BACKEND_PORT` Is Configured But Launch Commands Hardcode 8000

`BACKEND_PORT` exists in `.env.example` and `config.py`, but the documented and scripted launch commands use `--port 8000` directly.

## 13. How To Explain This Project To Others

Short explanation:

> NutriFit AI is an AI-powered fitness and nutrition dashboard. You tell it what you ate and how you trained, and it uses a five-agent backend pipeline to turn that natural-language input into nutrition numbers, training metrics, calorie balance, charts, and personalized advice.

Technical explanation:

> The app has a React/Vite frontend and a FastAPI backend. The frontend captures voice or text, stores an optional user profile in localStorage, and sends the transcript to `/api/analyze`. The backend runs a Google ADK `SequentialAgent` pipeline with five specialized agents: intake parsing, nutrition research, training analysis, data consolidation, and expert advising. Each agent outputs JSON, the backend validates those outputs with Pydantic, and progress plus final data are streamed back to the frontend using Server-Sent Events.

Product explanation:

> Instead of making users manually enter every food and exercise, NutriFit AI lets them describe their day naturally. The system handles interpretation, estimation, calculation, and coaching. The result is a dashboard that shows what they consumed, what they burned, how balanced their day was, and what they should do next.

The most important thing to remember is that the app is built around a staged AI workflow. Each agent owns one part of the reasoning process, and the frontend turns the final structured output into a user-friendly dashboard.
