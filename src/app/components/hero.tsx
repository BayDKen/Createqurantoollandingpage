import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "./language-context";
import { motion } from "motion/react";
import { PracticeSettingsModal } from "./practice-settings-modal";
import { JuzSelectorModal } from "./juz-selector-modal";
import logoImg from "figma:asset/30fa87d76d1b1890e1726173d651c0871eb45f2f.png";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: {
    duration: 0.8,
    delay,
    ease: [0.22, 1, 0.36, 1],
  },
});

export function Hero() {
  const { t } = useLanguage();
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [juzOpen, setJuzOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden">
        {/* Animated decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-accent/40 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 flex flex-col items-center text-center">
          {/* Bismillah */}
          <motion.p
            {...fadeUp(0.1)}
            className="text-2xl md:text-4xl text-primary/70 mb-8 leading-relaxed"
            style={{ fontFamily: "'Amiri', serif" }}
            dir="rtl"
          >
            {t("bismillah")}
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="h-px w-12 bg-primary/20" />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="h-px w-12 bg-primary/20" />
          </motion.div>

          {/* App Title - My Muraja'ah */}
          <motion.h1
            {...fadeUp(0.5)}
            className="mb-6"
          >
            <span
              className="text-5xl md:text-7xl text-foreground"
              style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700 }}
            >
              My{" "}
            </span>
            <span
              className="text-5xl md:text-7xl italic"
              style={{ fontFamily: "'Amiri', serif", fontWeight: 700, color: "#16A34A" }}
            >
              Muraja'ah
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeUp(0.7)}
            className="text-xs md:text-sm tracking-[0.25em] text-muted-foreground mb-10 uppercase"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {t("heroSubtitle")}
          </motion.p>

          {/* Hadith Quote - simple text only */}
          <motion.div
            {...fadeUp(0.85)}
            className="mb-12 flex flex-col items-center"
          >
            <p
              className="text-sm md:text-base text-foreground/60 italic leading-relaxed mb-2"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {t("hadithQuote")}
            </p>
            <p
              className="text-xs md:text-sm text-muted-foreground"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
            >
              {t("hadithSource")}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            {...fadeUp(0.9)}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => setPracticeOpen(true)}
              className="group flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow cursor-pointer"
            >
              <span className="text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
                {t("ctaStartPractice")}
              </span>
              <motion.span
                className="inline-flex"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => setJuzOpen(true)}
              className="group flex items-center gap-3 px-8 py-4 border border-primary/30 text-primary rounded-xl hover:bg-primary/5 transition-all cursor-pointer"
            >
              <img src={logoImg} alt="My Muraja'ah" className="w-5 h-5 object-contain" />
              <span className="text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
                {t("ctaSelectJuz")}
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      <PracticeSettingsModal open={practiceOpen} onClose={() => setPracticeOpen(false)} />
      <JuzSelectorModal open={juzOpen} onClose={() => setJuzOpen(false)} />
    </>
  );
}