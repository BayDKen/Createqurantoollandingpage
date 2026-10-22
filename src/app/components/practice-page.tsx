import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import {
  ChevronDown,
  LogIn,
  LogOut,
  Play,
  Pause,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Moon,
  Sun,
  GripVertical,
  Trophy,
  RotateCcw,
  Home,
  Star,
  TrendingUp,
} from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { useLanguage } from "./language-context";
import { usePractice } from "./practice-context";
import { useAuth } from "./auth-context";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import logoImg from "figma:asset/30fa87d76d1b1890e1726173d651c0871eb45f2f.png";
import { quizQuestions, shuffleArray, QuizQuestion, getAyahAudioUrl } from "./quiz-data";
import { VoiceAnswerButton, VoiceAnswerData } from "./voice-answer-button";
import { AuthModal } from "./auth-modal";
import { authFetch } from "./auth-context";

const DRAG_TYPE = "ANSWER_CARD";

// Detect touch device for appropriate DnD backend
const isTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

const getDndBackend = () => isTouchDevice() ? TouchBackend : HTML5Backend;
const getDndOptions = () => isTouchDevice() ? { enableMouseEvents: true } : undefined;

/* ─── Audio hook ─── */
function useAyahAudio(surahNumber: number, ayahNumber: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, [surahNumber, ayahNumber]);

  const toggle = useCallback(async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    try {
      const audioUrl = await getAyahAudioUrl(surahNumber, ayahNumber);
      if (!audioUrl) {
        setIsLoading(false);
        return;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener("canplaythrough", () => {
        setIsLoading(false);
        setIsPlaying(true);
        audio.play();
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
      });

      audio.addEventListener("error", () => {
        setIsLoading(false);
        setIsPlaying(false);
      });

      audio.load();
    } catch {
      setIsLoading(false);
    }
  }, [isPlaying, surahNumber, ayahNumber]);

  return { isPlaying, isLoading, toggle };
}

/* ─── Draggable answer card ─── */
interface DraggableAnswerProps {
  answer: string;
  index: number;
  isDark: boolean;
  disabled: boolean;
  isInDropZone: boolean;
}

// ⚡ Bolt Optimization: Memoize DraggableAnswer component
// Why: Draggable list items trigger full list re-renders when parent state changes in React DnD contexts
// Impact: Eliminates O(n) unnecessary re-renders of all answer cards when drag state updates
// Measurement: Profile with React DevTools to verify only the dragged/dropped card renders
const DraggableAnswer = memo(function DraggableAnswer({ answer, index, isDark, disabled, isInDropZone }: DraggableAnswerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DRAG_TYPE,
      item: { answer },
      canDrag: !disabled && !isInDropZone,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [answer, disabled, isInDropZone]
  );

  drag(ref);

  if (isInDropZone) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isDragging ? 0.4 : 1, x: 0 }}
      transition={{
        delay: 0.3 + index * 0.08,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={!disabled ? { scale: 1.01, x: 4 } : {}}
      className="w-full px-5 py-4 rounded-xl border text-right flex items-center gap-3"
      style={{
        borderColor: isDark ? "#33302e" : "rgba(45, 58, 46, 0.12)",
        backgroundColor: isDark ? "rgba(0,0,0,0)" : "rgba(255,255,255,0.6)",
        cursor: disabled ? "default" : "grab",
        opacity: isDragging ? 0.4 : 1,
      }}
      dir="rtl"
    >
      <span
        className="flex-1 text-lg md:text-xl leading-relaxed"
        style={{
          fontFamily: "'Amiri', serif",
          color: isDark ? "#f5f5f4" : "#2d3a2e",
        }}
      >
        {answer}
      </span>
      {!disabled && (
        <GripVertical
          className="w-5 h-5 shrink-0"
          style={{ color: isDark ? "#78716c" : "#a8a29e" }}
        />
      )}
    </motion.div>
  );
});

/* ─── Drop zone ─── */
interface DropZoneProps {
  droppedAnswer: string | null;
  isDark: boolean;
  isConfirmed: boolean;
  isCorrect: boolean | null;
  onDrop: (answer: string) => void;
  onClear: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
}

