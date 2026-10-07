# Regras de Negócio — Lootara

> Migrado de `_legacy/CLAUDE.legacy.md` (Regras de Negócio e Contexto de RPG). São regras do Lootara: **NÃO** promover a global.
> Formato: RULE / REASON / VALIDATION. "REASON: não documentado" = completar quando o motivo for confirmado.
> Monetização, limite freemium e backup ficam em `policies/` junto com sua verificação (POL-MON, POL-FREE, POL-BAK).

## Personagem

### BR-CHAR-001 — Nível

- RULE: Nível do personagem de 1 a 20, validado no form com Zod.
- REASON: não documentado.
- VALIDATION: testar 0, 1, 20, 21 e valores não inteiros no form.

### BR-CHAR-002 — Sistema

- RULE: Sistema ∈ `'dnd5e' | 'pf1' | 'pf2' | 'other'`; afeta os filtros de itens da biblioteca.
- REASON: não documentado.
- VALIDATION: mudar o sistema altera os itens exibidos; itens `generic` aparecem em todos.

### BR-CHAR-003 — Delete em cascata

- RULE: Deletar um personagem remove **todos** os seus `bag_items` (cascade no schema Drizzle).
- REASON: não documentado (inferido: evitar itens órfãos).
- VALIDATION: teste de delete com itens associados; conferir o schema (POL-DB).

## Sacola (Bag)

### BR-BAG-001 — Uma sacola por personagem

- RULE: Cada personagem tem exatamente uma sacola; não é entidade separada, é o conjunto de `bag_items` com aquele `characterId`.
- REASON / VALIDATION: não documentado; conferir que nenhuma tabela de "bag" foi criada.

### BR-BAG-002 — Localização

- RULE: `location` ∈ `'equipped'` (no corpo) | `'backpack'` (mochila) | `'stored'` (guardado/baú).
- REASON / VALIDATION: não documentado; validar enum no schema e nos forms.

### BR-BAG-003 — Peso carregado

- RULE: Peso carregado = soma de `weight × quantity` dos itens com `location !== 'stored'`.
- REASON: não documentado.
- VALIDATION: testes em `utils/weight.ts` com itens em cada `location`.

### BR-BAG-004 — Peso do item

- RULE: O peso do item vem do array estático via `itemId`; itens custom têm `weight = 0` por padrão (o usuário pode informar nas notas).
- REASON / VALIDATION: não documentado; testar item custom e item da biblioteca.

## Sistemas de RPG (ao gerar itens, descrições e lógica de jogo)

### BR-RPG-001 — D&D 5e

- RULE: Peso em libras (lbs). Capacidade = STR × 15 lbs. Moedas: CP, SP, EP, GP, PP. Preços em GP por padrão.

### BR-RPG-002 — Pathfinder 1e

- RULE: Mesmo sistema de peso do D&D 3.5 (tabela light/medium/heavy por STR).

### BR-RPG-003 — Pathfinder 2e

- RULE: Sistema Bulk: L (leve), 1, 2... · 10 itens L = 1 Bulk · limite = STR mod + 5. No MVP: exibir em libras com a nota "≈ X Bulk" calculada.

### BR-RPG-004 — Itens genéricos

- RULE: Itens com tag `'generic'` aparecem em todos os sistemas.
- (BR-RPG-001..004) REASON: regras dos sistemas de jogo. VALIDATION: casos de teste por sistema.

## Licenças e Atribuição

### BR-LIC-001 — SRD / CC-BY-4.0

- RULE: O app usa conteúdo do SRD 5.1 e SRD 5.2.1 (Wizards of the Coast) sob Creative Commons Attribution 4.0.
- REASON: obrigação legal da licença.

### BR-LIC-002 — Tela de atribuição

- RULE: A atribuição é exibida em `app/legal/licenses.tsx`, acessível via `LegalCard` em settings. O corpo jurídico fica em **inglês** e **não deve ser traduzido nem removido**.
- VALIDATION: qualquer mudança em `licenses.tsx`/`LegalCard` preserva o texto legal e continua acessível.

### BR-LIC-003 — Itens autorais

- RULE: Itens em `constants/items.ts` são genéricos/autorais; a atribuição cobre o uso de mecânica derivada do SRD.
