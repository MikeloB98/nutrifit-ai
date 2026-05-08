import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface VoiceRecorderProps {
  onTranscriptReady: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscriptReady, disabled }: VoiceRecorderProps) {
  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechRecognition();

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleAnalyze = () => {
    if (transcript.trim()) {
      onTranscriptReady(transcript.trim());
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Mic button */}
      <div className="relative">
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-lime-accent/20 animate-pulse-ring" />
            <div
              className="absolute inset-0 rounded-full bg-lime-accent/10 animate-pulse-ring"
              style={{ animationDelay: "0.4s" }}
            />
          </>
        )}
        <button
          onClick={handleToggle}
          disabled={disabled || !isSupported}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening
              ? "bg-red-500 hover:bg-red-600 scale-110"
              : "bg-lime-accent hover:bg-lime-accent-dim"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} shadow-lg shadow-lime-accent/20`}
        >
          {isListening ? (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-dark-muted text-sm">
        {!isSupported
          ? "Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge."
          : isListening
            ? "Escuchando... Habla de forma natural"
            : "Pulsa el microfono para empezar a hablar"}
      </p>

      {/* Transcript area */}
      <div className="w-full">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Tu transcripcion aparecera aqui... o escribe directamente."
          rows={5}
          className="w-full bg-dark-surface border border-dark-border rounded-xl p-4 text-dark-text placeholder:text-dark-muted focus:outline-none focus:border-lime-accent/50 resize-none font-[var(--font-display)] text-base transition-colors"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={resetTranscript}
          disabled={!transcript || disabled}
          className="px-5 py-2.5 rounded-lg bg-dark-surface border border-dark-border text-dark-muted hover:text-dark-text hover:border-dark-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Limpiar
        </button>
        <button
          onClick={handleAnalyze}
          disabled={!transcript.trim() || disabled}
          className="px-8 py-2.5 rounded-lg bg-lime-accent text-gray-900 font-semibold hover:bg-lime-accent-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-lime-accent/20"
        >
          Analizar mi dia
        </button>
      </div>
    </div>
  );
}
