import { X, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "./language-context";
import { motion, AnimatePresence } from "motion/react";
import { usePractice } from "./practice-context";

interface PracticeSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function PracticeSettingsModal({ open, onClose }: PracticeSettingsModalProps) {
  const { t } = useLanguage();
  const { setSettings, setShowCountdown } = usePractice();
  const [questionCount, setQuestionCount] = useState(10);
  const [autoplay, setAutoplay] = useState(true);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionCount(Number(e.target.value));
  };

  const decrement = () => setQuestionCount((prev) => Math.max(1, prev - 1));
  const increment = () => setQuestionCount((prev) => Math.min(20, prev + 1));

  const sliderPercent = ((questionCount - 1) / 19) * 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between mb-8"
            >
              <h2
                className="text-xl text-card-foreground"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {t("practiceSettings")}
              </h2>
              <motion.button
                onClick={onClose}
                className="text-muted-foreground hover:text-card-foreground transition-colors cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Question Count */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-base text-card-foreground">{t("questionCount")}</span>
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
                    onChange={handleSliderChange}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer slider-practice"
                    style={{
                      background: `linear-gradient(to right, #16A34A 0%, #16A34A ${sliderPercent}%, var(--border) ${sliderPercent}%, var(--border) 100%)`,
                    }}
                  />
                  <style>{`
                    .slider-practice::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #16A34A;
                      cursor: pointer;
                      border: none;
                      box-shadow: 0 2px 6px rgba(22, 163, 74, 0.4);
                    }
                    .slider-practice::-moz-range-thumb {
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
              transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between rounded-xl px-5 py-4 mb-8 border border-border"
            >
              <span className="text-sm text-card-foreground">{t("autoplayAudio")}</span>
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
              transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
                setSettings({ questionCount, autoplay, selectedSurahs: [] });
                onClose();
                setShowCountdown(true);
              }}
            >
              {t("startPractice")}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}