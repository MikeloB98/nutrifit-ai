import { useCallback } from "react";
import type { UserProfile } from "../api/client";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { useAnalysis } from "../hooks/useAnalysis";

interface HomeProps {
  userProfile?: UserProfile;
  onResult: () => void;
}

export function Home({ userProfile, onResult }: HomeProps) {
  const { isLoading, error, currentStep, analyze } = useAnalysis();

  const handleTranscript = useCallback(
    async (text: string) => {
      await analyze(text, userProfile);
      onResult();
    },
    [analyze, userProfile, onResult],
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-dark-text mb-3 tracking-tight">
          Nutri<span className="text-lime-accent">Fit</span> AI
        </h1>
        <p className="text-dark-muted text-lg max-w-md mx-auto">
          Dile a tu coach lo que has comido y entrenado hoy. Recibe un analisis completo al
          instante.
        </p>
      </div>

      {isLoading ? (
        <ProgressIndicator currentStep={currentStep} />
      ) : (
        <VoiceRecorder onTranscriptReady={handleTranscript} disabled={isLoading} />
      )}

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md">
          {error}
        </div>
      )}
    </div>
  );
}
