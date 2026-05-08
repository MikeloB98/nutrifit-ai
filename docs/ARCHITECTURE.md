# NutriFit AI — System Architecture

## Overview

NutriFit AI uses a **sequential pipeline of five AI agents**. Each agent specializes in one task and passes its result to the next step. This modular architecture makes the system easier to understand, debug, extend, and improve.

The architecture is designed to:

- Separate responsibilities clearly.
- Debug each agent independently.
- Replace or improve individual agents without rewriting the whole system.
- Add more agents in the future, such as hydration, supplementation, or sleep recovery agents.

---

## Pipeline Diagram

```text
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│  Voice Intake   │────→│ Nutrition Researcher │────→│  Training Analyst    │
│  Agent          │     │ Agent                │     │ Agent                │
│                 │     │                      │     │                      │
│ Input: text     │     │ Input: MealItem[]    │     │ Input: ExerciseItem[]│
│ Output:         │     │ Output:              │     │ Output:              │
│  IntakeOutput   │     │  NutritionOutput     │     │  TrainingOutput      │
│  (meals +       │     │  (food analysis +    │     │  (calories, volume,  │
│   exercises)    │     │   daily total)       │     │   1RM, METs)         │
└─────────────────┘     └─────────────────────┘     └──────────────────────┘
                                                              │
                        ┌─────────────────────┐     ┌────────┴─────────────┐
                        │  Expert Advisor     │←────│  Data Consolidator   │
                        │  Agent              │     │  Agent               │
                        │                     │     │                      │
                        │ Input:              │     │ Input: NutritionOut  │
                        │  ConsolidatedTable  │     │  + TrainingOutput    │
                        │ Output:             │     │ Output:              │
                        │  AdvisorOutput      │     │  ConsolidatedTable   │
                        │  (advice, score,    │     │  (balance, macros,   │
                        │   recommendations)  │     │   score, charts)     │
                        └─────────────────────┘     └──────────────────────┘
```

---

## Agents and Why They Exist

### Agent 1: Voice Intake

**Problem:** The user's input is free-form, unstructured, and potentially ambiguous.

**Solution:** A dedicated agent parses and structures the input. It separates meals from exercises, detects compound recipes, extracts quantities, and preserves the original text.

**Tools:** None. It relies on the LLM for natural-language understanding.

### Agent 2: Nutrition Researcher

**Problem:** Nutrition values vary by source, preparation method, and serving size. The system should avoid purely invented nutrition data.

**Solution:** A specialized agent uses Google Search to find real-world nutrition references, decomposes recipes into ingredients, and aggregates values from trusted sources.

**Tools:** `google_search` through ADK grounding.

### Agent 3: Training Analyst

**Problem:** Calorie burn and performance metrics require exercise science assumptions such as MET values, strength volume, and one-rep max formulas.

**Solution:** A training-focused agent searches for MET values when needed and applies standard formulas such as the Epley 1RM estimate.

**Tools:** `google_search`.

### Agent 4: Data Consolidator

**Problem:** Nutrition and training data are useful separately, but the user needs a complete daily picture.

**Solution:** This agent combines nutrition and training outputs, calculates calorie balance, macro distribution, protein per kg, nutrition quality score, and chart-ready data.

**Tools:** None. It works from previous agent outputs and optional user profile data.

### Agent 5: Expert Advisor

**Problem:** Numbers alone are not actionable. The user needs interpretation and concrete next steps.

**Solution:** This agent behaves like a sports nutrition expert. It interprets the consolidated data and generates specific, motivating, evidence-based recommendations.

**Tools:** None. It uses its system prompt and the consolidated analysis as context.

---

## Data Flow Between Agents

The ADK `SequentialAgent` runs every agent in order. Earlier agents write their outputs as JSON text, and later agents can read the previous context from the session history.

```python
pipeline_agent = SequentialAgent(
    name="nutrifit_pipeline",
    sub_agents=[
        voice_intake_agent,          # writes IntakeOutput as JSON
        nutrition_researcher_agent,  # reads IntakeOutput and writes NutritionOutput
        training_analyst_agent,      # reads IntakeOutput and writes TrainingOutput
        data_consolidator_agent,     # reads NutritionOutput + TrainingOutput and writes ConsolidatedTable
        expert_advisor_agent,        # reads ConsolidatedTable and writes AdvisorOutput
    ],
)
```