function DropZone({
  droppedAnswer,
  isDark,
  isConfirmed,
  isCorrect,
  onDrop,
  onClear,
  onConfirm,
  t,
}: DropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: DRAG_TYPE,
      drop: (item: { answer: string }) => {
        onDrop(item.answer);
      },
      canDrop: () => !isConfirmed,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [isConfirmed, onDrop]
  );

  drop(ref);

  const emptyBorderColor = isDark ? "#33302e" : "rgba(45, 58, 46, 0.15)";
  const hoverBorderColor = "rgba(22, 163, 74, 0.5)";
  const filledBorderColor = isDark ? "#44403c" : "rgba(45, 58, 46, 0.25)";

  let currentBorder = emptyBorderColor;
  let currentBg = "rgba(0,0,0,0)";

  if (isConfirmed && isCorrect !== null) {
    currentBorder = isCorrect ? "#16A34A" : "#ef4444";
    currentBg = isCorrect ? "rgba(22,163,74,0.06)" : "rgba(239,68,68,0.06)";
  } else if (droppedAnswer) {
    currentBorder = filledBorderColor;
    currentBg = isDark ? "rgba(41,37,36,0.5)" : "rgba(232,228,220,0.5)";
  } else if (isOver) {
    currentBorder = hoverBorderColor;
    currentBg = "rgba(22,163,74,0.04)";
  }

  return (
    <div className="w-full mb-6">
      <motion.div
        ref={ref}
        className="w-full rounded-xl border-2 border-dashed min-h-[72px] flex flex-col items-center justify-center px-4 py-4 transition-colors"
        animate={{ borderColor: currentBorder, backgroundColor: currentBg }}
        transition={{ duration: 0.25 }}
      >
        {isConfirmed && isCorrect !== null ? (
          <div className="flex items-center justify-center gap-3">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 shrink-0" style={{ color: "#16A34A" }} />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" style={{ color: "#ef4444" }} />
            )}
            <span
              className="text-sm"
              style={{ color: isCorrect ? "#16A34A" : "#ef4444" }}
            >
              {isCorrect ? t("correct") : t("incorrect")}
            </span>
          </div>
        ) : droppedAnswer ? (
          <p
            className="text-lg md:text-xl leading-relaxed text-center"
            dir="rtl"
            style={{
              fontFamily: "'Amiri', serif",
              color: isDark ? "#f5f5f4" : "#2d3a2e",
            }}
          >
            {droppedAnswer}
          </p>
        ) : (
          <p
            className="text-sm"
            style={{ color: isDark ? "#78716c" : "#a8a29e" }}
          >
            {t("dragDropInstruction")}
          </p>
        )}
      </motion.div>

      <AnimatePresence>
        {droppedAnswer && !isConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-3 mt-4"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onConfirm}
              className="px-6 py-2.5 rounded-xl text-white cursor-pointer text-sm"
              style={{ backgroundColor: "#16A34A" }}
            >
              {t("confirmAnswer")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClear}
              className="px-5 py-2.5 rounded-xl border cursor-pointer text-sm"
              style={{
                borderColor: isDark ? "#44403c" : "rgba(45,58,46,0.2)",
                color: isDark ? "#a8a29e" : "#6b7c6e",
              }}
            >
              {t("changeAnswer")}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Play Tilawah Button ─── */
interface PlayTilawahButtonProps {
  surahNumber: number;
  ayahNumber: number;
  label: string;
}

function PlayTilawahButton({ surahNumber, ayahNumber, label }: PlayTilawahButtonProps) {
  const { isPlaying, isLoading, toggle } = useAyahAudio(surahNumber, ayahNumber);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-3 pl-6 pr-2 py-2 rounded-full mb-6 cursor-pointer overflow-hidden"
      style={{ backgroundColor: "#16A34A" }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 55%, rgba(255,255,255,0) 100%)",
          backgroundSize: "200% 100%",
        }}
        initial={{ backgroundPosition: "-100% 0" }}
        animate={isHovered ? { backgroundPosition: "200% 0" } : { backgroundPosition: "-100% 0" }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[50%] pointer-events-none rounded-t-full"
        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0))" }}
      />
      <span className="relative text-sm text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
        {label}
      </span>
      <motion.div
        className="relative w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
          boxShadow: "0 2px 8px rgba(6, 182, 212, 0.4)",
        }}
        animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
        transition={isPlaying ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white ml-0.5" />
        )}
      </motion.div>
    </motion.button>
  );
}

