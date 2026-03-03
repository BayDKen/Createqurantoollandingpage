import { useLanguage } from "./language-context";
import { motion } from "motion/react";

export function Footer() {
  const { t } = useLanguage();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="border-t border-border bg-card/50"
    >
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm text-muted-foreground"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {t("copyright")}
        </motion.p>
      </div>
    </motion.footer>
  );
}