Validation happens in `pipeline.py` after the pipeline finishes. The backend parses each agent's text output and validates it against the corresponding Pydantic model.

The mapping is:

```text
voice_intake_agent          -> IntakeOutput
nutrition_researcher_agent  -> NutritionOutput
training_analyst_agent      -> TrainingOutput
data_consolidator_agent     -> ConsolidatedTable
expert_advisor_agent        -> AdvisorOutput
```

---

## Adding a New Agent to the Pipeline

1. **Create the Pydantic model** in `backend/src/models/new_agent.py`:

   ```python
   from pydantic import BaseModel

   class NewOutput(BaseModel):
       field: str
       value: float
   ```

2. **Create the agent** in `backend/src/agents/new_agent.py`:

   ```python
   from google.adk import Agent
   from src.config import get_model_name
   from src.models.new_agent import NewOutput

   new_agent = Agent(
       name="new_agent",
       model=get_model_name(),
       instruction="Your system prompt here...",
       output_schema=NewOutput,
   )
   ```

3. **Add the agent to the pipeline** in `backend/src/pipeline.py`:

   ```python
   from src.agents.new_agent import new_agent

   pipeline_agent = SequentialAgent(
       name="nutrifit_pipeline",
       sub_agents=[..., new_agent],  # add it at the appropriate point
   )
   ```

4. **Add the parser** in `_parse_agent_outputs` in `pipeline.py`:

   ```python
   ("new_agent", "new_key", NewOutput),
   ```

5. **Update the frontend** if the new agent produces data that should be shown in the dashboard.

---

## Changing the LLM Model

### Option 1: Change the Gemini Model

Edit `.env`:

```env
GEMINI_MODEL=gemini-2.5-pro
```

### Option 2: Use an Open-Source Model

1. Install LiteLLM:

   ```bash
   cd backend
   uv add litellm
   ```

2. Edit `.env`:

   ```env
   LLM_PROVIDER=litellm
   LITELLM_MODEL=ollama/llama3.1
   LITELLM_BASE_URL=http://localhost:11434
   ```

3. Adapt the model configuration if needed for the selected provider.

Important note: the agents that use `google_search`, currently Nutrition Researcher and Training Analyst, depend on Gemini/ADK grounding. If you switch to a local or open-source model, you need to replace `google_search` with another search tool such as SerpAPI, Tavily, or a custom retrieval service.

---

## Design Decisions

### Why Google ADK?

- Native agent orchestration through `SequentialAgent` and `ParallelAgent`.
- Direct integration with Gemini and Google Search grounding.
- Built-in session handling through `InMemorySessionService`.
- Support for structured output through `output_schema`.

### Why Pydantic v2?

- Strict and fast data validation between agents.
- Native JSON serialization and deserialization.
- Good integration with FastAPI request and response models.
- Convenient `model_dump()` and `model_validate()` APIs.

### Why SSE Instead of WebSockets?

- **One-way communication:** The flow is backend to frontend for pipeline progress. The app does not need bidirectional messaging.
- **Simplicity:** SSE works over standard HTTP and does not require a protocol upgrade.
- **Compatibility:** SSE works well with common proxies, load balancers, and deployment setups.
- **Automatic reconnection:** Browser EventSource can reconnect automatically, although this frontend currently parses the stream manually from `fetch`.

### Why Five Agents Instead of One?

- **Specialization:** Each agent has a focused system prompt for one type of reasoning.
- **Debugging:** If nutrition values are wrong, inspect the Nutrition Researcher agent. If training estimates are wrong, inspect the Training Analyst agent.
- **Future parallelization:** Nutrition and training analysis could eventually run in parallel because they both depend mainly on the intake output.
- **Reusability:** Each agent can be improved or reused independently.

---

## Important Runtime Notes

- `run_pipeline_streaming()` creates a fresh `InMemorySessionService` per request to avoid cross-request context contamination.
- Agent outputs are captured as text and parsed as JSON after the ADK run finishes.
- `_try_parse_json()` handles common LLM formatting issues, such as JSON wrapped in Markdown code fences.
- If parsing fails, the backend stores the raw output and parse error for that agent.
- The frontend currently assumes the final result has the expected validated shape, so frontend error handling could be improved for parse-error cases.
