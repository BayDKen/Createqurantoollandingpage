import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "./language-context";

/* ─── Web Speech API type declarations ─── */
interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

/* ─── Arabic text utilities ─── */
function normalizeArabic(text: string): string {
  return text
    // Remove all tashkeel / diacritical marks
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    // Alef variants -> plain alef
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    // Ta marbuta -> ha
    .replace(/\u0629/g, "\u0647")
    // Alef maqsura -> ya
    .replace(/\u0649/g, "\u064A")
    // Remove non-Arabic characters except spaces
    .replace(/[^\u0600-\u06FF\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getArabicWords(text: string): string[] {
  return normalizeArabic(text).split(" ").filter((w) => w.length > 0);
}

/**
 * Score how well the transcript matches each answer option.
 * Returns the best matching answer if score passes threshold.
 */
function findBestMatch(transcript: string, answers: string[]): { match: string | null; score: number; allScores: { answer: string; score: number }[] } {
  const transcriptWords = getArabicWords(transcript);
  if (transcriptWords.length === 0) return { match: null, score: 0, allScores: [] };

  const allScores: { answer: string; score: number }[] = [];

  for (const answer of answers) {
    const answerWords = getArabicWords(answer);
    if (answerWords.length === 0) {
      allScores.push({ answer, score: 0 });
      continue;
    }

    // Count how many answer words are found (partially or fully) in transcript
    let matchedAnswerWords = 0;
    for (const aw of answerWords) {
      const found = transcriptWords.some((tw) => {
        // Exact match
        if (tw === aw) return true;
        // One contains the other (for partial word matches)
        if (tw.length >= 2 && aw.length >= 2) {
          if (tw.includes(aw) || aw.includes(tw)) return true;
          // Check if first 2/3 of characters match (common in Arabic conjugations)
          const minLen = Math.min(tw.length, aw.length);
          const checkLen = Math.max(2, Math.floor(minLen * 0.6));
          if (tw.substring(0, checkLen) === aw.substring(0, checkLen)) return true;
        }
        return false;
      });
      if (found) matchedAnswerWords++;
    }

    // Count how many transcript words are found in answer
    let matchedTranscriptWords = 0;
    for (const tw of transcriptWords) {
      const found = answerWords.some((aw) => {
        if (tw === aw) return true;
        if (tw.length >= 2 && aw.length >= 2) {
          if (tw.includes(aw) || aw.includes(tw)) return true;
          const minLen = Math.min(tw.length, aw.length);
          const checkLen = Math.max(2, Math.floor(minLen * 0.6));
          if (tw.substring(0, checkLen) === aw.substring(0, checkLen)) return true;
        }
        return false;
      });
      if (found) matchedTranscriptWords++;
    }

    // Combined score: how much of the answer is covered + how much of transcript is relevant
    const answerCoverage = matchedAnswerWords / answerWords.length;
    const transcriptRelevance = transcriptWords.length > 0 ? matchedTranscriptWords / transcriptWords.length : 0;
    const score = (answerCoverage * 0.7) + (transcriptRelevance * 0.3);

    allScores.push({ answer, score });
  }

  // Sort by score descending
  allScores.sort((a, b) => b.score - a.score);

  const best = allScores[0];
  // Threshold: at least 35% match (lowered for Arabic speech recognition imperfections)
  if (best && best.score >= 0.35) {
    return { match: best.answer, score: best.score, allScores };
  }

  return { match: null, score: best?.score ?? 0, allScores };
}

/* ─── Status types ─── */
type VoiceStatus =
  | "idle"
  | "requesting"    // Requesting mic permission
  | "listening"     // Actively listening
  | "speechDetected" // Speech detected, processing
  | "processing"    // Processing final result
  | "matched"       // Found a match
  | "noMatch"       // No match found
  | "error"         // Error occurred
  | "unsupported";  // Browser doesn't support it

interface VoiceAnswerButtonProps {
  answers: string[];
  correctAnswer: string;
  onMatch: (answer: string) => void;
  onAutoConfirm: (answer: string) => void;
  onVoiceData?: (data: VoiceAnswerData) => void;
  disabled: boolean;
  isDark: boolean;
}

export interface VoiceAnswerData {
  transcript: string;
  matchedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  confidence: number;
  timestamp: string;
  surahName?: string;
  ayatNumber?: number;
  audioBase64?: string;
}

/* ─── Animated waveform bars ─── */
function WaveformBars() {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: "#ffffff" }}
          animate={{
            height: ["6px", `${12 + Math.random() * 8}px`, "4px", `${10 + Math.random() * 10}px`, "6px"],
          }}
          transition={{
            duration: 0.8 + i * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

export function VoiceAnswerButton({
  answers,
  correctAnswer,
  onMatch,
  onAutoConfirm,
  onVoiceData,
  disabled,
  isDark,
}: VoiceAnswerButtonProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [matchedAnswer, setMatchedAnswer] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(answers);
  const correctAnswerRef = useRef(correctAnswer);
  const statusRef = useRef<VoiceStatus>("idle");
  // Guard: prevent processing transcript more than once per listening session
  const processedRef = useRef(false);
  // MediaRecorder for capturing audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recordedAudioRef = useRef<string | null>(null);

  // Keep refs in sync
  useEffect(() => {
    answersRef.current = answers;
    correctAnswerRef.current = correctAnswer;
  }, [answers, correctAnswer]);

  // Keep status ref in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Cleanup on unmount or when question changes
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Cleanup media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
    };
  }, []);

  // Reset state when answers change (new question)
  useEffect(() => {
    // Immediately abort any running recognition for the previous question
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
    // Reset all state so user must click voice button again
    setStatus("idle");
    setTranscript("");
    setMatchedAnswer(null);
    setMatchScore(0);
    setErrorMessage("");
    transcriptRef.current = "";
    processedRef.current = false;
    recordedAudioRef.current = null;
    audioChunksRef.current = [];
  }, [correctAnswer]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Stop media recorder — do NOT stop here; let stopRecorderAndGetAudio handle it
    // Only stop recognition and timers
  }, []);

  /**
   * Stop the MediaRecorder, wait for the final data chunk,
   * then build a Blob from ALL collected chunks and convert to base64.
   * Returns the user's actual recorded audio as a data URL, or null if unavailable.
   */
  const stopRecorderAndGetAudio = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        // Recorder already stopped or never started — build from existing chunks
        if (audioChunksRef.current.length > 0) {
          const mimeType = audioChunksRef.current[0]?.type || "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        } else {
          resolve(null);
        }
        return;
      }

      // Override onstop to capture ALL chunks including the final one
      recorder.onstop = () => {
        console.log("[Voice] MediaRecorder stopped, total chunks:", audioChunksRef.current.length);
        // Stop mic tracks
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(t => t.stop());
          audioStreamRef.current = null;
        }
        if (audioChunksRef.current.length > 0) {
          const mimeType = audioChunksRef.current[0]?.type || "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log("[Voice] User audio blob size:", Math.round(blob.size / 1024), "KB, type:", mimeType);
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            recordedAudioRef.current = base64;
            resolve(base64);
          };
          reader.onerror = () => {
            console.error("[Voice] Failed to convert audio blob to base64");
            resolve(null);
          };
          reader.readAsDataURL(blob);
        } else {
          console.warn("[Voice] No audio chunks captured");
          resolve(null);
        }
      };

      // Request any remaining buffered data, then stop
      try { recorder.requestData(); } catch {}
      recorder.stop();
    });
  }, []);

  const processTranscript = useCallback(async (finalText: string) => {
    // Guard: only process once per listening session
    if (processedRef.current) return;
    processedRef.current = true;

    // FIRST: stop the recorder and get the user's actual recorded audio
    const audioBase64 = await stopRecorderAndGetAudio();
    console.log("[Voice] Audio captured for submission:", audioBase64 ? `${Math.round(audioBase64.length / 1024)}KB base64` : "none");

    // Helper: fire callback with the user's real recorded audio
    const reportVoiceData = (voiceData: VoiceAnswerData) => {
      onVoiceData?.({ ...voiceData, audioBase64: audioBase64 || undefined });
    };

    if (!finalText.trim()) {
      setStatus("noMatch");
      reportVoiceData({
        transcript: "",
        matchedAnswer: null,
        correctAnswer: correctAnswerRef.current,
        isCorrect: false,
        confidence: 0,
        timestamp: new Date().toISOString(),
      });
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }

    setStatus("processing");
    const { match, score } = findBestMatch(finalText, answersRef.current);
    setMatchScore(Math.round(score * 100));

    if (match) {
      setMatchedAnswer(match);
      setStatus("matched");
      onMatch(match);

      const isCorrect = match === correctAnswerRef.current;
      reportVoiceData({
        transcript: finalText,
        matchedAnswer: match,
        correctAnswer: correctAnswerRef.current,
        isCorrect,
        confidence: Math.round(score * 100),
        timestamp: new Date().toISOString(),
      });

      // Stop recognition (recorder already stopped above)
      stopListening();

      // Auto-confirm after a brief delay to show the matched state
      setTimeout(() => {
        onAutoConfirm(match);
      }, 800);
    } else {
      setStatus("noMatch");
      reportVoiceData({
        transcript: finalText,
        matchedAnswer: null,
        correctAnswer: correctAnswerRef.current,
        isCorrect: false,
        confidence: Math.round(score * 100),
        timestamp: new Date().toISOString(),
      });
      setTimeout(() => {
        setStatus("idle");
        // Allow trying again for the same question
        processedRef.current = false;
      }, 3000);
    }
  }, [onMatch, onAutoConfirm, onVoiceData, stopListening, stopRecorderAndGetAudio]);

  const startListening = useCallback(async () => {
    if (disabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("unsupported");
      setErrorMessage(t("voiceNotSupported"));
      return;
    }

    // Reset for this new listening session
    setTranscript("");
    setMatchedAnswer(null);
    setMatchScore(0);
    setErrorMessage("");
    transcriptRef.current = "";
    processedRef.current = false;
    recordedAudioRef.current = null;
    audioChunksRef.current = [];
    setStatus("requesting");

    try {
      // Start MediaRecorder in parallel with SpeechRecognition to capture audio
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/mp4";
        const recorder = new MediaRecorder(stream, { mimeType });
        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            recordedAudioRef.current = reader.result as string;
            console.log("[Voice] Audio recorded:", Math.round(blob.size / 1024), "KB");
          };
          reader.readAsDataURL(blob);
          // Stop all tracks
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(t => t.stop());
            audioStreamRef.current = null;
          }
        };
        mediaRecorderRef.current = recorder;
        recorder.start(200); // Collect chunks every 200ms for immediate availability
        console.log("[Voice] MediaRecorder started:", mimeType);
      } catch (recErr) {
        console.warn("[Voice] MediaRecorder not available, audio won't be saved:", recErr);
        // Continue without recording — SpeechRecognition can still work
      }

      const recognition = new SpeechRecognition();
      // Single-shot mode: one result per click, prevents carry-over to next question
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "ar-SA";
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        console.log("[Voice] Recognition started");
        setStatus("listening");
      };

      recognition.onaudiostart = () => {
        console.log("[Voice] Audio capture started");
      };

      recognition.onspeechstart = () => {
        console.log("[Voice] Speech detected");
        setStatus("speechDetected");
      };

      recognition.onspeechend = () => {
        console.log("[Voice] Speech ended");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Ignore results if already processed
        if (processedRef.current) return;

        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const displayText = finalTranscript || interimTranscript;
        setTranscript(displayText);
        transcriptRef.current = displayText;

        console.log("[Voice] Transcript:", displayText, "| Final:", !!finalTranscript);

        // If we have a final result, process it
        if (finalTranscript) {
          stopListening();
          processTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log("[Voice] Error:", event.error, event.message);

        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setErrorMessage(t("voiceMicBlocked"));
          setStatus("error");
        } else if (event.error === "no-speech") {
          // User didn't say anything
          setErrorMessage(t("voiceNoSpeech"));
          setStatus("error");
          setTimeout(() => setStatus("idle"), 2500);
        } else if (event.error === "network") {
          setErrorMessage(t("voiceNetworkError"));
          setStatus("error");
          setTimeout(() => setStatus("idle"), 3000);
        } else if (event.error !== "aborted") {
          setErrorMessage(event.error);
          setStatus("error");
          setTimeout(() => setStatus("idle"), 3000);
        }
      };

      recognition.onend = () => {
        console.log("[Voice] Recognition ended. Transcript:", transcriptRef.current);

        // Only process leftover transcript if not already processed
        if (!processedRef.current && transcriptRef.current && (statusRef.current === "listening" || statusRef.current === "speechDetected")) {
          processTranscript(transcriptRef.current);
        }

        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();

      // Auto-stop after 15 seconds to prevent infinite listening
      timeoutRef.current = setTimeout(() => {
        console.log("[Voice] Auto-stop after timeout");
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          if (!processedRef.current) {
            if (transcriptRef.current) {
              processTranscript(transcriptRef.current);
            } else {
              setStatus("noMatch");
              setTimeout(() => setStatus("idle"), 2500);
            }
          }
        }
      }, 15000);

    } catch (err) {
      console.error("[Voice] Failed to start:", err);
      setErrorMessage(String(err));
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [disabled, t, stopListening, processTranscript]);

  const handleClick = useCallback(() => {
    if (status === "listening" || status === "speechDetected" || status === "requesting") {
      stopListening();
      if (transcriptRef.current) {
        processTranscript(transcriptRef.current);
      } else {
        // No transcript — also stop the recorder and clean up mic
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          try { mediaRecorderRef.current.stop(); } catch {}
        }
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(t => t.stop());
          audioStreamRef.current = null;
        }
        setStatus("idle");
      }
    } else if (status === "idle" || status === "noMatch" || status === "error") {
      startListening();
    }
  }, [status, stopListening, startListening, processTranscript]);

  const isActive = status === "listening" || status === "speechDetected" || status === "requesting";
  const borderCol = isDark ? "#33302e" : "rgba(45,58,46,0.12)";
  const textMuted = isDark ? "#a8a29e" : "#6b7c6e";

  // Status-based button styling
  let btnBg = isDark ? "#292524" : "#f7f5f0";
  let btnBorder = isDark ? "#44403c" : "rgba(45,58,46,0.15)";
  let btnTextColor = isDark ? "#f5f5f4" : "#2d3a2e";
  let statusLabel = t("voiceAnswer");
  let statusIcon = <Mic className="w-4.5 h-4.5" style={{ color: "#16A34A" }} />;

  if (status === "requesting") {
    btnBg = isDark ? "#292524" : "#f7f5f0";
    statusLabel = t("voiceRequesting");
    statusIcon = (
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Mic className="w-4.5 h-4.5" style={{ color: "#16A34A" }} />
      </motion.div>
    );
  } else if (status === "listening") {
    btnBg = "#16A34A";
    btnBorder = "#16A34A";
    btnTextColor = "#ffffff";
    statusLabel = t("listening");
    statusIcon = <WaveformBars />;
  } else if (status === "speechDetected") {
    btnBg = "#16A34A";
    btnBorder = "#16A34A";
    btnTextColor = "#ffffff";
    statusLabel = t("voiceSpeechDetected");
    statusIcon = <WaveformBars />;
  } else if (status === "processing") {
    btnBg = isDark ? "#292524" : "#e8e4dc";
    statusLabel = t("voiceProcessing");
    statusIcon = (
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
        <Mic className="w-4.5 h-4.5" style={{ color: "#16A34A" }} />
      </motion.div>
    );
  } else if (status === "matched") {
    btnBg = "rgba(22,163,74,0.12)";
    btnBorder = "#16A34A";
    btnTextColor = "#16A34A";
    statusLabel = t("voiceMatched");
    statusIcon = <CheckCircle className="w-4.5 h-4.5" style={{ color: "#16A34A" }} />;
  } else if (status === "noMatch") {
    btnBg = "rgba(239,68,68,0.08)";
    btnBorder = "rgba(239,68,68,0.3)";
    btnTextColor = "#ef4444";
    statusLabel = t("voiceNoMatch");
    statusIcon = <XCircle className="w-4.5 h-4.5" style={{ color: "#ef4444" }} />;
  } else if (status === "error" || status === "unsupported") {
    btnBg = "rgba(239,68,68,0.08)";
    btnBorder = "rgba(239,68,68,0.3)";
    btnTextColor = "#ef4444";
    statusLabel = errorMessage || t("voiceNotSupported");
    statusIcon = <AlertCircle className="w-4.5 h-4.5" style={{ color: "#ef4444" }} />;
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full mb-4">
      {/* Divider */}
      <div className="flex items-center gap-3 w-full my-1">
        <div className="flex-1 h-px" style={{ backgroundColor: borderCol }} />
        <span className="text-xs uppercase tracking-wider" style={{ color: textMuted }}>
          {t("orSpeakVerse")}
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: borderCol }} />
      </div>

      {/* Main mic button */}
      <div className="relative">
        {/* Pulsing rings when active */}
        <AnimatePresence>
          {isActive && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid #16A34A" }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid #16A34A" }}
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              />
            </>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.93 } : {}}
          onClick={handleClick}
          disabled={disabled || status === "processing" || status === "matched"}
          className="relative flex items-center gap-3 px-6 py-3 rounded-full cursor-pointer overflow-hidden z-10"
          style={{
            backgroundColor: btnBg,
            border: `1.5px solid ${btnBorder}`,
            opacity: disabled ? 0.4 : 1,
            transition: "background-color 0.3s, border-color 0.3s",
          }}
        >
          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center w-5 h-5">
            {statusIcon}
          </div>

          {/* Label */}
          <span
            className="relative z-10 text-sm whitespace-nowrap"
            style={{
              color: btnTextColor,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              transition: "color 0.3s",
            }}
          >
            {statusLabel}
          </span>

          {/* Stop icon when active */}
          {isActive && (
            <div className="relative z-10 flex items-center justify-center w-5 h-5 ml-1">
              <MicOff className="w-4 h-4" style={{ color: "#ffffff", opacity: 0.7 }} />
            </div>
          )}
        </motion.button>
      </div>

      {/* Transcript display */}
      <AnimatePresence>
        {transcript && (status === "listening" || status === "speechDetected" || status === "processing" || status === "matched" || status === "noMatch") && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg overflow-hidden"
          >
            <div
              className="px-5 py-3 rounded-xl text-center"
              style={{
                backgroundColor: isDark ? "rgba(41,37,36,0.6)" : "rgba(247,245,240,0.9)",
                border: `1px solid ${
                  status === "matched"
                    ? "rgba(22,163,74,0.4)"
                    : status === "noMatch"
                    ? "rgba(239,68,68,0.3)"
                    : borderCol
                }`,
              }}
              dir="rtl"
            >
              {/* "What you said" label */}
              <p
                className="text-[10px] uppercase tracking-widest mb-1.5"
                style={{
                  color: status === "matched" ? "#16A34A" : status === "noMatch" ? "#ef4444" : textMuted,
                }}
              >
                {t("voiceYouSaid")}
              </p>

              {/* Transcript text */}
              <p
                className="text-lg md:text-xl leading-relaxed"
                style={{
                  fontFamily: "'Amiri', serif",
                  color: status === "matched"
                    ? "#16A34A"
                    : status === "noMatch"
                    ? "#ef4444"
                    : isDark ? "#f5f5f4" : "#2d3a2e",
                }}
              >
                {transcript}
              </p>

              {/* Match result info */}
              {status === "matched" && matchedAnswer && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs mt-2 flex items-center justify-center gap-1.5"
                  style={{ color: "#16A34A" }}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t("voiceMatchConfidence")}: {matchScore}%
                </motion.p>
              )}

              {status === "noMatch" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs mt-2"
                  style={{ color: "#ef4444" }}
                >
                  {t("voiceTryAgain")}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {status === "error" && errorMessage && !transcript && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-center"
            style={{ color: "#ef4444" }}
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Tip */}
      {status === "idle" && (
        <p className="text-[11px] text-center max-w-xs" style={{ color: textMuted, opacity: 0.7 }}>
          {t("voiceTip")}
        </p>
      )}
    </div>
  );
}