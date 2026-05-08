# NutriFit AI Interview Brief

## Short Pitch

NutriFit AI is a full-stack AI fitness app that turns a user's natural-language food and training log into a structured daily analysis.

Instead of asking the user to manually enter every food, portion, exercise, set, rep, and weight, the app lets them speak or type normally. The backend then runs a multi-agent AI pipeline that extracts the important information, researches nutrition, estimates training metrics, combines everything into a daily balance, and generates personalized coaching advice.

A simple way to explain it:

> "The app uses a five-agent AI workflow. Each agent has a specific responsibility: one parses the user's input, one analyzes nutrition, one analyzes training, one consolidates the numbers, and one turns the result into expert-style advice. The frontend streams progress while those agents run and then displays the final result as a dashboard."

## The AI Part In One Diagram

```text
User transcript
  |
  v
1. Voice Intake Agent
  - extracts meals
  - extracts exercises
  - estimates missing quantities/durations
  |
  v
2. Nutrition Researcher Agent
  - looks up nutrition data
  - handles recipes by decomposing ingredients
  - returns calories/macros/micronutrients
  |
  v
3. Training Analyst Agent
  - calculates workout volume
  - estimates calories burned
  - estimates METs and 1RM
  |
  v
4. Data Consolidator Agent
  - combines food + training
  - calculates calorie balance
  - calculates macro ratio and quality score
  |
  v
5. Expert Advisor Agent
  - interprets the result
  - gives recommendations
  - gives one priority action
```

## How The Agents Work

The backend uses Google ADK's `SequentialAgent`. That means the agents run one after another in a fixed order.

The important idea is that each agent produces structured JSON, and later agents can use the previous context. The backend then validates the outputs with Pydantic models.

So the AI system is not just "one prompt that answers everything." It is a pipeline:

- each agent has its own prompt
- each agent has a clear role
- each output has an expected schema
- the backend parses and validates the result
- the frontend receives a predictable final response

This is the main technical point to emphasize in an interview.

## The Five Agents Explained Simply

### 1. Voice Intake Agent

This agent receives the raw transcript from the user.

Example:

```text
I ate rice with chicken and trained bench press 4x10 at 80kg.
```

It turns that into structured data:

- meal: rice with chicken
- recipe: yes
- estimated quantity: one plate
- exercise: bench press
- details: 4 sets of 10 reps at 80kg

This step is important because everything after it depends on having clean structured input.

### 2. Nutrition Researcher Agent

This agent takes the meals and estimates their nutritional values.

For a simple food, it can search directly. For a recipe, it breaks it into ingredients.

Example:

```text
rice with chicken
```

becomes something like:

```text
cooked rice + chicken breast + olive oil + vegetables
```

Then it estimates:

- calories
- protein
- carbs
- fat
- fiber
- sugar
- sodium
- micronutrients

This agent uses Google Search through ADK, so it is grounded in external nutrition information instead of only relying on the model's memory.

### 3. Training Analyst Agent

This agent analyzes the workout.

For strength exercises, it calculates:

- total volume: sets x reps x weight
- estimated one-rep max using the Epley formula
- estimated calories burned
- duration and intensity

For cardio, it uses MET values to estimate energy expenditure.

Example:

```text
bench press 4x10 at 80kg
```

volume:

```text
4 x 10 x 80 = 3,200 kg
```

This makes the app more useful than a basic calorie tracker because it understands training performance, not just food.

### 4. Data Consolidator Agent

This agent combines the nutrition and training outputs.

It calculates:

- total calories eaten
- calories burned from training
- estimated BMR/TDEE if the user profile is available
- net calorie balance
- protein per kg
- macro distribution
- nutrition quality score

This is the agent that turns separate data points into a full daily picture.

### 5. Expert Advisor Agent

This final agent acts like a sports nutrition coach.

It does not just repeat numbers. It interprets them and gives:

- what the user did well
- what needs improvement
- concrete recommendations
- an overall score
- one priority action for tomorrow

