import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "./language-context";
import { usePractice } from "./practice-context";

interface CountdownOverlayProps {
  onComplete: () => void;
}

export function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(3);
  const { t } = useLanguage();
  const { darkMode } = usePractice();

  useEffect(() => {
    if (count === 0) {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ backgroundColor: darkMode ? "#1C1917" : "#f7f5f0" }}
    >
      <div className="relative flex items-center justify-center mb-12">
        <motion.div
          className="absolute w-40 h-20 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(22, 163, 74, 0.3)" }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <AnimatePresence mode="wait">
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.3, opacity: 0, filter: "blur(12px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 2, opacity: 0, filter: "blur(12px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative text-9xl md:text-[12rem]"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                color: "#16A34A",
              }}
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-sm md:text-base tracking-[0.3em] uppercase"
        style={{
          fontFamily: "'Inter', sans-serif",
          color: darkMode ? "#a8a29e" : "#6b7c6e",
        }}
      >
        {t("getReady")}
      </motion.p>
    </motion.div>
  );
}
