import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Language, getTranslation } from "@/lib/i18n";

const WHATSAPP_KEY = "@servcontrol/whatsapp";
const LANG_KEY = "@servcontrol/language";
const DEFAULT_WHATSAPP = "5511985206774";

interface SettingsContextValue {
  whatsappNumber: string;
  setWhatsappNumber: (n: string) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  tr: ReturnType<typeof getTranslation>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [whatsappNumber, setWhatsappNumberState] = useState(DEFAULT_WHATSAPP);
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    (async () => {
      const [wn, lang] = await Promise.all([
        AsyncStorage.getItem(WHATSAPP_KEY),
        AsyncStorage.getItem(LANG_KEY),
      ]);
      if (wn) setWhatsappNumberState(wn);
      if (lang) setLanguageState(lang as Language);
    })();
  }, []);

  const setWhatsappNumber = (n: string) => {
    setWhatsappNumberState(n);
    AsyncStorage.setItem(WHATSAPP_KEY, n).catch(() => {});
  };
  const setLanguage = (l: Language) => {
    setLanguageState(l);
    AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
  };

  return (
    <SettingsContext.Provider value={{ whatsappNumber, setWhatsappNumber, language, setLanguage, tr: getTranslation(language) }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
