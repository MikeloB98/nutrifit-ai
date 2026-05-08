import { useCallback, useState } from "react";
import type { AnalyzeResult, ProgressEvent, UserProfile } from "./api/client";
import { analyzeDay } from "./api/client";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { VoiceRecorder } from "./components/VoiceRecorder";
import { Profile } from "./pages/Profile";
import { Results } from "./pages/Results";

type View = "home" | "results";

function App() {
  const [view, setView] = useState<View>("home");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ProgressEvent | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("nutrifit_profile");
    return saved ? JSON.parse(saved) : {};
  });

  const handleProfileChange = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem("nutrifit_profile", JSON.stringify(profile));
  }, []);

  const handleAnalyze = useCallback(
    async (transcript: string) => {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setCurrentStep(null);

      try {
        const data = await analyzeDay(
          { transcript, user_profile: userProfile },
          (progress) => setCurrentStep(progress),
        );
        setResult(data);
        setView("results");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
        setCurrentStep(null);
      }
    },
    [userProfile],
  );

  const handleBack = useCallback(() => {
    setView("home");
    setResult(null);
    setError(null);
  }, []);

  if (view === "results" && result) {
    return <Results data={result} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold tracking-tight">
          Nutri<span className="text-lime-accent">Fit</span> AI
        </span>
        <button
          onClick={() => setShowProfile(true)}
          className="px-3 py-1.5 rounded-lg text-sm bg-dark-surface border border-dark-border text-dark-muted hover:text-dark-text transition-colors"
        >
          Perfil
        </button>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-text mb-3 tracking-tight">
            Nutri<span className="text-lime-accent">Fit</span> AI
          </h1>
          <p className="text-dark-muted text-lg max-w-md mx-auto">
            Dile a tu coach lo que has comido y entrenado hoy. Recibe un analisis completo
            al instante.
          </p>
        </div>

        {isLoading ? (
          <ProgressIndicator currentStep={currentStep} />
        ) : (
          <VoiceRecorder onTranscriptReady={handleAnalyze} disabled={isLoading} />
        )}

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md">
            {error}
          </div>
        )}
      </main>

      {/* Profile modal */}
      {showProfile && (
        <Profile
          profile={userProfile}
          onChange={handleProfileChange}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default App;
