import { useState, useMemo, useRef, useEffect } from "react";
import { useLanguage } from "./language-context";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, Minus, Plus, Check, Search, X as XIcon } from "lucide-react";
import { juzToSurahs, Surah } from "./quran-data";
import { usePractice } from "./practice-context";

interface JuzSelectorModalProps {
  open: boolean;
  onClose: () => void;
}

export function JuzSelectorModal({ open, onClose }: JuzSelectorModalProps) {
  const { t } = useLanguage();
  const { setSettings, setShowCountdown } = usePractice();
  const [selectedJuz, setSelectedJuz] = useState<number[]>([]);
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [autoplay, setAutoplay] = useState(true);
  const surahSectionRef = useRef<HTMLDivElement>(null);
  const [surahSearch, setSurahSearch] = useState("");

  const juzList = Array.from({ length: 30 }, (_, i) => i + 1);

  // Get unique surahs from all selected juz
  const availableSurahs = useMemo(() => {
    const surahMap = new Map<number, Surah>();
    selectedJuz.forEach((juz) => {
      const surahs = juzToSurahs[juz] || [];
      surahs.forEach((s) => surahMap.set(s.number, s));
    });
    return Array.from(surahMap.values()).sort((a, b) => a.number - b.number);
  }, [selectedJuz]);

  // Filter surahs by search query
  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return availableSurahs;
    const q = surahSearch.toLowerCase().trim();
    return availableSurahs.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.arabic.includes(surahSearch.trim()) ||
        String(s.number).includes(q)
    );
  }, [availableSurahs, surahSearch]);

  // Smooth scroll to surah section when juz is first selected
  useEffect(() => {
    if (selectedJuz.length > 0 && surahSectionRef.current) {
      setTimeout(() => {
        surahSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 350);
    }
  }, [selectedJuz.length]);

  const toggleJuz = (juz: number) => {
    setSelectedJuz((prev) => {
      const next = prev.includes(juz)
        ? prev.filter((j) => j !== juz)
        : [...prev, juz];
      const nextSurahMap = new Map<number, Surah>();
      next.forEach((j) => {
        (juzToSurahs[j] || []).forEach((s) => nextSurahMap.set(s.number, s));
      });
      setSelectedSurahs((prevS) =>
        prevS.filter((sn) => nextSurahMap.has(sn))
      );
      return next;
    });
  };

  const resetJuz = () => {
    setSelectedJuz([]);
    setSelectedSurahs([]);
  };

  const toggleSurah = (surahNumber: number) => {
    setSelectedSurahs((prev) =>
      prev.includes(surahNumber)
        ? prev.filter((s) => s !== surahNumber)
        : [...prev, surahNumber]
    );
  };

  const selectAllSurahs = () => {
    const allNums = availableSurahs.map((s) => s.number);
    const allSelected = allNums.every((n) => selectedSurahs.includes(n));
    if (allSelected) {
      setSelectedSurahs([]);
    } else {
      setSelectedSurahs(allNums);
    }
  };

  const sliderPercent = ((questionCount - 1) / 19) * 100;
  const decrement = () => setQuestionCount((prev) => Math.max(1, prev - 1));
  const increment = () => setQuestionCount((prev) => Math.min(20, prev + 1));

  const springTransition = { type: "spring" as const, stiffness: 300, damping: 25 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl rounded-2xl p-6 md:p-8 shadow-2xl bg-card my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start justify-between mb-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="text-xl text-card-foreground"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    {t("selectJuz")}
                  </h2>
                  <motion.div
                    animate={{ rotate: selectedJuz.length > 0 ? 180 : 0 }}
                    transition={springTransition}
                  >
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("selectJuzDesc")}
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="hover:opacity-80 transition-opacity cursor-pointer text-sm"
                style={{ color: "#16A34A" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("close")}
              </motion.button>
            </motion.div>

            {/* Juz Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2.5 mt-6">
              {juzList.map((juz, index) => {
                const isSelected = selectedJuz.includes(juz);
                return (
                  <motion.button
                    key={juz}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.2 + index * 0.015,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleJuz(juz)}
                    className={`flex flex-col items-center justify-center aspect-square rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? "border-[#16A34A] bg-[#16A34A]/10 text-[#16A34A]"
                        : "border-border bg-muted/40 text-card-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      JUZ
                    </span>
                    <span className="text-lg" style={{ fontFamily: "'Amiri', serif" }}>
                      {juz}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Selected Juz + Surah section */}
            <AnimatePresence mode="wait">
              {selectedJuz.length > 0 && (
                <motion.div
                  ref={surahSectionRef}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  {/* Divider */}
                  <motion.div
                    className="h-px bg-border mt-6"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />

                  {/* Selected Juz Info */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-between mt-5 mb-1"
                  >
                    <h3 className="text-base text-card-foreground">
                      {t("selectedJuz")}
                    </h3>
                    <motion.button
                      onClick={resetJuz}
                      className="text-sm cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: "#16A34A" }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t("resetJuz")}
                    </motion.button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="flex flex-wrap gap-2 mb-5"
                  >
                    {selectedJuz.sort((a, b) => a - b).map((juz) => (
                      <motion.span
                        key={juz}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-[#16A34A]/30 text-[#16A34A] bg-[#16A34A]/5"
                      >
                        Juz {juz}
                      </motion.span>
                    ))}
                  </motion.div>

                  {/* Select Surah */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start justify-between mb-4"
                  >
                    <div>
                      <h3 className="text-base text-card-foreground">
                        {t("selectSurah")}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {t("selectSurahDesc")}
                      </p>
                    </div>
                    <motion.button
                      onClick={selectAllSurahs}
                      className="text-sm cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                      style={{ color: "#16A34A" }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t("allSurahs")}
                    </motion.button>
                  </motion.div>

                  {/* Surah Search */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-3"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={surahSearch}
                        onChange={(e) => setSurahSearch(e.target.value)}
                        placeholder={t("searchSurah")}
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-card-foreground placeholder:text-muted-foreground outline-none focus:border-[#16A34A]/50 transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                      {surahSearch && (
                        <button
                          onClick={() => setSurahSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-card-foreground transition-colors"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>

                  {/* Surah Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                    {filteredSurahs.map((surah, index) => {
                      const isSelected = selectedSurahs.includes(surah.number);
                      return (
                        <motion.button
                          key={surah.number}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.3 + index * 0.04,
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleSurah(surah.number)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "border-[#16A34A] bg-[#16A34A]/8"
                              : "border-border hover:border-muted-foreground/40"
                          }`}
                        >
                          {/* Checkbox */}
                          <motion.div
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "border-[#16A34A] bg-[#16A34A]"
                                : "border-border"
                            }`}
                            animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          <div className="min-w-0">
                            <p className="text-sm text-card-foreground truncate">
                              {surah.number}. {surah.name}
                            </p>
                            <p
                              className="text-xs text-muted-foreground truncate"
                              dir="rtl"
                              style={{ fontFamily: "'Amiri', serif" }}
                            >
                              {surah.arabic}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <motion.div
                    className="h-px bg-border mt-6 mb-6"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />

                  {/* Question Count */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base text-card-foreground">
                        {t("questionCount")}
                      </span>
                      <motion.span
                        key={questionCount}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="text-sm rounded-full px-4 py-1.5"
                        style={{
                          color: "#16A34A",
                          border: "1.5px solid rgba(22, 163, 74, 0.4)",
                        }}
                      >
                        {questionCount} {t("questions")}
                      </motion.span>
                    </div>

                    <div className="flex items-center gap-4">
                      <motion.button
                        onClick={decrement}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-card-foreground bg-muted/60 transition-colors cursor-pointer shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.85 }}
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>

                      <div className="flex-1 relative flex items-center">
                        <input
                          type="range"
                          min={1}
                          max={20}
                          value={questionCount}
                          onChange={(e) => setQuestionCount(Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer slider-green"
                          style={{
                            background: `linear-gradient(to right, #16A34A 0%, #16A34A ${sliderPercent}%, var(--border) ${sliderPercent}%, var(--border) 100%)`,
                          }}
                        />
                        <style>{`
                          .slider-green::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: #16A34A;
                            cursor: pointer;
                            border: none;
                            box-shadow: 0 2px 6px rgba(22, 163, 74, 0.4);
                          }
                          .slider-green::-moz-range-thumb {
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: #16A34A;
                            cursor: pointer;
                            border: none;
                            box-shadow: 0 2px 6px rgba(22, 163, 74, 0.4);
                          }
                        `}</style>
                      </div>

                      <motion.button
                        onClick={increment}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-card-foreground bg-muted/60 transition-colors cursor-pointer shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.85 }}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <div
                      className="flex justify-between mt-2 text-xs text-muted-foreground"
                      style={{ paddingLeft: "3.5rem", paddingRight: "3.5rem" }}
                    >
                      <span>1</span>
                      <span>10</span>
                      <span>20</span>
                    </div>
                  </motion.div>

                  {/* Autoplay Audio */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-between rounded-xl px-5 py-4 mb-6 border border-border"
                  >
                    <span className="text-sm text-card-foreground">
                      {t("autoplayAudio")}
                    </span>
                    <motion.button
                      onClick={() => setAutoplay(!autoplay)}
                      className="relative w-12 h-7 rounded-full cursor-pointer"
                      style={{
                        backgroundColor: autoplay ? "#16A34A" : "var(--muted)",
                      }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        backgroundColor: autoplay ? "#16A34A" : "var(--muted)",
                      }}
                      transition={{ duration: 0.25 }}
                    >
                      <motion.div
                        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                        animate={{ left: autoplay ? "1.5rem" : "0.25rem" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </motion.div>

                  {/* Start Practice Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 text-white rounded-xl cursor-pointer text-base"
                    style={{ backgroundColor: "#16A34A" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#15803d")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#16A34A")
                    }
                    onClick={() => {
                      // If user selected juz but didn't pick specific surahs,
                      // automatically include ALL surahs from selected juz
                      let finalSurahs = selectedSurahs;
                      if (finalSurahs.length === 0 && selectedJuz.length > 0) {
                        finalSurahs = availableSurahs.map((s) => s.number);
                      }
                      setSettings({
                        questionCount,
                        autoplay,
                        selectedSurahs: finalSurahs,
                      });
                      onClose();
                      setShowCountdown(true);
                    }}
                  >
                    {t("startPractice")}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}