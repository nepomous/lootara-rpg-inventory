# Gates — adições do Lootara

Concretiza o Gate A (`.ai/system/gates.md`) com os comandos deste projeto.

| #   | Check          | Comando                                                                                          |
| --- | -------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Typecheck      | `npx tsc --noEmit`                                                                               |
| 2   | Lint           | `npm run lint`                                                                                   |
| 3   | Testes         | `npm test` — **CONFIRMAR** que há testes configurados; se não, `NOT AVAILABLE`                   |
| 4   | Secrets scan   | `bash scripts/check-secrets.sh` (se existir) senão o `grep` do POL-SECRETS                       |
| 5   | Paridade i18n  | `node scripts/check-i18n.mjs` (se existir) senão conferência manual dos 5 arquivos de `locales/` |
| 6   | Placeholders   | busca no diff por `// ...` e `TODO: implement`                                                   |
| 7   | Escopo do diff | arquivos alterados explicados pelo brief/plan                                                    |

## Adicionais por gatilho

- `db/schema.ts` alterado → `npx drizzle-kit generate` produziu migration e ela está no diff.
- Padrões de POL-MON / POL-FREE / POL-BAK no diff → a VERIFY da policy correspondente tem evidência.
- Qualquer texto visível alterado → POL-I18N com tabela chave × locale.
