import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import * as SecureStore from "expo-secure-store";

import ptBR from "@/locales/pt-BR/translation.json";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";
import fr from "@/locales/fr/translation.json";
import de from "@/locales/de/translation.json";

export const SUPPORTED_LOCALES = ["pt-BR", "en", "es", "fr", "de"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LANGUAGE_STORE_KEY = "user_language";
export const FALLBACK_LOCALE: SupportedLocale = "pt-BR";

const resources = {
  "pt-BR": { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
} satisfies Record<SupportedLocale, { translation: typeof ptBR }>;

/**
 * Resolves the initial locale:
 * 1. User's saved preference (SecureStore)
 * 2. Device locale if supported
 * 3. Fallback to pt-BR
 */
async function resolveInitialLocale(): Promise<SupportedLocale> {
  // 1. Check saved preference
  try {
    // SEC-02: AFTER_FIRST_UNLOCK — preferência de idioma não é dado sensível;
    // deve ser consistente com o modo usado em useLanguage.ts ao salvar
    const saved = await SecureStore.getItemAsync(LANGUAGE_STORE_KEY, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
    if (saved && (SUPPORTED_LOCALES as readonly string[]).includes(saved)) {
      return saved as SupportedLocale;
    }
  } catch {
    // SecureStore unavailable — continue to next fallback
  }

  // 2. Device locale
  const locales = Localization.getLocales();
  for (const loc of locales) {
    const tag = loc.languageTag; // e.g. "pt-BR", "en-US"
    // Exact match first
    if ((SUPPORTED_LOCALES as readonly string[]).includes(tag)) {
      return tag as SupportedLocale;
    }
    // Language-only match (e.g. "en" from "en-US")
    const lang = tag.split("-")[0];
    const match = SUPPORTED_LOCALES.find(
      (l) => l === lang || l.startsWith(lang + "-"),
    );
    if (match) return match;
  }

  // 3. Fallback
  return FALLBACK_LOCALE;
}

/**
 * Initializes i18next. Must be awaited before rendering the app.
 */
export async function initI18n(): Promise<void> {
  const lng = await resolveInitialLocale();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: FALLBACK_LOCALE,
    interpolation: {
      // React already escapes values
      escapeValue: false,
    },
    compatibilityJSON: "v4",
  });
}

export default i18n;
