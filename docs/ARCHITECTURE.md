# NutriFit AI — Arquitectura del Sistema

## Vision General

NutriFit AI usa un **pipeline secuencial de 5 agentes de IA**, donde cada agente se especializa en una tarea y pasa su resultado al siguiente. Esta arquitectura modular permite:

- Separar responsabilidades claramente.
- Depurar cada agente de forma independiente.
- Reemplazar o mejorar agentes individuales sin afectar al resto.
- Escalar a mas agentes en el futuro (e.g., un agente de hidratacion o de suplementacion).

---

## Diagrama del Pipeline

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│  Voice Intake   │────→│ Nutrition Researcher │────→│  Training Analyst    │
│  Agent          │     │ Agent                │     │  Agent               │
│                 │     │                      │     │                      │
│ Input: texto    │     │ Input: MealItem[]    │     │ Input: ExerciseItem[]│
│ Output:         │     │ Output:              │     │ Output:              │
│  IntakeOutput   │     │  NutritionOutput     │     │  TrainingOutput      │
│  (meals +       │     │  (analisis por       │     │  (calorias, volumen, │
│   exercises)    │     │   alimento + total)  │     │   1RM, METs)         │
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
                        │  (consejos, nota,   │     │  (balance, macros,   │
                        │   recomendaciones)  │     │   score, charts)     │
                        └─────────────────────┘     └──────────────────────┘
