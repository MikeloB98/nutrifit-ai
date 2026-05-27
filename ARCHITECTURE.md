# NutriFit AI Architecture

NutriFit AI is a full-stack app that turns a free-form food and training log into a structured daily nutrition and exercise analysis.

The backend uses FastAPI and Google ADK to run a sequential pipeline of five specialized AI agents. The frontend is a React/Vite dashboard that accepts typed or dictated input, streams pipeline progress with Server-Sent Events, and renders the final nutrition, training, balance, and advice results.

## Pipeline

```text
Voice/Text Input
  -> Voice Intake Agent
  -> Nutrition Researcher Agent
  -> Training Analyst Agent
  -> Data Consolidator Agent
  -> Expert Advisor Agent
  -> React Results Dashboard
```

## Agent Responsibilities

### Voice Intake Agent

Parses the user's natural-language input into structured meals and exercises. It preserves the raw text while extracting names, quantities, exercise details, and duration when available.

### Nutrition Researcher Agent

Estimates calories, macronutrients, and micronutrients for each food item. It can use Google Search grounding through ADK to reduce purely invented nutrition values.

### Training Analyst Agent

Analyzes exercises, estimates calories burned, classifies training type, and calculates strength metrics such as training volume and estimated one-rep max when enough information is available.

### Data Consolidator Agent

Combines nutrition and training outputs into a daily summary. It calculates calorie balance, macro ratios, protein per kg, chart-ready totals, and a nutrition quality score.

### Expert Advisor Agent

Turns the structured daily analysis into practical sports-nutrition feedback: what went well, what needs improvement, recommendations, an overall score, a motivational note, and one priority action.

## Backend Flow

The API entry point is `backend/src/main.py`. The main analysis endpoint receives a transcript and optional user profile, then streams progress and final data back to the frontend.

The pipeline orchestration lives in `backend/src/pipeline.py`. Each agent writes JSON-like output, and the backend validates the final parsed data with Pydantic models from `backend/src/models/`.

## Frontend Flow

The React app collects user input from the home screen, optionally enriches it with profile data, and calls the backend through `frontend/src/api/client.ts`.

Pipeline progress is rendered while the backend runs. When the final event arrives, the results page displays nutrition tables, training tables, macro charts, calorie balance, quality scoring, and expert advice cards.

## Key Design Choices

- FastAPI provides a small HTTP/SSE API surface for the backend.
- Server-Sent Events fit the one-way progress stream from backend to frontend.
- Pydantic models define the API and agent-output contracts.
- Google ADK provides sequential agent orchestration and Gemini/Search grounding support.
- The agent pipeline is modular so individual analysis stages can be replaced or extended without rewriting the full app.
