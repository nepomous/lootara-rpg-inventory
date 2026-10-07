# POL-BAK — Backup & Restore (projeto)

- **TRIGGER:** A tarefa toca `exportData`, `importData`, `utils/backup.ts`, o card de backup em settings. **Tier T2.**
- **ORIGIN:** legacy "Regras de Negócio > Backup & Restore".

## Regras

### BR-BAK-001 — Export é Pro

- RULE: Exportação (`exportData`) é recurso Pro: usuários grátis veem o card com selo **"Pro"** + cadeado; ao tocar, abre o `ProUpsellSheet` com reason `'backup'`.

### BR-BAK-002 — Import é livre

- RULE: Importação (`importData`) permanece LIVRE para todos.
- REASON: decisão deliberada para não prender os dados do usuário.

### BR-BAK-003 — Export

- RULE: Serializa `characters` + `bag_items` em JSON e chama `Share.share()` do React Native.

### BR-BAK-004 — Import

- RULE: Lê um arquivo JSON, valida com Zod e faz upsert no banco.

### BR-BAK-005 — Aviso

- RULE: Aviso ao usuário de que os dados ficam só no dispositivo — exportar regularmente. O aviso é neutro, não coercitivo.

## VERIFY

1. Grátis: card com selo Pro + cadeado → `ProUpsellSheet` reason `'backup'`. Pro: exporta.
2. Import funciona para grátis e Pro.
3. Validação Zod no import cobre: arquivo malformado, campos ausentes, tipos errados, valores fora de faixa (ex.: nível), enums inválidos (system, location).
4. Arquivo inválido → falha controlada, sem alterar o banco.
5. Semântica do upsert: ids duplicados/colidindo, `bag_items` apontando para personagem inexistente. (novo) Preferir operação atômica (tudo ou nada); registrar a decisão no plano.
6. Export contém `characters` + `bag_items` e nada além.
7. Aviso neutro, via i18n nos 5 locales.
8. Entrada não confiável: SEC-004 / TS-004.

- **OWNER:** Architect planeja (mudança de formato) · Developer · QA (arquivos malformados, base populada) · Reviewer.