/* ─── Language Dropdown (Practice Header) ─── */
function LangDropdown({ isDark }: { isDark: boolean }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dropBg = isDark ? "#292524" : "#ffffff";
  const borderColor = isDark ? "#33302e" : "rgba(45,58,46,0.12)";
  const textPrimary = isDark ? "#f5f5f4" : "#2d3a2e";
  const textMuted = isDark ? "#a8a29e" : "#6b7c6e";
  const hoverBg = isDark ? "#1C1917" : "#f7f5f0";

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer"
        style={{ color: textMuted }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xs uppercase">{lang === "en" ? "EN" : "ID"}</span>
        <ChevronDown
          className="w-3 h-3 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-1 w-32 rounded-xl border shadow-lg overflow-hidden z-50"
            style={{ backgroundColor: dropBg, borderColor }}
          >
            {[
              { code: "en" as const, label: "English" },
              { code: "id" as const, label: "Indonesia" },
            ].map((opt) => (
              <button
                key={opt.code}
                onClick={() => {
                  setLang(opt.code);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 cursor-pointer transition-colors"
                style={{
                  color: lang === opt.code ? "#16A34A" : textPrimary,
                  backgroundColor: lang === opt.code ? "rgba(22,163,74,0.06)" : "rgba(0,0,0,0)",
                  fontWeight: lang === opt.code ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (lang !== opt.code) e.currentTarget.style.backgroundColor = hoverBg;
                }}
                onMouseLeave={(e) => {
                  if (lang !== opt.code) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)";
                }}
              >
                {lang === opt.code && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#16A34A" }} />
                )}
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Practice Page ─── */
export function PracticePage() {
  const { t, lang } = useLanguage();
  const { settings, darkMode, toggleDarkMode } = usePractice();
  const { user, accessToken, signOut } = useAuth();
  const navigate = useNavigate();

  const [authOpen, setAuthOpen] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const questions = useMemo(() => {
    let pool = quizQuestions;
    // Filter by selected surahs if any are chosen
    if (settings.selectedSurahs && settings.selectedSurahs.length > 0) {
      pool = quizQuestions.filter(q => settings.selectedSurahs.includes(q.surahNumber));
    }
    const shuffled = shuffleArray(pool);
    return shuffled.slice(0, Math.min(settings.questionCount, shuffled.length));
  }, [settings.questionCount, settings.selectedSurahs]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [droppedAnswer, setDroppedAnswer] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // Track voice answers and question details for saving
  const [voiceAnswers, setVoiceAnswers] = useState<VoiceAnswerData[]>([]);
  const [questionDetails, setQuestionDetails] = useState<Array<{
    questionId: string;
    surahName: string;
    ayatNumber: number;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    answeredByVoice: boolean;
  }>>([]);

  const currentQuestion: QuizQuestion | undefined = questions[currentIndex];

  const answerOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffleArray([
      currentQuestion.correctAnswer,
      ...currentQuestion.wrongAnswers,
    ]);
  }, [currentQuestion]);

  const handleDrop = useCallback(
    (answer: string) => {
      if (isConfirmed) return;
      setDroppedAnswer(answer);
    },
    [isConfirmed]
  );

  const handleClear = useCallback(() => {
    setDroppedAnswer(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!droppedAnswer || !currentQuestion) return;
    const correct = droppedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setIsConfirmed(true);
    if (correct) setScore((prev) => prev + 1);

    // Track question detail (drag-and-drop answer)
    setQuestionDetails((prev) => [...prev, {
      questionId: currentQuestion.id,
      surahName: currentQuestion.surahName,
      ayatNumber: currentQuestion.ayatNumber,
      selectedAnswer: droppedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: correct,
      answeredByVoice: false,
    }]);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setDroppedAnswer(null);
        setIsConfirmed(false);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1800);
  }, [droppedAnswer, currentQuestion, currentIndex, questions.length]);

  // Handle voice match - set the answer in drop zone
  const handleVoiceMatch = useCallback(
    (answer: string) => {
      if (isConfirmed) return;
      setDroppedAnswer(answer);
    },
    [isConfirmed]
  );

  // Handle voice auto-confirm - automatically confirm the voice-matched answer
  const handleVoiceAutoConfirm = useCallback(
    (answer: string) => {
      if (isConfirmed || !currentQuestion) return;
      setDroppedAnswer(answer);
      const correct = answer === currentQuestion.correctAnswer;
      setIsCorrect(correct);
      setIsConfirmed(true);
      if (correct) setScore((prev) => prev + 1);

      // Track question detail (voice answer)
      setQuestionDetails((prev) => [...prev, {
        questionId: currentQuestion.id,
        surahName: currentQuestion.surahName,
        ayatNumber: currentQuestion.ayatNumber,
        selectedAnswer: answer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: correct,
        answeredByVoice: true,
      }]);

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setDroppedAnswer(null);
          setIsConfirmed(false);
          setIsCorrect(null);
        } else {
          setShowResult(true);
        }
      }, 2200);
    },
    [isConfirmed, currentQuestion, currentIndex, questions.length]
  );

  // Handle voice data callback
  const handleVoiceData = useCallback(
    (data: VoiceAnswerData) => {
      if (!currentQuestion) return;
      // Add surah info to voice data
      const enrichedData: VoiceAnswerData = {
        ...data,
        surahName: currentQuestion.surahName,
        ayatNumber: currentQuestion.ayatNumber,
      };
      setVoiceAnswers((prev) => [...prev, enrichedData]);
      console.log("[Voice] Data recorded:", enrichedData.transcript ? `"${enrichedData.transcript}" → match: ${enrichedData.isCorrect}` : "empty transcript",
        enrichedData.audioBase64 ? `| audio: ${Math.round(enrichedData.audioBase64.length / 1024)}KB` : "| audio: none");

      // Save voice answer to server in real-time (fire-and-forget)
      if (user && enrichedData.transcript) {
        authFetch("/voice-answers", {
          method: "POST",
          body: {
            transcript: enrichedData.transcript,
            matchedAnswer: enrichedData.matchedAnswer,
            correctAnswer: enrichedData.correctAnswer,
            isCorrect: enrichedData.isCorrect,
            confidence: enrichedData.confidence,
            timestamp: enrichedData.timestamp,
            surahName: enrichedData.surahName,
            ayatNumber: enrichedData.ayatNumber,
            questionId: currentQuestion.id,
            audioBase64: enrichedData.audioBase64 || undefined,
          },
        })
          .then(async (res) => {
            if (!res.ok) {
              const errBody = await res.text().catch(() => "");
              console.error("[Voice] Failed to save voice answer to server:", res.status, errBody);
            } else {
              console.log("[Voice] Voice answer saved to server successfully");
            }
          })
          .catch((err) => {
            console.error("[Voice] Error saving voice answer to server:", err);
          });
      }
    },
    [currentQuestion, user]
  );

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  // Save progress when practice completes
  useEffect(() => {
    if (!showResult || progressSaved || !user) return;
    setProgressSaved(true);
    setSavingProgress(true);
    setSaveError(false);
    const surahs = [...new Set(questions.map((q) => q.surahName))];
    console.log("[Progress] Saving progress...", { score, total: questions.length, user: user.id });
    authFetch("/progress", {
      method: "POST",
      body: {
        score,
        total: questions.length,
        timestamp: new Date().toISOString(),
        surahs,
        voiceAnswers: voiceAnswers.filter(v => v.transcript),
        questionDetails,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          console.error("[Progress] Failed to save progress:", res.status, errBody);
          setSaveError(true);
        } else {
          console.log("[Progress] Progress saved successfully");
        }
        setSavingProgress(false);
      })
      .catch((err) => {
        console.error("[Progress] Error saving progress:", err);
        setSaveError(true);
        setSavingProgress(false);
      });
  }, [showResult, progressSaved, user, score, questions, voiceAnswers, questionDetails]);

  // Theme colors
  const bg = darkMode ? "#1C1917" : "#f7f5f0";
  const headerBg = darkMode ? "rgba(28,25,23,0.9)" : "rgba(247,245,240,0.9)";
  const borderColor = darkMode ? "#33302e" : "rgba(45,58,46,0.12)";
  const textPrimary = darkMode ? "#f5f5f4" : "#2d3a2e";
  const textMuted = darkMode ? "#a8a29e" : "#6b7c6e";
  const textSubtle = darkMode ? "#78716c" : "#a8a29e";
  const progressBg = darkMode ? "#292524" : "#e8e4dc";

  /* ─── Result Screen ─── */
  if (showResult) {
    const wrongCount = questions.length - score;
    const percentage = Math.round((score / questions.length) * 100);
    
    // Determine message based on score
    let congratsMessage = "";
    let subMessage = "";
    if (percentage === 100) {
      congratsMessage = t("congratulations");
      subMessage = t("perfectScore");
    } else if (percentage >= 80) {
      congratsMessage = t("congratulations");
      subMessage = t("greatScore");
    } else if (percentage >= 50) {
      congratsMessage = t("mashaaAllah");
      subMessage = t("goodScore");
    } else {
      congratsMessage = t("goodEffort");
      subMessage = t("needsWork");
    }

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
        style={{ backgroundColor: bg }}
      >
        {/* Floating celebration particles */}
        {percentage >= 70 && (
          <>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: Math.random() * 8 + 4,
                  height: Math.random() * 8 + 4,
                  backgroundColor: [
                    "#16A34A", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"
                  ][i % 6],
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20 + 5}%`,
                }}
                animate={{
                  y: [0, window.innerHeight * 1.2],
                  x: [0, (Math.random() - 0.5) * 200],
                  rotate: [0, Math.random() * 720],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  delay: Math.random() * 1.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-md w-full relative z-10"
        >
          {/* Trophy / Star icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: percentage >= 80
                ? "linear-gradient(135deg, rgba(22,163,74,0.2), rgba(14,165,233,0.15))"
                : percentage >= 50
                  ? "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(22,163,74,0.15))"
                  : "rgba(22,163,74,0.1)",
            }}
          >
            {percentage >= 80 ? (
              <Trophy className="w-14 h-14" style={{ color: "#16A34A" }} />
            ) : percentage >= 50 ? (
              <Star className="w-14 h-14" style={{ color: "#f59e0b" }} />
            ) : (
              <TrendingUp className="w-14 h-14" style={{ color: "#16A34A" }} />
            )}
          </motion.div>

          {/* Congratulations text */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl md:text-4xl mb-2"
            style={{ color: textPrimary, fontFamily: "'Amiri', serif" }}
          >
            {congratsMessage}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base mb-8"
            style={{ color: textMuted, fontFamily: "'Inter', sans-serif" }}
          >
            {subMessage}
          </motion.p>

          {/* Score Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {/* Correct */}
            <div
              className="rounded-2xl p-4 flex flex-col items-center"
              style={{
                backgroundColor: darkMode ? "rgba(22,163,74,0.1)" : "rgba(22,163,74,0.06)",
                border: `1px solid ${darkMode ? "rgba(22,163,74,0.2)" : "rgba(22,163,74,0.15)"}`,
              }}
            >
              <CheckCircle className="w-5 h-5 mb-2" style={{ color: "#16A34A" }} />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                className="text-3xl font-bold"
                style={{ color: "#16A34A", fontFamily: "'Inter', sans-serif" }}
              >
                {score}
              </motion.span>
              <span className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: textMuted }}>
                {t("totalCorrect")}
              </span>
            </div>

            {/* Wrong */}
            <div
              className="rounded-2xl p-4 flex flex-col items-center"
              style={{
                backgroundColor: darkMode ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${darkMode ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.15)"}`,
              }}
            >
              <XCircle className="w-5 h-5 mb-2" style={{ color: "#ef4444" }} />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                className="text-3xl font-bold"
                style={{ color: "#ef4444", fontFamily: "'Inter', sans-serif" }}
              >
                {wrongCount}
              </motion.span>
              <span className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: textMuted }}>
                {t("totalWrong")}
              </span>
            </div>

            {/* Percentage */}
            <div
              className="rounded-2xl p-4 flex flex-col items-center"
              style={{
                backgroundColor: darkMode ? "rgba(14,165,233,0.1)" : "rgba(14,165,233,0.06)",
                border: `1px solid ${darkMode ? "rgba(14,165,233,0.2)" : "rgba(14,165,233,0.15)"}`,
              }}
            >
              <Trophy className="w-5 h-5 mb-2" style={{ color: "#0ea5e9" }} />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                className="text-3xl font-bold"
                style={{ color: "#0ea5e9", fontFamily: "'Inter', sans-serif" }}
              >
                {percentage}%
              </motion.span>
              <span className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: textMuted }}>
                {t("scorePercentage")}
              </span>
            </div>
          </motion.div>

          {/* Total Score Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mb-8 py-4 px-6 rounded-2xl"
            style={{
              backgroundColor: darkMode ? "rgba(41,37,36,0.5)" : "rgba(232,228,220,0.5)",
              border: `1px solid ${borderColor}`,
            }}
          >
            <p className="text-sm mb-1" style={{ color: textMuted }}>{t("yourScore")}</p>
            <p
              className="text-5xl font-extrabold"
              style={{ color: "#16A34A", fontFamily: "'Inter', sans-serif" }}
            >
              {score} <span className="text-2xl" style={{ color: textMuted }}>/</span>{" "}
              <span className="text-2xl" style={{ color: textMuted }}>{questions.length}</span>
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setDroppedAnswer(null);
                setIsConfirmed(false);
                setIsCorrect(null);
                setShowResult(false);
                setProgressSaved(false);
                setVoiceAnswers([]);
                setQuestionDetails([]);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white cursor-pointer font-medium"
              style={{ backgroundColor: "#16A34A" }}
            >
              <RotateCcw className="w-4 h-4" />
              {t("tryAgain")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border cursor-pointer font-medium"
              style={{ borderColor: "rgba(22, 163, 74, 0.3)", color: "#16A34A" }}
            >
              <Home className="w-4 h-4" />
              {t("backToHome")}
            </motion.button>
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/progress")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border cursor-pointer font-medium"
                style={{ borderColor: "rgba(22, 163, 74, 0.3)", color: "#16A34A" }}
              >
                <TrendingUp className="w-4 h-4" />
                {t("viewProgress")}
              </motion.button>
            )}
          </motion.div>

          {/* Progress saved indicator */}
          {user && progressSaved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              {savingProgress ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: textMuted }} />
                  <span className="text-xs" style={{ color: textMuted }}>
                    {lang === "id" ? "Menyimpan progress..." : "Saving progress..."}
                  </span>
                </>
              ) : saveError ? (
                <span className="text-xs" style={{ color: "#ef4444" }}>
                  {lang === "id" ? "Gagal menyimpan progress" : "Failed to save progress"}
                </span>
              ) : (
                <span className="text-xs" style={{ color: "#16A34A" }}>
                  {lang === "id" ? "Progress tersimpan" : "Progress saved"}
                </span>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    // No questions available for selected surahs
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: bg }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <p className="text-xl mb-3" style={{ color: textPrimary, fontFamily: "'Amiri', serif" }}>
            {lang === "id" ? "Belum ada soal untuk surat yang dipilih" : "No questions available for selected surahs"}
          </p>
          <p className="text-sm mb-6" style={{ color: textMuted }}>
            {lang === "id"
              ? "Coba pilih juz atau surat lain yang memiliki soal latihan."
              : "Try selecting a different juz or surah that has practice questions."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white cursor-pointer mx-auto"
            style={{ backgroundColor: "#16A34A" }}
          >
            <Home className="w-4 h-4" />
            {t("backToHome")}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ─── Quiz Screen ─── */
  return (
    <DndProvider backend={getDndBackend()} options={getDndOptions()}>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg }}>
        {/* ── Header ── */}
        <header
          className="sticky top-0 z-50 border-b"
          style={{
            backgroundColor: headerBg,
            backdropFilter: "blur(12px)",
            borderColor,
          }}
        >
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/")}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                style={{ color: textMuted }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
                >
                  <img src={logoImg} alt="My Muraja'ah" className="w-8 h-8 object-contain" />
                </div>
                <span style={{ color: textPrimary }}>
                  <span style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700 }}>My </span>
                  <span style={{ fontFamily: "'Amiri', serif", fontWeight: 700, fontStyle: "italic", color: "#16A34A" }}>Muraja'ah</span>
                </span>
              </div>
            </div>

            {/* Center: Progress */}
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-xs uppercase tracking-wider" style={{ color: textMuted }}>
                {t("questionLabel")} {currentIndex + 1} / {questions.length}
              </span>
              <div
                className="w-32 h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: progressBg }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: "#16A34A" }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: "#16A34A", fontWeight: 600 }}
              >
                {score} {t("points")}
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <LangDropdown isDark={darkMode} />

              <motion.button
                onClick={toggleDarkMode}
                className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer"
                style={{ color: textMuted }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, rotate: 180 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.button>

              {user ? (
                <motion.button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer"
                  style={{ borderColor, color: textPrimary }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                    style={{ backgroundColor: "#16A34A", fontWeight: 700 }}
                  >
                    {(user.user_metadata?.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <LogOut className="w-3.5 h-3.5" style={{ color: textMuted }} />
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer"
                  style={{ borderColor, color: textPrimary }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-xs">{t("login")}</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Mobile progress */}
          <div className="sm:hidden px-4 pb-3 flex items-center gap-3">
            <span className="text-xs" style={{ color: textMuted }}>
              {currentIndex + 1}/{questions.length}
            </span>
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: progressBg }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: "#16A34A" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-xs" style={{ color: "#16A34A" }}>
              {score} {t("points")}
            </span>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 flex flex-col items-center px-4 md:px-6 py-8 md:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl flex flex-col items-center"
            >
              {/* Question Verse (Arabic) */}
              <motion.p
                className="text-3xl md:text-5xl text-center mb-6 leading-loose"
                style={{ fontFamily: "'Amiri', serif", color: textPrimary }}
                dir="rtl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {currentQuestion.questionVerse}
              </motion.p>

              {/* Translation */}
              <motion.p
                className="text-sm md:text-base text-center italic mb-6 max-w-lg"
                style={{ color: textMuted, fontFamily: "'Inter', sans-serif" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentQuestion.questionTranslation}
              </motion.p>

              {/* Play Tilawah */}
              <PlayTilawahButton
                surahNumber={currentQuestion.surahNumber}
                ayahNumber={currentQuestion.ayatNumber}
                label={t("playTilawah")}
              />

              {/* Surah Info */}
              <p className="text-xs mb-8 tracking-wider" style={{ color: textSubtle }}>
                Surah {currentQuestion.surahName} ({currentQuestion.surahArabic}) • {t("verse")}{" "}
                {currentQuestion.ayatNumber}
              </p>

              {/* Drop Zone */}
              <DropZone
                droppedAnswer={droppedAnswer}
                isDark={darkMode}
                isConfirmed={isConfirmed}
                isCorrect={isCorrect}
                onDrop={handleDrop}
                onClear={handleClear}
                onConfirm={handleConfirm}
                t={t}
              />

              {/* Voice Answer Button */}
              <VoiceAnswerButton
                answers={answerOptions}
                correctAnswer={currentQuestion.correctAnswer}
                onMatch={handleVoiceMatch}
                onAutoConfirm={handleVoiceAutoConfirm}
                disabled={isConfirmed}
                isDark={darkMode}
                onVoiceData={handleVoiceData}
              />

              {/* Answer Options (draggable) */}
              <div className="w-full grid gap-3">
                {answerOptions.map((answer, index) => (
                  <DraggableAnswer
                    key={answer}
                    answer={answer}
                    index={index}
                    isDark={darkMode}
                    disabled={isConfirmed}
                    isInDropZone={droppedAnswer === answer}
                  />
                ))}
              </div>

              {/* Show correct answer after wrong confirmation */}
              <AnimatePresence>
                {isConfirmed && isCorrect === false && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="w-full mt-4 px-5 py-4 rounded-xl border text-right"
                    style={{
                      borderColor: "rgba(22,163,74,0.3)",
                      backgroundColor: "rgba(22,163,74,0.04)",
                    }}
                    dir="rtl"
                  >
                    <p className="text-xs mb-2" style={{ color: "#16A34A" }}>
                      {lang === "id" ? "Jawaban yang benar:" : "Correct answer:"}
                    </p>
                    <p
                      className="text-lg md:text-xl leading-relaxed"
                      style={{ fontFamily: "'Amiri', serif", color: "#16A34A" }}
                    >
                      {currentQuestion.correctAnswer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </DndProvider>
  );
}