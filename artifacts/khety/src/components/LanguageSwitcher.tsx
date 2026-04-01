import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, applyLangDirection, type LangCode } from "@/i18n";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation("t");
  const current = i18n.language as LangCode;

  function changeLanguage(code: string) {
    i18n.changeLanguage(code);
    applyLangDirection(code);
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <motion.button
            key={lang.code}
            whileTap={{ scale: 0.92 }}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
              current === lang.code
                ? "bg-primary/20 text-primary border-primary/40"
                : "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30"
            )}
          >
            <span className="text-sm">{lang.flag}</span>
            <span>{lang.label}</span>
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        {t("lang.choose")}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <motion.button
            key={lang.code}
            whileTap={{ scale: 0.95 }}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border text-sm font-semibold transition-all",
              current === lang.code
                ? "bg-primary/15 text-primary border-primary/40 shadow-md shadow-primary/10"
                : "bg-card border-border/50 text-foreground hover:border-primary/30 hover:bg-primary/5"
            )}
          >
            <span className="text-xl">{lang.flag}</span>
            <span>{lang.label}</span>
            {current === lang.code && (
              <span className="ml-auto text-primary text-xs">✓</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