```

---

## Agentes — Por que cada uno existe

### Agent 1: Voice Intake

**Problema:** La entrada del usuario es texto libre, desestructurado, potencialmente ambiguo.

**Solucion:** Un agente dedicado a parsear y estructurar la entrada, separando comidas de ejercicios, detectando recetas compuestas, y extrayendo cantidades.

**Sin tools:** Solo usa el LLM para comprension de lenguaje natural.

### Agent 2: Nutrition Researcher

**Problema:** Los valores nutricionales cambian segun la fuente, la preparacion, y la porcion. No queremos datos inventados.

**Solucion:** Un agente con acceso a Google Search que busca datos reales en internet, descompone recetas en ingredientes, y agrega valores de fuentes fiables.

**Tools:** `google_search` (Grounding de ADK).

### Agent 3: Training Analyst

**Problema:** Calcular gasto calorico requiere conocer METs, formulas de 1RM, y estimaciones por tipo de ejercicio.

**Solucion:** Un agente especializado que busca datos de MET en internet y aplica formulas estandar de ciencia del deporte.

**Tools:** `google_search`.

### Agent 4: Data Consolidator

**Problema:** Los datos de nutricion y entrenamiento estan separados y necesitan cruzarse para generar un panorama completo.

**Solucion:** Un agente que combina ambas salidas, calcula el balance calorico, distribucion de macros, puntuacion de calidad, y prepara datos para graficos.

**Sin tools:** Trabaja solo con los datos de los agentes anteriores.

### Agent 5: Expert Advisor

**Problema:** Los numeros solos no son accionables. El usuario necesita interpretacion y recomendaciones concretas.

**Solucion:** Un agente con personalidad de nutricionista deportivo que interpreta los datos consolidados y genera consejos especificos, motivadores y evidence-based.

**Sin tools:** Usa su system prompt como base de conocimiento experto.

---

## Flujo de Datos entre Agentes

Cada agente en el pipeline de ADK (`SequentialAgent`) puede ver el historial completo de la sesion. Los agentes anteriores escriben su salida como contenido de texto en formato JSON, y los agentes posteriores pueden leerlo del contexto de la conversacion.

```python
pipeline_agent = SequentialAgent(
    name="nutrifit_pipeline",
    sub_agents=[
        voice_intake_agent,          # → escribe IntakeOutput como JSON
        nutrition_researcher_agent,  # → lee IntakeOutput, escribe NutritionOutput
        training_analyst_agent,      # → lee IntakeOutput, escribe TrainingOutput
        data_consolidator_agent,     # → lee NutritionOutput + TrainingOutput, escribe ConsolidatedTable
        expert_advisor_agent,        # → lee ConsolidatedTable, escribe AdvisorOutput
    ],
)
```

La validacion entre agentes se hace en `pipeline.py` al final del pipeline, parseando la salida de texto de cada agente a sus modelos Pydantic correspondientes.

---

## Como añadir un nuevo agente al pipeline

1. **Crea el modelo Pydantic** en `backend/src/models/nuevo_agente.py`:
   ```python
   from pydantic import BaseModel

   class NuevoOutput(BaseModel):
       campo: str
       valor: float
   ```

2. **Crea el agente** en `backend/src/agents/nuevo_agente.py`:
   ```python
   from google.adk import Agent
   from src.config import get_model_name
   from src.models.nuevo_agente import NuevoOutput

   nuevo_agent = Agent(
       name="nuevo_agent",
       model=get_model_name(),
       instruction="Tu system prompt aqui...",
       output_schema=NuevoOutput,
   )
   ```

3. **Añade el agente al pipeline** en `backend/src/pipeline.py`:
   ```python
   from src.agents.nuevo_agente import nuevo_agent

   pipeline_agent = SequentialAgent(
       name="nutrifit_pipeline",
       sub_agents=[..., nuevo_agent],  # añadir al final o donde corresponda
   )
   ```

4. **Añade el parser** en la funcion `_parse_agent_outputs` de `pipeline.py`:
   ```python
   ("nuevo_agent", "nuevo_key", NuevoOutput),
   ```

5. **Actualiza el frontend** para mostrar los datos del nuevo agente en el dashboard.

---

## Como cambiar el modelo LLM

### Opcion 1: Cambiar el modelo de Gemini

Edita `.env`:
```env
GEMINI_MODEL=gemini-2.5-pro
```

### Opcion 2: Usar un modelo open source

1. Instala LiteLLM: `cd backend && uv add litellm`
2. Edita `.env`:
   ```env
   LLM_PROVIDER=litellm
   LITELLM_MODEL=ollama/llama3.1
   LITELLM_BASE_URL=http://localhost:11434
   ```
3. Adapta `config.py` para instanciar el modelo via LiteLLM en vez de directamente.

**Nota:** Los agentes que usan `google_search` (Agent 2 y 3) dependen de Gemini para el Grounding. Si cambias a un modelo open source, necesitaras reemplazar `google_search` por otra herramienta de busqueda (e.g., SerpAPI, Tavily).

---

## Decisiones de Diseño

### ¿Por que Google ADK?

- Orquestacion nativa de agentes con `SequentialAgent`, `ParallelAgent`.
- Integracion directa con Gemini y Google Search (Grounding).
- Gestion de sesiones integrada (`InMemorySessionService`).
- Soporte para `output_schema` que fuerza salida estructurada.

### ¿Por que Pydantic v2?

- Validacion de datos estricta y rapida entre agentes.
- Serializacion/deserializacion JSON nativa.
- Integracion con FastAPI para validacion de requests/responses.
- `model_dump()` y `model_validate()` para conversion facil.

### ¿Por que SSE en vez de WebSockets?

- **Unidireccional:** El flujo es servidor → cliente (progreso del pipeline). No necesitamos bidireccionalidad.
- **Simplicidad:** SSE funciona sobre HTTP estandar, no requiere upgrade de protocolo.
- **Compatibilidad:** Funciona con proxies, load balancers y CDNs sin configuracion especial.
- **Reconexion automatica:** El EventSource del navegador reconecta automaticamente si se pierde la conexion.

### ¿Por que separar en 5 agentes en vez de usar uno solo?

- **Especializacion:** Cada agente tiene un system prompt optimizado para su tarea.
- **Debugging:** Si los datos nutricionales estan mal, sabes que es el Agent 2.
- **Paralelizacion futura:** Agent 2 y 3 podrian ejecutarse en paralelo (no dependen entre si).
- **Reusabilidad:** Cada agente puede usarse de forma independiente en otros contextos.
