import React, { createContext, useContext, useState, useEffect } from "react";

export interface PracticeSettings {
  questionCount: number;
  autoplay: boolean;
  selectedSurahs: number[];
}

interface PracticeContextType {
  settings: PracticeSettings;
  setSettings: (s: PracticeSettings) => void;
  showCountdown: boolean;
  setShowCountdown: (v: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PracticeSettings>({
    questionCount: 10,
    autoplay: true,
    selectedSurahs: [],
  });
  const [showCountdown, setShowCountdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <PracticeContext.Provider
      value={{ settings, setSettings, showCountdown, setShowCountdown, darkMode, toggleDarkMode }}
    >
      {children}
    </PracticeContext.Provider>
  );
}

export function usePractice() {
  const context = useContext(PracticeContext);
  if (!context) throw new Error("usePractice must be used within PracticeProvider");
  return context;
}
