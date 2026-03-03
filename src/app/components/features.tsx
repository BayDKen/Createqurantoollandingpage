import { BookOpenCheck, Brain, Leaf } from "lucide-react";
import { useLanguage } from "./language-context";
import { motion } from "motion/react";

const featureIcons = [BookOpenCheck, Brain, Leaf];
const featureKeys = [
  { title: "feature1Title", desc: "feature1Desc" },
  { title: "feature2Title", desc: "feature2Desc" },
  { title: "feature3Title", desc: "feature3Desc" },
];

const iconColors = [
  "bg-primary/10 text-primary",
  "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
];

export function Features() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Subtle background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 blur-3xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
      />

      <div className="max-w-5xl mx-auto px-6 relative">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl md:text-3xl text-foreground mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            {t("featuresTitle")}
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-3"
          >
            <div className="h-px w-8 bg-primary/20" />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="h-px w-8 bg-primary/20" />
          </motion.div>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureKeys.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -6,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className="group relative bg-card rounded-2xl border border-border p-8 hover:shadow-xl hover:shadow-primary/5 transition-shadow duration-500 cursor-default"
              >
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                />

                <motion.div
                  className={`relative w-12 h-12 rounded-xl ${iconColors[index]} flex items-center justify-center mb-5`}
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <h3 className="relative text-lg text-card-foreground mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {t(feature.title)}
                </h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {t(feature.desc)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
