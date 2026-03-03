import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Moon,
  Sun,
  LogIn,
  LogOut,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Mic,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useLanguage } from "./language-context";
import { usePractice } from "./practice-context";
import { useAuth, authFetch } from "./auth-context";
import { AuthModal } from "./auth-modal";
import logoImg from "figma:asset/30fa87d76d1b1890e1726173d651c0871eb45f2f.png";

interface QuestionDetail {
  questionId: string;
  surahName: string;
  ayatNumber: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  answeredByVoice: boolean;
  audioUrl?: string | null;
  voiceTranscript?: string;
  voiceConfidence?: number;
}

interface Stats {
  totalPractices: number;
  totalCorrect: number;
  totalQuestions: number;
  bestScore: number;
  streak: number;
  lastPractice: string;
  totalVoiceAnswers?: number;
  correctVoiceAnswers?: number;
}

interface HistoryEntry {
  score: number;
  total: number;
  percentage: number;
  timestamp: string;
  surahs: string[];
  createdAt: string;
  questionDetails?: QuestionDetail[];
  voiceAnswers?: any[];
}

/* ─── Audio Player for Voice Recordings ─── */
function VoiceAudioPlayer({
  audioUrl,
  transcript,
  confidence,
  isDark,
  t,
}: {
  audioUrl: string;
  transcript?: string;
  confidence?: number;
  isDark: boolean;
  t: (key: string) => string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
      });

      audio.addEventListener("error", () => {
        setIsPlaying(false);
        console.error("[Audio] Failed to load voice recording");
      });

      audio.play();
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        if (audio.currentTime && audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      }, 100);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        if (audioRef.current && audioRef.current.currentTime && audioRef.current.duration) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      }, 100);
    }
  };

  const borderCol = isDark ? "rgba(22,163,74,0.25)" : "rgba(22,163,74,0.2)";
  const bgCol = isDark ? "rgba(22,163,74,0.08)" : "rgba(22,163,74,0.04)";

  return (
    <div
      className="mt-2 rounded-lg p-3 flex flex-col gap-2"
      style={{ backgroundColor: bgCol, border: `1px solid ${borderCol}` }}
    >
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
          style={{ backgroundColor: "#16A34A" }}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-white" />
          ) : (
            <Play className="w-3.5 h-3.5 text-white ml-0.5" />
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="w-3 h-3 shrink-0" style={{ color: "#16A34A" }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "#16A34A", fontWeight: 600 }}>
              {t("yourVoiceRecording")}
            </span>
            {confidence !== undefined && confidence > 0 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: isDark ? "rgba(22,163,74,0.2)" : "rgba(22,163,74,0.12)",
                  color: "#16A34A",
                  fontWeight: 600,
                }}
              >
                {confidence}%
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "#16A34A" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mt-1" dir="rtl">
          <p className="text-[10px] uppercase tracking-wider mb-0.5" dir="ltr" style={{ color: isDark ? "#78716c" : "#a8a29e" }}>
            {t("transcript")}
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: "'Amiri', serif", color: isDark ? "#d6d3d1" : "#44403c" }}
          >
            {transcript}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── History Detail Card (expanded) ─── */
