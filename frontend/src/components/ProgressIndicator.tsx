import type { ProgressEvent } from "../api/client";

interface ProgressIndicatorProps {
  currentStep: ProgressEvent | null;
}

const STEPS = [
  { agent: "voice_intake_agent", label: "Parseando entrada", icon: "1" },
  { agent: "nutrition_researcher_agent", label: "Investigando nutricion", icon: "2" },
  { agent: "training_analyst_agent", label: "Analizando entreno", icon: "3" },
  { agent: "data_consolidator_agent", label: "Consolidando datos", icon: "4" },
  { agent: "expert_advisor_agent", label: "Generando consejos", icon: "5" },
];

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const currentIndex = currentStep
    ? STEPS.findIndex((s) => s.agent === currentStep.agent)
    : -1;

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((step, i) => {
          const isActive = i === currentIndex;
          const isDone = i < currentIndex;

          return (
            <div key={step.agent} className="flex items-center flex-1 last:flex-0">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-lime-accent text-gray-900 scale-110 shadow-lg shadow-lime-accent/30"
                      : isDone
                        ? "bg-lime-accent/20 text-lime-accent"
                        : "bg-dark-surface text-dark-muted border border-dark-border"
                  }`}
                >
                  {isDone ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1.5 text-center leading-tight w-20 ${
                    isActive ? "text-lime-accent font-medium" : "text-dark-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2 mt-[-18px]">
                  <div
                    className={`h-full transition-colors duration-300 ${
                      isDone ? "bg-lime-accent/40" : "bg-dark-border"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentStep && (
        <div className="text-center animate-fade-in">
          <p className="text-dark-muted text-sm">{currentStep.message}</p>
          <div className="mt-3 flex justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-lime-accent animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-lime-accent animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-lime-accent animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
    </div>
  );
}
