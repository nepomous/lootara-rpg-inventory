import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as SecureStore from "expo-secure-store";
import {
  SUPPORTED_LOCALES,
  LANGUAGE_STORE_KEY,
  type SupportedLocale,
} from "@/lib/i18n";

export { type SupportedLocale };

export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLocale = i18n.language as SupportedLocale;

  const changeLanguage = useCallback(
    async (locale: SupportedLocale): Promise<void> => {
      await i18n.changeLanguage(locale);
      try {
        // SEC-02: AFTER_FIRST_UNLOCK é suficiente para preferência não-sensível;
        // garante que o valor não migra para outros dispositivos via backup
        await SecureStore.setItemAsync(LANGUAGE_STORE_KEY, locale, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
      } catch {
        // SecureStore indisponível — a mudança ainda aplica na sessão atual
      }
    },
    [i18n],
  );

  return {
    currentLocale,
    changeLanguage,
    supportedLocales: SUPPORTED_LOCALES as readonly SupportedLocale[],
  };
}