function HistoryDetail({
  entry,
  isDark,
  t,
  lang,
}: {
  entry: HistoryEntry;
  isDark: boolean;
  t: (key: string) => string;
  lang: string;
}) {
  const details = entry.questionDetails || [];
  const voiceCount = details.filter((d) => d.answeredByVoice).length;
  const dragCount = details.filter((d) => !d.answeredByVoice).length;
  const textPrimary = isDark ? "#f5f5f4" : "#2d3a2e";
  const textMuted = isDark ? "#a8a29e" : "#6b7c6e";
  const borderColor = isDark ? "#33302e" : "rgba(45,58,46,0.12)";
  const cardBg = isDark ? "rgba(41,37,36,0.4)" : "rgba(247,245,240,0.6)";

  // Track which inline players are active
  const [inlinePlayingId, setInlinePlayingId] = useState<string | null>(null);
  const inlineAudioRef = useRef<HTMLAudioElement | null>(null);

  if (details.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm" style={{ color: textMuted }}>
          {lang === "id" ? "Detail soal tidak tersedia untuk sesi ini." : "Question details are not available for this session."}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 pt-1">
      {/* Summary row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ backgroundColor: isDark ? "rgba(22,163,74,0.1)" : "rgba(22,163,74,0.06)", color: "#16A34A", fontWeight: 600 }}
        >
          <Target className="w-3.5 h-3.5" />
          {entry.total} {t("totalQuestionsLabel")}
        </div>
        {voiceCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ backgroundColor: isDark ? "rgba(14,165,233,0.1)" : "rgba(14,165,233,0.06)", color: "#0ea5e9", fontWeight: 600 }}
          >
            <Mic className="w-3.5 h-3.5" />
            {voiceCount} {t("answeredByVoice")}
          </div>
        )}
        {dragCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.06)", color: "#f59e0b", fontWeight: 600 }}
          >
            {dragCount} {t("answeredByDrag")}
          </div>
        )}
      </div>

      {/* Question list */}
      <div className="space-y-3">
        {details.map((qd, i) => {
          const statusColor = qd.isCorrect ? "#16A34A" : "#ef4444";
          const inlineId = `${qd.questionId}-${i}`;
          const isInlinePlaying = inlinePlayingId === inlineId;

          const toggleInlinePlay = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isInlinePlaying) {
              inlineAudioRef.current?.pause();
              inlineAudioRef.current = null;
              setInlinePlayingId(null);
            } else {
              // Stop any currently playing inline audio
              if (inlineAudioRef.current) {
                inlineAudioRef.current.pause();
                inlineAudioRef.current = null;
              }
              const audio = new Audio(qd.audioUrl!);
              inlineAudioRef.current = audio;
              audio.addEventListener("ended", () => {
                setInlinePlayingId(null);
                inlineAudioRef.current = null;
              });
              audio.addEventListener("error", () => {
                setInlinePlayingId(null);
                inlineAudioRef.current = null;
                console.error("[InlineAudio] Failed to play voice recording");
              });
              audio.play();
              setInlinePlayingId(inlineId);
            }
          };

          return (
            <motion.div
              key={`${qd.questionId}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="rounded-xl p-4"
              style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
            >
              {/* Question header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${statusColor}15`, border: `1.5px solid ${statusColor}` }}
                  >
                    {qd.isCorrect ? (
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: statusColor }} />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" style={{ color: statusColor }} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: textPrimary, fontWeight: 600 }}>
                      {t("surahLabel")} {qd.surahName} • {t("ayatLabel")} {qd.ayatNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {qd.answeredByVoice && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
                          style={{ backgroundColor: "rgba(14,165,233,0.1)", color: "#0ea5e9", fontWeight: 500 }}
                        >
                          <Mic className="w-2.5 h-2.5" />
                          Voice
                        </span>
                      )}
                      {qd.answeredByVoice && qd.audioUrl && (
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={toggleInlinePlay}
                          className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                          style={{
                            backgroundColor: isInlinePlaying ? "#ef4444" : "#16A34A",
                            transition: "background-color 0.2s",
                          }}
                          title={isInlinePlaying
                            ? (lang === "id" ? "Hentikan" : "Stop")
                            : (lang === "id" ? "Putar rekaman suara" : "Play voice recording")
                          }
                        >
                          {isInlinePlaying ? (
                            <Pause className="w-2.5 h-2.5 text-white" />
                          ) : (
                            <Play className="w-2.5 h-2.5 text-white ml-px" />
                          )}
                        </motion.button>
                      )}
                      <span className="text-[10px]" style={{ color: textMuted }}>
                        #{i + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected answer */}
              <div className="mb-2">
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                  {t("yourAnswer")}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  dir="rtl"
                  style={{
                    fontFamily: "'Amiri', serif",
                    color: qd.isCorrect ? "#16A34A" : "#ef4444",
                  }}
                >
                  {qd.selectedAnswer}
                </p>
              </div>

              {/* Correct answer (show only if wrong) */}
              {!qd.isCorrect && (
                <div className="mb-2">
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#16A34A" }}>
                    {t("correctAnswerLabel")}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    dir="rtl"
                    style={{ fontFamily: "'Amiri', serif", color: "#16A34A" }}
                  >
                    {qd.correctAnswer}
                  </p>
                </div>
              )}

              {/* Voice recording playback */}
              {qd.answeredByVoice && qd.audioUrl && (
                <VoiceAudioPlayer
                  audioUrl={qd.audioUrl}
                  transcript={qd.voiceTranscript}
                  confidence={qd.voiceConfidence}
                  isDark={isDark}
                  t={t}
                />
              )}

              {/* Voice transcript without audio */}
              {qd.answeredByVoice && !qd.audioUrl && qd.voiceTranscript && (
                <div
                  className="mt-2 rounded-lg p-3"
                  style={{
                    backgroundColor: isDark ? "rgba(14,165,233,0.06)" : "rgba(14,165,233,0.04)",
                    border: `1px solid ${isDark ? "rgba(14,165,233,0.2)" : "rgba(14,165,233,0.15)"}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Mic className="w-3 h-3" style={{ color: "#0ea5e9" }} />
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: "#0ea5e9", fontWeight: 600 }}>
                      {t("transcript")}
                    </span>
                    {qd.voiceConfidence !== undefined && qd.voiceConfidence > 0 && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(14,165,233,0.12)", color: "#0ea5e9", fontWeight: 600 }}
                      >
                        {qd.voiceConfidence}%
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    dir="rtl"
                    style={{ fontFamily: "'Amiri', serif", color: isDark ? "#d6d3d1" : "#44403c" }}
                  >
                    {qd.voiceTranscript}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Progress Page ─── */
export function ProgressPage() {
  const { t, lang, setLang } = useLanguage();
  const { darkMode, toggleDarkMode } = usePractice();
  const { user, accessToken, signOut } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      console.log("[ProgressPage] Fetching progress...");
      const res = await authFetch("/progress");
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        console.error("[ProgressPage] Failed to fetch progress:", res.status, errBody);
        setLoading(false);
        return;
      }
      const data = await res.json();
      console.log("[ProgressPage] Progress data received:", { stats: data.stats, historyCount: data.history?.length });
      setStats(data.stats);
      setHistory(data.history || []);
    } catch (err) {
      console.error("[ProgressPage] Error fetching progress:", err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const bg = darkMode ? "#1C1917" : "#f7f5f0";
  const headerBg = darkMode ? "rgba(28,25,23,0.9)" : "rgba(247,245,240,0.9)";
  const borderColor = darkMode ? "#33302e" : "rgba(45,58,46,0.12)";
  const textPrimary = darkMode ? "#f5f5f4" : "#2d3a2e";
  const textMuted = darkMode ? "#a8a29e" : "#6b7c6e";
  const cardBg = darkMode ? "#292524" : "#ffffff";

  const avgScore =
    stats && stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return lang === "id" ? "Baru saja" : "Just now";
      if (diffMins < 60) return `${diffMins} ${lang === "id" ? "menit lalu" : "min ago"}`;
      if (diffHours < 24) return `${diffHours} ${lang === "id" ? "jam lalu" : "hr ago"}`;
      if (diffDays < 7) return `${diffDays} ${lang === "id" ? "hari lalu" : "days ago"}`;
      return d.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const statCards = [
    {
      icon: <Target className="w-5 h-5" />,
      label: t("totalPractices"),
      value: stats?.totalPractices ?? 0,
      color: "#16A34A",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: t("avgScore"),
      value: `${avgScore}%`,
      color: "#0ea5e9",
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: t("bestScore"),
      value: `${stats?.bestScore ?? 0}%`,
      color: "#f59e0b",
    },
    {
      icon: <Flame className="w-5 h-5" />,
      label: t("streak"),
      value: stats?.streak ?? 0,
      color: "#ef4444",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: headerBg, backdropFilter: "blur(12px)", borderColor }}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={logoImg} alt="My Muraja'ah" className="w-8 h-8 object-contain" />
              </div>
              <span style={{ color: textPrimary }}>
                <span style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700 }}>My </span>
                <span style={{ fontFamily: "'Amiri', serif", fontWeight: 700, fontStyle: "italic", color: "#16A34A" }}>Muraja'ah</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer"
                style={{ color: textMuted }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs uppercase">{lang === "en" ? "EN" : "ID"}</span>
                <ChevronDown className="w-3 h-3" />
              </motion.button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-1 w-32 rounded-xl border shadow-lg overflow-hidden z-50"
                    style={{ backgroundColor: cardBg, borderColor }}
                  >
                    {[
                      { code: "en" as const, label: "English" },
                      { code: "id" as const, label: "Indonesia" },
                    ].map((opt) => (
                      <button
                        key={opt.code}
                        onClick={() => { setLang(opt.code); setLangOpen(false); }}
                        className="w-full px-3 py-2 text-left text-xs cursor-pointer transition-colors"
                        style={{
                          color: lang === opt.code ? "#16A34A" : textPrimary,
                          backgroundColor: lang === opt.code ? "rgba(22,163,74,0.06)" : "rgba(0,0,0,0)",
                          fontWeight: lang === opt.code ? 600 : 400,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer"
              style={{ color: textMuted }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: 180 }}
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
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {!user ? (
          /* Not logged in state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(22,163,74,0.1)" }}
            >
              <Trophy className="w-10 h-10" style={{ color: "#16A34A" }} />
            </div>
            <h2
              className="text-2xl mb-3"
              style={{ color: textPrimary, fontFamily: "'Amiri', serif" }}
            >
              {t("progressLoginRequired")}
            </h2>
            <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: textMuted }}>
              {t("progressLoginDesc")}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthOpen(true)}
              className="px-8 py-3 rounded-xl text-white cursor-pointer"
              style={{ backgroundColor: "#16A34A" }}
            >
              {t("login")}
            </motion.button>
          </motion.div>
        ) : loading ? (
          /* Loading */
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 rounded-full"
              style={{ borderColor: borderColor, borderTopColor: "#16A34A" }}
            />
          </div>
        ) : (
          /* Progress content */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Welcome */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-8"
            >
              <h1
                className="text-2xl md:text-3xl mb-1"
                style={{ color: textPrimary, fontFamily: "'Amiri', serif" }}
              >
                {t("progressGreeting")}, {user.user_metadata?.name || user.email?.split("@")[0]}
              </h1>
              <p className="text-sm" style={{ color: textMuted }}>
                {t("progressSubtitle")}
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                  className="rounded-xl border p-5"
                  style={{ backgroundColor: cardBg, borderColor }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl"
                    style={{ color: textPrimary, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}
                  >
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Voice Stats (if any) */}
            {stats && (stats.totalVoiceAnswers || 0) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="mb-10 rounded-xl border p-5"
                style={{ backgroundColor: cardBg, borderColor }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(14,165,233,0.1)", color: "#0ea5e9" }}
                  >
                    <Mic className="w-4 h-4" />
                  </div>
                  <span className="text-sm" style={{ color: textPrimary, fontWeight: 600 }}>
                    {lang === "id" ? "Statistik Jawaban Suara" : "Voice Answer Stats"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs" style={{ color: textMuted }}>{lang === "id" ? "Total Suara" : "Total Voice"}</p>
                    <p className="text-xl" style={{ color: "#0ea5e9", fontWeight: 700 }}>
                      {stats.totalVoiceAnswers || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: textMuted }}>{lang === "id" ? "Benar" : "Correct"}</p>
                    <p className="text-xl" style={{ color: "#16A34A", fontWeight: 700 }}>
                      {stats.correctVoiceAnswers || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: textMuted }}>{lang === "id" ? "Akurasi" : "Accuracy"}</p>
                    <p className="text-xl" style={{ color: "#f59e0b", fontWeight: 700 }}>
                      {stats.totalVoiceAnswers
                        ? Math.round(((stats.correctVoiceAnswers || 0) / stats.totalVoiceAnswers) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg" style={{ color: textPrimary, fontWeight: 600 }}>
                  {t("recentHistory")}
                </h2>
                <div className="flex items-center gap-1.5" style={{ color: textMuted }}>
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">{history.length} {t("sessions")}</span>
                </div>
              </div>

              {history.length === 0 ? (
                <div
                  className="text-center py-16 rounded-xl border"
                  style={{ backgroundColor: cardBg, borderColor }}
                >
                  <Clock className="w-10 h-10 mx-auto mb-4" style={{ color: textMuted, opacity: 0.5 }} />
                  <p className="text-sm" style={{ color: textMuted }}>
                    {t("noHistory")}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/")}
                    className="mt-4 px-6 py-2.5 rounded-xl text-white cursor-pointer text-sm"
                    style={{ backgroundColor: "#16A34A" }}
                  >
                    {t("ctaStartPractice")}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((entry, i) => {
                    const pct = entry.percentage;
                    const pctColor = pct >= 80 ? "#16A34A" : pct >= 50 ? "#f59e0b" : "#ef4444";
                    const isExpanded = expandedIndex === i;
                    const hasDetails = (entry.questionDetails?.length || 0) > 0;
                    const hasVoice = entry.questionDetails?.some(qd => qd.answeredByVoice) || false;

                    return (
                      <motion.div
                        key={entry.timestamp}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55 + i * 0.05, duration: 0.35 }}
                        className="rounded-xl border overflow-hidden"
                        style={{ backgroundColor: cardBg, borderColor }}
                      >
                        {/* Clickable header */}
                        <button
                          className="w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer transition-colors"
                          onClick={() => setExpandedIndex(isExpanded ? null : i)}
                          style={{
                            backgroundColor: isExpanded
                              ? (darkMode ? "rgba(22,163,74,0.04)" : "rgba(22,163,74,0.02)")
                              : "rgba(0,0,0,0)",
                          }}
                        >
                          {/* Score circle */}
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${pctColor}15`,
                              border: `2px solid ${pctColor}`,
                            }}
                          >
                            <span
                              className="text-sm"
                              style={{ color: pctColor, fontWeight: 700 }}
                            >
                              {pct}%
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm" style={{ color: textPrimary, fontWeight: 500 }}>
                              {entry.score}/{entry.total} {t("correctAnswers")}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs" style={{ color: textMuted }}>
                                {formatDate(entry.timestamp)}
                              </p>
                              {hasVoice && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5"
                                  style={{ backgroundColor: "rgba(14,165,233,0.1)", color: "#0ea5e9" }}
                                >
                                  <Mic className="w-2.5 h-2.5" />
                                  Voice
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Progress bar (desktop) */}
                          <div className="hidden sm:block w-24">
                            <div
                              className="h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: darkMode ? "#292524" : "#e8e4dc" }}
                            >
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: pctColor }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.7 + i * 0.05, duration: 0.5 }}
                              />
                            </div>
                          </div>

                          {/* Expand indicator */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="shrink-0"
                          >
                            <ChevronRight
                              className="w-4 h-4"
                              style={{ color: hasDetails ? "#16A34A" : textMuted, opacity: hasDetails ? 1 : 0.4 }}
                            />
                          </motion.div>
                        </button>

                        {/* Surah tags (always visible) */}
                        {entry.surahs && entry.surahs.length > 0 && (
                          <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                            {entry.surahs.slice(0, 5).map((s) => (
                              <span
                                key={s}
                                className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: darkMode ? "rgba(22,163,74,0.1)" : "rgba(22,163,74,0.06)",
                                  color: "#16A34A",
                                  fontWeight: 500,
                                }}
                              >
                                {s}
                              </span>
                            ))}
                            {entry.surahs.length > 5 && (
                              <span className="text-[10px] px-2 py-0.5" style={{ color: textMuted }}>
                                +{entry.surahs.length - 5}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Expanded detail panel */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="border-t" style={{ borderColor }}>
                                <HistoryDetail
                                  entry={entry}
                                  isDark={darkMode}
                                  t={t}
                                  lang={lang}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}