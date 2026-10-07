# Migration map — CLAUDE.legacy.md → .ai/

Nada foi descartado. Cada seção do arquivo legado tem destino.
Classes: GLOBAL RULE · PROJECT CONTEXT · BUSINESS RULE · AGENT BEHAVIOR · VALIDATION.

| Seção legada                                                                           | Classe                        | Destino                                                                                              |
| -------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| Cabeçalho ("Leia CLAUDE.md e SPEC.md")                                                 | AGENT BEHAVIOR                | `AGENTS.md` §1/§5 (SPEC.md como referência de produto)                                               |
| O Projeto                                                                              | PROJECT CONTEXT               | `context.md` > O Projeto                                                                             |
| Stack & Versões                                                                        | PROJECT CONTEXT               | `context.md` > Stack, Parameters                                                                     |
| Estrutura de Pastas                                                                    | PROJECT CONTEXT               | `context.md` > Estrutura de Pastas                                                                   |
| Convenções > Geral (strict, nomes em inglês, strings em português)                     | GLOBAL RULE + PROJECT CONTEXT | TS-001/TS-002/TS-006; `context.md` Parameters. "Strings de UI em português" substituído por POL-I18N |
| Convenções > Componentes                                                               | GLOBAL RULE                   | RN-001, RN-002 (200 em Parameters), RN-003, RN-005                                                   |
| Convenções > Hooks                                                                     | GLOBAL RULE + PROJECT CONTEXT | RN-003, RN-004; `context.md` AD-004/AD-007                                                           |
| Convenções > Banco de Dados                                                            | GLOBAL RULE + PROJECT CONTEXT | POL-DB; `context.md` AD-004/AD-005; BR-CHAR-003                                                      |
| Convenções > Biblioteca de Itens                                                       | PROJECT CONTEXT               | `context.md` AD-002                                                                                  |
| Convenções > Estado Global                                                             | GLOBAL RULE + PROJECT CONTEXT | RN-004; `context.md` AD-003                                                                          |
| Regras de Negócio > Personagem                                                         | BUSINESS RULE                 | BR-CHAR-001..003; BR-FREE-001..004 (`policies/freemium-limits.md`)                                   |
| Regras de Negócio > Sacola                                                             | BUSINESS RULE                 | BR-BAG-001..004                                                                                      |
| Regras de Negócio > Monetização                                                        | BUSINESS RULE + VALIDATION    | `policies/monetization.md` (BR-MON-001..010 + VERIFY)                                                |
| Regras de Negócio > Backup & Restore                                                   | BUSINESS RULE + VALIDATION    | `policies/backup.md` (BR-BAK-001..005 + VERIFY)                                                      |
| Regras de Negócio > Licenças e Atribuição                                              | BUSINESS RULE                 | BR-LIC-001..003                                                                                      |
| O que o Agente NÃO deve fazer: backend/SQL raw/tabela da biblioteca/Context/StyleSheet | PROJECT CONTEXT               | `context.md` Constraints                                                                             |
| ...: não commitar chaves                                                               | GLOBAL RULE                   | SEC-001, EXPO-003                                                                                    |
| ...: componentes > 200 linhas                                                          | GLOBAL RULE                   | RN-002                                                                                               |
| ...: não omitir código com `// ...`                                                    | AGENT BEHAVIOR                | CORE-002 (adaptada: sem "mostrar o arquivo completo no chat")                                        |
| ...: não editar sem confirmar import / não criar sem verificar / não assumir uso       | AGENT BEHAVIOR                | CORE-003, CORE-004; POL-UI                                                                           |
| Checklist pré-implementação de UI                                                      | VALIDATION                    | POL-UI; retro 0001                                                                                   |
| Validação de Traduções (regras)                                                        | GLOBAL RULE + PROJECT CONTEXT | POL-I18N; `context.md` Parameters, AD-006                                                            |
| Checklist pré-entrega                                                                  | VALIDATION                    | `gates.md` Gate A; `gates.local.md`                                                                  |
| Regra "tsc ao final de cada prompt"                                                    | VALIDATION                    | CORE-011, Gate A check 1                                                                             |
| Checklist de segurança                                                                 | VALIDATION + AGENT BEHAVIOR   | POL-SECRETS; CORE-007 (git filter-repo + force-push passou a ser só humano)                          |
| Comandos Úteis                                                                         | PROJECT CONTEXT               | `context.md` Commands; `gates.local.md`; POL-SECRETS                                                 |
| Contexto de RPG                                                                        | BUSINESS RULE                 | BR-RPG-001..004                                                                                      |
| AGENTS.md ("Expo HAS CHANGED")                                                         | GLOBAL RULE                   | EXPO-001; POL-DEPS; `context.md` sdk_version                                                         |
