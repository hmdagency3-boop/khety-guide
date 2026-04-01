import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ar from "./locales/ar.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import zh from "./locales/zh.json";
import ru from "./locales/ru.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English",  flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "العربية",  flag: "🇪🇬", dir: "rtl" },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "es", label: "Español",  flag: "🇪🇸", dir: "ltr" },
  { code: "it", label: "Italiano", flag: "🇮🇹", dir: "ltr" },
  { code: "zh", label: "中文",     flag: "🇨🇳", dir: "ltr" },
  { code: "ru", label: "Русский",  flag: "🇷🇺", dir: "ltr" },
] as const;

export type LangCode = typeof SUPPORTED_LANGUAGES[number]["code"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { t: en }, ar: { t: ar }, fr: { t: fr }, es: { t: es }, it: { t: it }, zh: { t: zh }, ru: { t: ru } },
    defaultNS: "t",
    ns: ["t"],
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "khety_lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export function applyLangDirection(lang: string) {
  const found = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  document.documentElement.dir = found?.dir || "ltr";
  document.documentElement.lang = lang;
}

export default i18n;
