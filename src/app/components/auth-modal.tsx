import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useLanguage } from "./language-context";
import { useAuth } from "./auth-context";
import { usePractice } from "./practice-context";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { t } = useLanguage();
  const { signIn, signUp } = useAuth();
  const { darkMode } = usePractice();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPwd("");
    setName("");
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === "register") {
      if (!email || !password || !name || !confirmPwd) {
        setError(t("fillAllFields"));
        return;
      }
      if (password !== confirmPwd) {
        setError(t("passwordMismatch"));
        return;
      }
    } else {
      if (!email || !password) {
        setError(t("fillAllFields"));
        return;
      }
    }

    setLoading(true);

    if (mode === "register") {
      const { error: err } = await signUp(email, password, name);
      if (err) {
        setError(err);
      } else {
        setSuccess(t("registerSuccess"));
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1200);
      }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
      } else {
        setSuccess(t("loginSuccess"));
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1200);
      }
    }

    setLoading(false);
  };

  const bg = darkMode ? "#1C1917" : "#ffffff";
  const cardBg = darkMode ? "#292524" : "#ffffff";
  const borderColor = darkMode ? "#33302e" : "rgba(45,58,46,0.12)";
  const textPrimary = darkMode ? "#f5f5f4" : "#2d3a2e";
  const textMuted = darkMode ? "#a8a29e" : "#6b7c6e";
  const inputBg = darkMode ? "#1C1917" : "#f7f5f0";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: cardBg, borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <h2
                className="text-xl"
                style={{ color: textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
              >
                {mode === "login" ? t("loginTitle") : t("registerTitle")}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                style={{ color: textMuted }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Decorative line */}
            <div className="px-6 pb-4 pt-1">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ backgroundColor: borderColor }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#16A34A", opacity: 0.5 }} />
                <div className="h-px flex-1" style={{ backgroundColor: borderColor }} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              {/* Name (register only) */}
              <AnimatePresence>
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: textMuted }}>
                      {t("name")}
                    </label>
                    <div
                      className="flex items-center gap-3 rounded-xl border px-4 py-3"
                      style={{ borderColor, backgroundColor: inputBg }}
                    >
                      <User className="w-4 h-4 shrink-0" style={{ color: textMuted }} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("name")}
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: textPrimary, fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: textMuted }}>
                  {t("email")}
                </label>
                <div
                  className="flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{ borderColor, backgroundColor: inputBg }}
                >
                  <Mail className="w-4 h-4 shrink-0" style={{ color: textMuted }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: textPrimary, fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: textMuted }}>
                  {t("password")}
                </label>
                <div
                  className="flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{ borderColor, backgroundColor: inputBg }}
                >
                  <Lock className="w-4 h-4 shrink-0" style={{ color: textMuted }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: textPrimary, fontFamily: "'Inter', sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer"
                    style={{ color: textMuted }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (register only) */}
              <AnimatePresence>
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: textMuted }}>
                      {t("confirmPassword")}
                    </label>
                    <div
                      className="flex items-center gap-3 rounded-xl border px-4 py-3"
                      style={{ borderColor, backgroundColor: inputBg }}
                    >
                      <Lock className="w-4 h-4 shrink-0" style={{ color: textMuted }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        placeholder="********"
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: textPrimary, fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error / Success messages */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-center py-2 px-3 rounded-lg"
                    style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)" }}
                  >
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 text-sm py-2 px-3 rounded-lg"
                    style={{ color: "#16A34A", backgroundColor: "rgba(22,163,74,0.08)" }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3 rounded-xl text-white text-sm cursor-pointer flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "#16A34A",
                  opacity: loading ? 0.7 : 1,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "login" ? t("loginTitle") : t("registerTitle")}
              </motion.button>

              {/* Switch mode */}
              <p className="text-center text-sm" style={{ color: textMuted }}>
                {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="cursor-pointer underline"
                  style={{ color: "#16A34A" }}
                >
                  {mode === "login" ? t("registerHere") : t("loginHere")}
                </button>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
