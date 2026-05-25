/**
 * SEC-03: Logger condicional — console.* só emite em modo de desenvolvimento.
 * Isso impede que dados de compra, tokens ou informações de usuário
 * apareçam em logs de produção acessíveis via ADB logcat ou Xcode Console.
 *
 * Uso: import { logger } from '@/utils/logger'
 *   logger.log('mensagem', dado)
 *   logger.warn('aviso')
 *   logger.error('erro', error)
 */

const isDev = process.env.NODE_ENV === "development" || __DEV__;

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev) console.log("[Lootara]", ...args);
  },
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn("[Lootara]", ...args);
  },
  error: (...args: unknown[]): void => {
    if (isDev) console.error("[Lootara]", ...args);
  },
};
