import React, { createContext, useContext, useState } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Header
  login: { id: "Masuk", en: "Login" },

  // Hero
  bismillah: { id: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", en: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
  heroQuote: {
    id: "\"Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.\"",
    en: "\"The best among you are those who learn the Qur'an and teach it.\"",
  },
  heroQuoteSource: { id: "— HR. Bukhari", en: "— Sahih Bukhari" },
  heroDescription: {
    id: "Latih hafalan Al-Qur'an dengan metode sambung ayat. Sederhana, fokus, dan tanpa gangguan.",
    en: "Practice Qur'an memorization with the verse continuation method. Simple, focused, and distraction-free.",
  },
  heroSubtitle: { id: "LATIHAN HAFALAN AL-QUR'AN", en: "QUR'AN MEMORIZATION PRACTICE" },
  hadithQuote: {
    id: "\"Sebaik-baik orang di antara kamu adalah orang yang belajar Al-Qur'an dan mengajarkannya.\"",
    en: "\"The best among you are those who learn the Qur'an and teach it.\"",
  },
  hadithSource: { id: "HR Bukhari", en: "Sahih Bukhari" },
  ctaStartPractice: { id: "Mulai Latihan", en: "Start Practice" },
  ctaSelectJuz: { id: "Pilih Juz", en: "Select Juz" },

  // Practice Settings Modal
  practiceSettings: { id: "Pengaturan Latihan", en: "Practice Settings" },
  questionCount: { id: "Jumlah Soal", en: "Question Count" },
  questions: { id: "Soal", en: "Questions" },
  autoplayAudio: { id: "Putar Audio Otomatis", en: "Autoplay Audio" },
  startPractice: { id: "Mulai Latihan", en: "Start Practice" },

  // Juz Selector Modal
  selectJuz: { id: "Pilih Juz", en: "Select Juz" },
  selectJuzDesc: { id: "Pilih satu atau lebih juz untuk latihan", en: "Select one or more juz to practice" },
  close: { id: "Tutup", en: "Close" },
  selected: { id: "dipilih", en: "selected" },
  confirm: { id: "Konfirmasi", en: "Confirm" },

  // Surah & Combined Modal
  selectedJuz: { id: "Juz Terpilih", en: "Selected Juz" },
  resetJuz: { id: "Reset Juz", en: "Reset Juz" },
  selectSurah: { id: "Pilih Surat", en: "Select Surah" },
  selectSurahDesc: { id: "Pilih satu atau lebih surat", en: "Select one or more surahs" },
  allSurahs: { id: "Semua Surat", en: "All Surahs" },

  // Features
  featuresTitle: { id: "Fitur Utama", en: "Key Features" },
  feature1Title: { id: "Ayat per Ayat", en: "Verse by Verse" },
  feature1Desc: {
    id: "Latihan berkelanjutan dengan umpan balik langsung untuk setiap ayat yang kamu hafal.",
    en: "Continuous practice with instant feedback for every verse you memorize.",
  },
  feature2Title: { id: "Active Recall", en: "Active Recall" },
  feature2Desc: {
    id: "Perkuat hafalan dengan melanjutkan ayat berikutnya dari ingatan.",
    en: "Strengthen memory by continuing the next verse from recall.",
  },
  feature3Title: { id: "Fokus Ibadah", en: "Focus on Worship" },
  feature3Desc: {
    id: "Desain minimalis dan bebas iklan. Murni untuk ibadah dan belajar.",
    en: "Minimalist design, completely ad-free. Purely for worship and learning.",
  },

  // Footer
  copyright: {
    id: "© 2026 My Muraja'ah. Dibuat dengan ❤️ untuk umat.",
    en: "© 2026 My Muraja'ah. Made with ❤️ for the ummah.",
  },
  donation: { id: "Dukung Kami", en: "Support Us" },
  donationDesc: {
    id: "Bantu kami tetap gratis dan bebas iklan",
    en: "Help us stay free and ad-free",
  },

  // Countdown
  getReady: { id: "BERSIAP...", en: "GET READY..." },

  // Practice Page
  questionLabel: { id: "PERTANYAAN", en: "QUESTION" },
  points: { id: "POIN", en: "PTS" },
  playTilawah: { id: "Putar Tilawah", en: "Play Tilawah" },
  verse: { id: "Ayat", en: "Verse" },
  dragDropInstruction: { id: "Tarik ayat yang benar ke sini", en: "Drag the correct verse here" },
  confirmAnswer: { id: "Konfirmasi Jawaban", en: "Confirm Answer" },
  changeAnswer: { id: "Ganti Jawaban", en: "Change Answer" },
  selectCorrectVerse: { id: "Pilih ayat yang benar di bawah", en: "Select the correct verse below" },
  correct: { id: "Benar! Masya Allah", en: "Correct! Masha Allah" },
  incorrect: { id: "Kurang tepat, coba lagi nanti", en: "Not quite right, try again later" },
  practiceComplete: { id: "Latihan Selesai!", en: "Practice Complete!" },
  yourScore: { id: "Skor kamu", en: "Your score" },
  tryAgain: { id: "Ulangi Latihan", en: "Try Again" },
  backToHome: { id: "Kembali ke Beranda", en: "Back to Home" },

  // Voice Recognition
  voiceAnswer: { id: "Jawab dengan Suara", en: "Answer by Voice" },
  listening: { id: "Mendengarkan...", en: "Listening..." },
  voiceNotSupported: { id: "Browser tidak mendukung pengenalan suara", en: "Browser does not support voice recognition" },
  orSpeakVerse: { id: "atau ucapkan ayat", en: "or speak the verse" },
  voiceRequesting: { id: "Meminta izin mikrofon...", en: "Requesting microphone..." },
  voiceSpeechDetected: { id: "Mendengar suara Anda...", en: "Hearing your voice..." },
  voiceProcessing: { id: "Memproses...", en: "Processing..." },
  voiceMatched: { id: "Ayat ditemukan!", en: "Verse matched!" },
  voiceNoMatch: { id: "Tidak cocok, coba lagi", en: "No match, try again" },
  voiceNoSpeech: { id: "Tidak terdeteksi suara", en: "No speech detected" },
  voiceMicBlocked: { id: "Akses mikrofon ditolak. Izinkan di pengaturan browser.", en: "Microphone access denied. Allow it in browser settings." },
  voiceNetworkError: { id: "Kesalahan jaringan. Periksa koneksi internet.", en: "Network error. Check your internet connection." },
  voiceYouSaid: { id: "Yang Anda baca", en: "What you recited" },
  voiceMatchConfidence: { id: "Kecocokan", en: "Match confidence" },
  voiceTryAgain: { id: "Tidak cocok dengan pilihan. Coba baca lebih jelas.", en: "Doesn't match any option. Try reciting more clearly." },
  voiceTip: { id: "Klik tombol lalu baca lanjutan ayat dengan jelas", en: "Click the button then recite the next verse clearly" },

  // Auth
  loginTitle: { id: "Masuk", en: "Sign In" },
  registerTitle: { id: "Daftar", en: "Sign Up" },
  email: { id: "Email", en: "Email" },
  password: { id: "Kata Sandi", en: "Password" },
  name: { id: "Nama", en: "Name" },
  confirmPassword: { id: "Konfirmasi Kata Sandi", en: "Confirm Password" },
  noAccount: { id: "Belum punya akun?", en: "Don't have an account?" },
  hasAccount: { id: "Sudah punya akun?", en: "Already have an account?" },
  registerHere: { id: "Daftar di sini", en: "Register here" },
  loginHere: { id: "Masuk di sini", en: "Sign in here" },
  logout: { id: "Keluar", en: "Sign Out" },
  welcomeBack: { id: "Selamat datang kembali", en: "Welcome back" },
  registerSuccess: { id: "Pendaftaran berhasil!", en: "Registration successful!" },
  loginSuccess: { id: "Berhasil masuk!", en: "Signed in successfully!" },
  logoutSuccess: { id: "Berhasil keluar", en: "Signed out successfully" },
  passwordMismatch: { id: "Kata sandi tidak cocok", en: "Passwords do not match" },
  fillAllFields: { id: "Mohon isi semua kolom", en: "Please fill in all fields" },
  language: { id: "Bahasa", en: "Language" },

  // Search
  searchSurah: { id: "Cari surat...", en: "Search surah..." },

  // Progress
  myProgress: { id: "Progress Saya", en: "My Progress" },
  progressTitle: { id: "Progress Hafalan", en: "Memorization Progress" },
  progressGreeting: { id: "Assalamu'alaikum", en: "Assalamu'alaikum" },
  progressSubtitle: { id: "Berikut ringkasan perjalanan hafalan Anda", en: "Here's a summary of your memorization journey" },
  progressLoginRequired: { id: "Masuk untuk Melihat Progress", en: "Sign In to View Progress" },
  progressLoginDesc: { id: "Masuk ke akun Anda untuk menyimpan dan melihat riwayat latihan hafalan.", en: "Sign in to your account to save and view your memorization practice history." },
  totalPractices: { id: "Total Latihan", en: "Total Practices" },
  avgScore: { id: "Rata-rata Skor", en: "Average Score" },
  bestScore: { id: "Skor Terbaik", en: "Best Score" },
  streak: { id: "Streak Hari", en: "Day Streak" },
  recentHistory: { id: "Riwayat Terbaru", en: "Recent History" },
  sessions: { id: "sesi", en: "sessions" },
  noHistory: { id: "Belum ada riwayat latihan. Mulai latihan pertamamu!", en: "No practice history yet. Start your first practice!" },
  correctAnswers: { id: "jawaban benar", en: "correct answers" },
  viewProgress: { id: "Lihat Progress", en: "View Progress" },
  
  // Result Screen
  congratulations: { id: "Selamat! 🎉", en: "Congratulations! 🎉" },
  mashaaAllah: { id: "Masya Allah, Tabarakallah!", en: "Masha Allah, Tabarakallah!" },
  keepPracticing: { id: "Terus berlatih, semangat!", en: "Keep practicing, you can do it!" },
  goodEffort: { id: "Usaha yang bagus, terus tingkatkan!", en: "Good effort, keep improving!" },
  totalCorrect: { id: "Jawaban Benar", en: "Correct Answers" },
  totalWrong: { id: "Jawaban Salah", en: "Wrong Answers" },
  scorePercentage: { id: "Persentase Skor", en: "Score Percentage" },
  perfectScore: { id: "Sempurna! Hafalan kamu luar biasa!", en: "Perfect! Your memorization is amazing!" },
  greatScore: { id: "Hebat! Hampir sempurna!", en: "Great! Almost perfect!" },
  goodScore: { id: "Bagus! Terus tingkatkan hafalan!", en: "Good! Keep improving your memorization!" },
  needsWork: { id: "Jangan menyerah! Terus berlatih!", en: "Don't give up! Keep practicing!" },

  // Progress Detail
  practiceDetail: { id: "Detail Latihan", en: "Practice Detail" },
  totalQuestionsLabel: { id: "Jumlah Soal", en: "Total Questions" },
  answeredByVoice: { id: "Dijawab dengan Suara", en: "Answered by Voice" },
  answeredByDrag: { id: "Dijawab dengan Drag", en: "Answered by Drag" },
  playRecording: { id: "Putar Rekaman", en: "Play Recording" },
  stopRecording: { id: "Berhenti", en: "Stop" },
  voiceRecording: { id: "Rekaman Suara", en: "Voice Recording" },
  noRecording: { id: "Rekaman tidak tersedia", en: "Recording not available" },
  surahLabel: { id: "Surat", en: "Surah" },
  ayatLabel: { id: "Ayat", en: "Verse" },
  yourAnswer: { id: "Jawaban Anda", en: "Your Answer" },
  correctAnswerLabel: { id: "Jawaban Benar", en: "Correct Answer" },
  clickToExpand: { id: "Klik untuk melihat detail", en: "Click to see details" },
  voiceConfidence: { id: "Kecocokan Suara", en: "Voice Confidence" },
  transcript: { id: "Transkripsi", en: "Transcript" },
  playYourRecording: { id: "Putar rekaman suara Anda", en: "Play your voice recording" },
  stopPlayback: { id: "Hentikan pemutaran", en: "Stop playback" },
  yourVoiceRecording: { id: "Rekaman Suara Anda", en: "Your Voice Recording" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Default fallback for when context is not available (e.g., during HMR)
const defaultTranslate = (key: string): string => {
  const entry = translations[key];
  if (!entry) return key;
  return entry["id"] || key;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("id");

  const toggleLang = () => setLang((prev) => (prev === "id" ? "en" : "id"));

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return safe defaults instead of throwing - prevents crash during HMR
    return {
      lang: "id" as Language,
      setLang: () => {},
      toggleLang: () => {},
      t: defaultTranslate,
    };
  }
  return context;
}