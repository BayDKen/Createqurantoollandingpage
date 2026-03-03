import { Header } from "./header";
import { Hero } from "./hero";
import { Features } from "./features";
import { Footer } from "./footer";
import { motion, AnimatePresence } from "motion/react";
import { CountdownOverlay } from "./countdown-overlay";
import { usePractice } from "./practice-context";
import { useNavigate } from "react-router";

export function LandingPage() {
  const { showCountdown, setShowCountdown, darkMode, toggleDarkMode } = usePractice();
  const navigate = useNavigate();

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    navigate("/practice");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen flex flex-col"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-1">
          <Hero />
          <Features />
        </main>
        <Footer />
      </motion.div>

      <AnimatePresence>
        {showCountdown && (
          <CountdownOverlay onComplete={handleCountdownComplete} />
        )}
      </AnimatePresence>
    </>
  );
}
