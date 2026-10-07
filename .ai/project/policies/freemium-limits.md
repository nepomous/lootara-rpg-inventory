# POL-FREE — Limite do plano grátis (projeto)

- **TRIGGER:** A tarefa toca criação de personagem, `FREE_CHARACTER_LIMIT`, o FAB da home, `app/character/new.tsx`, o contador da home. **Tier T2** (padrão de conteúdo `FREE_CHARACTER_LIMIT` no risk-map).
- **ORIGIN:** legacy "Regras de Negócio > Personagem".

## Regras

### BR-FREE-001 — Limite

- RULE: Plano grátis limitado a `FREE_CHARACTER_LIMIT` (3, em `constants/rpg.ts`) personagens. Ao tentar criar além do limite sem ser Pro, abre o `ProUpsellSheet` em vez de navegar para a criação.

### BR-FREE-002 — Gating em dois pontos

- RULE: O gate é aplicado no FAB da home (`app/(tabs)/index.tsx`) **e**, como defesa em profundidade, no `onSubmit` de `app/character/new.tsx`.
- REASON: o segundo ponto cobre entrada por deep link (ver RN-008).

### BR-FREE-003 — Contador

- RULE: A home exibe `"{count} / {limit} personagens"` para usuários grátis. Usuários Pro não veem o limite.

### BR-FREE-004 — Existentes nunca afetados

- RULE: Personagens existentes nunca são bloqueados, ocultados ou apagados pelo gate — ele só impede a criação do próximo.

## VERIFY

1. O limite vem da constante `FREE_CHARACTER_LIMIT`, não de número hardcoded.
2. Os dois pontos de gate existem e usam a mesma lógica.
3. Entrada direta em `/character/new` por usuário grátis no limite é bloqueada no submit.
4. Usuário Pro: sem contador, sem bloqueio.
5. Usuário com mais personagens que o limite (ex.: ex-Pro): nada é ocultado/apagado; só a criação é bloqueada.
6. Texto do contador via i18n com interpolação, nos 5 locales.

- **OWNER:** Developer · QA (direct entry, grátis × Pro, acima do limite) · Reviewer.