This is the part that makes the output feel like coaching instead of a spreadsheet.

## How Everything Is Connected Technically

The frontend sends a request to:

```text
POST /api/analyze
```

The request contains:

```json
{
  "transcript": "user's food and training description",
  "user_profile": {
    "weight_kg": 78,
    "height_cm": 178,
    "age": 30,
    "sex": "male",
    "goal": "recomposition"
  }
}
```

The backend creates a prompt from that information and sends it into the sequential agent pipeline.

While the agents are running, the backend streams progress events to the frontend using Server-Sent Events:

```text
Parsing input...
Researching nutrition...
Analyzing training...
Consolidating data...
Generating recommendations...
```

When the pipeline finishes, the backend sends the final validated result:

```text
intake + nutrition + training + consolidated daily balance + advice
```

The frontend renders that data into:

- macro chart
- calorie balance
- quality score
- food table
- training table
- expert advice cards

## Interview Talking Points

Use these points if you need to explain the AI architecture confidently:

- "The app uses a multi-agent architecture instead of one big prompt."
- "Each agent is specialized and has a strict output contract."
- "The backend validates agent outputs with Pydantic before sending data to the frontend."
- "The nutrition and training agents use Google Search through ADK for grounded estimates."
- "The pipeline streams progress with SSE, so the user sees what the AI is doing step by step."
- "The final output is not raw LLM text; it becomes structured data that the UI can render."
- "The architecture makes it easier to debug because if nutrition is wrong, you know which agent to inspect."
- "The system can be extended by adding new agents, for example hydration, supplementation, or sleep recovery."

## Good Interview Explanation

Here is a polished answer you can reuse:

> "The AI part is built as a sequential multi-agent pipeline using Google ADK. The first agent parses the user's natural-language transcript into structured meals and exercises. Then a nutrition agent researches the foods and estimates calories and macros. A training agent calculates workout metrics like volume, calories burned, MET values, and estimated 1RM. After that, a consolidation agent combines nutrition and training into a daily balance, including macro ratio, net calories, and quality score. Finally, an expert advisor agent turns the numbers into personalized recommendations. The backend validates each step with Pydantic models and streams progress to the React frontend using Server-Sent Events."

## If They Ask Why Multi-Agent

Say:

> "We used multiple agents because each step has a different kind of reasoning. Parsing natural language, researching nutrition, calculating training metrics, and giving coaching advice are different tasks. Splitting them makes the prompts clearer, the outputs easier to validate, and the system easier to debug or extend."

## If They Ask What You Worked On

A strong and honest answer:

> "I worked on understanding, documenting, and being able to explain the architecture end to end. I focused especially on the AI pipeline: how the agents are structured, how data flows between them, how their outputs are validated, and how the frontend consumes the final result. I can explain the system from the user input all the way to the final dashboard."

If you want to talk more actively:

> "My focus was the AI workflow and product understanding: mapping the multi-agent pipeline, clarifying the data contracts, and making sure the project could be explained clearly from both a technical and user perspective."

## Risks And Tradeoffs To Mention

Good interviewers like when you understand limitations too.

Mention these:

- LLMs can produce malformed JSON, so output validation is important.
- Nutrition data is estimated, not medically exact.
- Full functionality depends on Google/Gemini API access.
- The frontend currently assumes successful validated data, so better error handling could be added.
- The architecture is sequential, which is simple and debuggable, but nutrition and training could potentially run in parallel in a future version.

## One-Minute Version

> "NutriFit AI is a voice/text-based nutrition and training analysis app. The user describes their day naturally, and the backend runs a five-step AI agent pipeline. The first agent structures the transcript, the second estimates nutrition, the third analyzes training, the fourth consolidates everything into calorie and macro balance, and the fifth generates coaching advice. The backend uses FastAPI, Google ADK, Pydantic validation, and SSE streaming. The frontend is React and shows live progress while the agents run, then renders the result as charts, tables, and recommendation cards."
