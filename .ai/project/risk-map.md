# Risk map — Lootara

Mapeia as categorias globais (`system/workflows/triage.md`) para caminhos e padrões de conteúdo deste projeto. **O maior tier encontrado vence. Na dúvida, o tier superior.**
Motivo geral: não há backend — os dados locais são a única cópia; perda de dados e erros de compra são irreversíveis para o usuário.

## T2 — Crítico

| Categoria                            | Caminhos                                                                                                         | Padrões de conteúdo no diff                                                                        | Policies              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------- |
| Pagamentos / entitlements / anúncios | `hooks/usePremium.ts`, `store/premiumStore.ts`, `components/ProUpsellSheet.tsx`, `components/AdBanner.tsx`       | `Purchases`, `react-native-purchases`, `isPremium`, `usePremium`, `react-native-google-mobile-ads` | POL-MON               |
| Gating freemium                      | —                                                                                                                | `FREE_CHARACTER_LIMIT`, `ProUpsellSheet`                                                           | POL-FREE, POL-MON     |
| Banco de dados                       | `db/**`, `db/migrations/**`, `hooks/useCharacters.ts`, `hooks/useBag.ts`, `drizzle.config.*`                     | `drizzle-orm`, `expo-sqlite`                                                                       | POL-DB                |
| Import / export                      | `utils/backup.ts`                                                                                                | `exportData`, `importData`, `Share.share`                                                          | POL-BAK, POL-DB       |
| Dados sensíveis                      | —                                                                                                                | `expo-secure-store`, `SecureStore`                                                                 | SEC-002               |
| Rotas / deep links                   | **criar, renomear ou apagar** arquivos em `app/**` (todo arquivo do Expo Router é uma URL); `app/_layout.tsx`    | `Linking`, `scheme`                                                                                | POL-NATIVE, POL-UI    |
| Config nativa / build                | `app.config.*`, `app.json`, `eas.json`, `android/**`, `ios/**`, `plugins/**`, `metro.config.*`, `babel.config.*` | `plugins`                                                                                          | POL-NATIVE            |
| Dependências                         | `package.json` (adicionar / remover / bump major), lockfile                                                      | —                                                                                                  | POL-DEPS              |
| CI/CD                                | `.github/workflows/**`                                                                                           | —                                                                                                  | POL-SECRETS, POL-DEPS |
| Release                              | mudança de version / buildNumber / versionCode                                                                   | —                                                                                                  | POL-NATIVE            |

## T1 — Normal

`app/**` (editar telas existentes), `components/**`, `hooks/**` (demais), `store/**` (demais), `utils/weight.ts`, `constants/**`, `app/legal/licenses.tsx` (+ BR-LIC), `locales/**` com chaves novas/alteradas (+ POL-I18N).

## T0 — Trivial

Docs (`**/*.md` fora de `.ai/` e dos arquivos de agente), comentários, typos, ajustes visuais sem lógica, correção de texto de tradução sem criar/renomear chaves (POL-I18N continua valendo). Se algum padrão T1/T2 casar, não é T0.

## HUMAN-ONLY (agentes não editam; só propõem)

`.ai/**`, `AGENTS.md`, `CLAUDE.md`.

## Policies por área (além das listadas acima)

- Qualquer UI → POL-UI + POL-I18N.
- Todo commit/PR → POL-SECRETS.
- Regras de negócio de domínio → `business-rules.md`.
