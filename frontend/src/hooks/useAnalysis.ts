import { useCallback, useState } from "react";
import {
  type AnalyzeResult,
  type ProgressEvent,
  type UserProfile,
  analyzeDay,
} from "../api/client";

interface UseAnalysisReturn {
  result: AnalyzeResult | null;
  isLoading: boolean;
  error: string | null;
  currentStep: ProgressEvent | null;
  analyze: (transcript: string, profile?: UserProfile) => Promise<void>;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ProgressEvent | null>(null);

  const analyze = useCallback(
    async (transcript: string, profile?: UserProfile) => {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setCurrentStep(null);

      try {
        const data = await analyzeDay(
          { transcript, user_profile: profile },
          (progress) => setCurrentStep(progress),
        );
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
        setCurrentStep(null);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setCurrentStep(null);
  }, []);

  return { result, isLoading, error, currentStep, analyze, reset };
}
