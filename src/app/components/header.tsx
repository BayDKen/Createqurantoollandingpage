import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogIn, LogOut, Moon, Sun, User, BarChart3 } from "lucide-react";
import { useLanguage } from "./language-context";
import { useAuth } from "./auth-context";
import { AuthModal } from "./auth-modal";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import logoImg from "figma:asset/30fa87d76d1b1890e1726173d651c0871eb45f2f.png";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [langOpen, setLangOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const borderColor = darkMode ? "#33302e" : "rgba(45,58,46,0.12)";
  const dropBg = darkMode ? "#292524" : "#ffffff";
  const textPrimary = darkMode ? "#f5f5f4" : "#2d3a2e";
  const textMuted = darkMode ? "#a8a29e" : "#6b7c6e";
  const hoverBg = darkMode ? "#1C1917" : "#f7f5f0";

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border"
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <img src={logoImg} alt="My Muraja'ah" className="w-9 h-9 object-contain" />
            </motion.div>
            <span className="text-foreground tracking-tight">
              <span style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700 }}>My </span>
              <span style={{ fontFamily: "'Amiri', serif", fontWeight: 700, fontStyle: "italic", color: "#16A34A" }}>Muraja'ah</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-2">
            {/* Language Dropdown */}
            <div className="relative" ref={langRef}>
              <motion.button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span className="text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {lang === "en" ? "English" : "Indonesia"}
                </span>
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform"
                  style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </motion.button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full mt-1 w-36 rounded-xl border shadow-lg overflow-hidden z-50"
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
                          setLangOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 cursor-pointer transition-colors"
                        style={{
                          color: lang === opt.code ? "#16A34A" : textPrimary,
                          backgroundColor: lang === opt.code ? "rgba(22,163,74,0.06)" : "rgba(0,0,0,0)",
                          fontFamily: "'Inter', sans-serif",
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

            {/* Dark mode toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all cursor-pointer"
              aria-label="Toggle dark mode"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: 180 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </motion.button>

            {/* Login / User Button */}
            {user ? (
              <div className="relative" ref={userRef}>
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer"
                  style={{ borderColor, color: textPrimary }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: "#16A34A", fontWeight: 700 }}
                  >
                    {(user.user_metadata?.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm max-w-[100px] truncate hidden sm:inline" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {user.user_metadata?.name || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: textMuted }} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-lg overflow-hidden z-50"
                      style={{ backgroundColor: dropBg, borderColor }}
                    >
                      <div className="px-4 py-3 border-b" style={{ borderColor }}>
                        <p className="text-sm truncate" style={{ color: textPrimary, fontWeight: 600 }}>
                          {user.user_metadata?.name || "User"}
                        </p>
                        <p className="text-xs truncate" style={{ color: textMuted }}>
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/progress");
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 cursor-pointer transition-colors"
                        style={{ color: textPrimary }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)")}
                      >
                        <BarChart3 className="w-4 h-4" style={{ color: "#16A34A" }} />
                        {t("myProgress")}
                      </button>
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 cursor-pointer transition-colors"
                        style={{ color: "#ef4444" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0)")}
                      >
                        <LogOut className="w-4 h-4" />
                        {t("logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent/60 transition-all cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm">{t("login")}</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}