# CLAUDE.md — Lootara - RPG Inventory

> Guia de contexto para o agente Claude (via GitHub Copilot / VS Code) trabalhar neste projeto.
> Leia este arquivo e o `SPEC.md` **antes** de qualquer ação.

---

## O Projeto

**Lootara - RPG Inventory** é um app mobile offline-first para jogadores de RPG gerenciarem personagens e inventário. É um projeto Expo simples — **sem backend, sem monorepo**. Todos os dados vivem no dispositivo via SQLite (Drizzle ORM). A biblioteca de itens é um arquivo JSON estático.

---

## Stack & Versões

| Camada            | Tecnologia                              |
| ----------------- | --------------------------------------- |
| Framework         | Expo SDK (latest stable) + React Native |
| Navegação         | Expo Router (file-based)                |
| Banco local       | `expo-sqlite` + Drizzle ORM             |
| Estado global     | Zustand                                 |
| Estado assíncrono | TanStack React Query                    |
| Estilização       | NativeWind (Tailwind para React Native) |
| Forms             | React Hook Form + Zod                   |
| Monetização       | RevenueCat + Google AdMob               |
| Secure storage    | Expo SecureStore                        |
| Animações         | react-native-reanimated                 |

---

## Estrutura de Pastas

```
rpg-bag/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx         # Home — lista de personagens
│   │   ├── library.tsx       # Biblioteca de itens
│   │   └── settings.tsx      # Configurações, compra, doação
│   ├── character/
│   │   ├── [id].tsx          # Sacola do personagem
│   │   └── new.tsx           # Criar personagem
│   └── _layout.tsx
├── components/
│   ├── CharacterCard.tsx
│   ├── ItemRow.tsx
│   ├── CategoryChip.tsx
│   ├── AdBanner.tsx          # Só renderiza se !isPremium
│   └── ...
├── db/
│   ├── schema.ts             # Drizzle schema (= tipos TypeScript)
│   ├── index.ts              # Instância do banco + funções de query
│   └── migrations/           # Gerado pelo Drizzle Kit
├── hooks/
│   ├── useCharacters.ts
│   ├── useBag.ts
│   ├── useLibrary.ts         # Filtra/busca no JSON estático
│   └── usePremium.ts         # RevenueCat + SecureStore
├── store/
│   └── premiumStore.ts       # Zustand: isPremium, setIsPremium
├── constants/
│   ├── items.ts              # ~200 itens de RPG (JSON estático)
│   ├── theme.ts              # Cores, fontes, espaçamentos
│   └── rpg.ts                # Enums: RPGSystem, ItemCategory, classes, raças
└── utils/
    ├── weight.ts             # Cálculo de peso total e capacidade
    └── backup.ts             # Export/import JSON
```

---

## Convenções de Código

### Geral

- **TypeScript strict** — sem `any` implícito em nenhum arquivo.
- Nomes de variáveis, funções, tipos e arquivos em **inglês**.
- Strings de UI visíveis ao usuário em **português** (app é BR-first).
- Comentários de negócio em português; comentários técnicos em inglês.

### Componentes

- Funcionais com hooks. Zero class components.
- Arquivos: `PascalCase.tsx`
- Máximo **200 linhas** por componente — quebre em sub-componentes se necessário.
- Estilização via **NativeWind** (classes Tailwind). Use `StyleSheet.create` apenas para animações com `reanimated`.
- Nunca faça acesso ao banco diretamente dentro de um componente — use hooks.

### Hooks

- Prefixo `use`: `useCharacters.ts`, `useBag.ts`, `usePremium.ts`
- Lógica de banco fica **somente** em `db/index.ts` e consumida por hooks.
- Dados assíncronos via React Query: `useQuery` para leitura, `useMutation` para escrita.

### Banco de Dados (Drizzle + expo-sqlite)

- Schema em `db/schema.ts` — este arquivo é a fonte de verdade dos tipos.
- Nunca escreva SQL raw — use a query builder do Drizzle.
- Migrations geradas com `npx drizzle-kit generate` e aplicadas no app load.
- Cascade delete: deletar personagem remove todos os seus `bag_items`.

### Biblioteca de Itens

- É um **array TypeScript** em `constants/items.ts` — não uma tabela do banco.
- Nunca modifique itens da biblioteca em runtime — é somente leitura.
- O hook `useLibrary` filtra/busca no array em memória (rápido o suficiente para ~200 itens).
- Itens personalizados criados pelo usuário ficam em `bag_items` com `itemId = null` e `customName` preenchido.

### Estado Global (Zustand)

- Apenas estado verdadeiramente global: `isPremium`, preferências de UI.
- Dados de domínio (personagens, itens da sacola) ficam no banco e são expostos via React Query.

---

## Regras de Negócio

### Personagem

- Nível: 1 a 20 (validar no form com Zod).
- Sistema: `'dnd5e' | 'pf1' | 'pf2' | 'other'` — afeta filtros de itens da biblioteca.
- Um personagem deletado remove **todos** seus `bag_items` (cascade no schema Drizzle).

### Sacola (Bag)

- Cada personagem tem exatamente uma sacola (não é uma entidade separada, é o conjunto de `bag_items` com aquele `characterId`).
- `location`: `'equipped'` (no corpo), `'backpack'` (mochila), `'stored'` (guardado/baú).
- Peso carregado = soma de `weight × quantity` dos itens com `location !== 'stored'`.
- Peso do item vem do JSON estático via `itemId`; itens custom têm `weight = 0` por padrão (usuário pode informar nas notas).

### Monetização

- O app **não tem login próprio**. A recuperação de compra é feita via **"Restaurar compras"** (`Purchases.restorePurchases()`), atrelada à conta da App Store / Google Play do usuário — esse é o mecanismo que substitui o login.
- O botão **"Restaurar compras"** é obrigatório na tela de configurações (Apple Guideline 3.1.1 — compra não-consumível de remoção de anúncios).
- O estado premium é **reativo** via `Purchases.addCustomerInfoUpdateListener` (fonte de verdade durante a sessão). O valor no `SecureStore` é apenas um **cache inicial provisório** no boot para evitar flash de anúncio; `SecureStore` vazio = não-premium provisório, nunca definitivo.
- `usePremium()` lê do Zustand store (inicializado com o valor do `SecureStore` no boot).
- Componente `<AdBanner />`: se `isPremium`, retorna `null` — sem lógica adicional.
- **Doação**: renderizada **somente no Android** (`Platform.OS === 'android'`). No iOS o link externo de doação não é exibido porque a permissão de link externo da Apple vale apenas na storefront dos EUA; em build global, exibir link externo de doação no iOS viola a Guideline 3.1.1. Se no futuro quiser doação no iOS, usar IAP consumível via RevenueCat.

### Backup & Restore

- Export: serializa `characters` + `bag_items` em JSON e chama `Share.share()` do React Native.
- Import: lê um arquivo JSON, valida com Zod, faz upsert no banco.
- Aviso ao usuário: dados ficam só no dispositivo — exportar regularmente.

---

## O que o Agente NÃO deve fazer

- ❌ Não criar backend, API, servidor ou qualquer serviço externo — o app é totalmente local.
- ❌ Não usar `expo-sqlite` diretamente com SQL raw — use sempre o Drizzle ORM.
- ❌ Não criar tabela para a biblioteca de itens — ela é JSON estático em `constants/items.ts`.
- ❌ Não usar React Context para estado de domínio — use Zustand para global, React Query para dados do banco.
- ❌ Não usar `StyleSheet.create` para layout geral — use NativeWind.
- ❌ Não commitar chaves de API — use `app.config.ts` com `process.env` e `.env` no gitignore.
- ❌ Não criar componentes acima de 200 linhas.
- ❌ Não omitir partes do código com `// ...` — sempre mostrar o arquivo completo.
- ❌ **Não editar um componente sem confirmar antes que ele é importado** em alguma tela ou outro componente. Use `grep -r "NomeDoComponente" app/ components/` antes de qualquer modificação.
- ❌ **Não criar um novo componente/arquivo sem verificar se já existe um que serve ao mesmo propósito.** Pesquise por nome, funcionalidade e contexto antes de criar.
- ❌ **Não assumir que um arquivo em `components/` está em uso** só porque existe no disco. Dead code é possível e comum em projetos evolutivos.

---

## Checklist pré-implementação de UI (obrigatório)

**Toda implementação** que envolva telas, formulários ou navegação deve seguir estes passos **antes** de tocar em qualquer arquivo:

1. **Rastrear o fluxo de navegação real** do entry point até o componente:
   - Identifique o gatilho (FAB, botão, link, `router.push`).
   - Siga o caminho: `app/(tabs)/index.tsx` → `router.push("/rota")` → arquivo de tela real.
   - Confirme qual arquivo de tela é **realmente aberto** antes de editar qualquer coisa.

2. **Verificar uso real do componente** antes de modificá-lo:

   ```bash
   grep -r "NomeDoComponente" app/ components/ hooks/
   ```

   Se retornar **zero resultados fora do próprio arquivo**, o componente é dead code — não edite, considere deletar.

3. **Confirmar que o arquivo alvo é o correto** — não o mais parecido pelo nome.

> **Exemplo do erro que esta regra previne:** O agente atualizou `AddCharacterSheet.tsx` (bottom sheet nunca usado) em vez de `app/character/new.tsx` (tela real aberta pelo FAB via `router.push("/character/new")`). Resultado: código duplicado, feature não funcionou.

---

## Validação de Traduções (obrigatório)

**Toda implementação** que adicione ou altere texto visível ao usuário **deve atualizar os 5 arquivos de tradução**:

```
locales/pt-BR/translation.json   ← referência de AUTORIA das chaves (dev)
locales/en/translation.json      ← fallback universal para locales não suportados
locales/es/translation.json
locales/fr/translation.json
locales/de/translation.json
```

### Regras

- Nunca usar string literal em componentes — sempre usar `t("chave.subchave")`.
- Ao criar uma nova chave, adicioná-la nos **5 arquivos** na mesma operação.
- `pt-BR` é a fonte de verdade para **nomenclatura** das chaves (convenção de autoria do dev). O idioma do usuário BR continua sendo pt-BR.
- `en` é o **fallback universal em runtime**: qualquer locale de dispositivo fora de [pt-BR, en, es, fr, de] cai em inglês. `en/translation.json` deve estar **sempre 100% completo** — chave ausente em `en` causa `undefined` silencioso para a maioria dos usuários globais.
- Traduções devem ser naturais no idioma alvo — não usar Google Translate literal.
- Chaves ausentes em qualquer idioma causam `undefined` silencioso na UI — tratar como bug.- **Nomes de itens da biblioteca** ficam em `items.{id}.name` em todos os 5 locales. Ao adicionar um novo item em `constants/items.ts`, adicionar o `name` nos 5 arquivos e usar `t(\`items.${item.id}.name\`, { defaultValue: item.name })` nos componentes.

### Checklist pré-entrega

Antes de considerar qualquer fix/feature/prompt concluído, verificar:

- [ ] O componente/tela modificado é realmente usado no app? (`grep -r` confirmado)
- [ ] O fluxo de navegação foi rastreado do entry point até o arquivo real?
- [ ] Todos os textos novos têm chave em `pt-BR`?
- [ ] A mesma chave existe nos outros 4 idiomas?
- [ ] Nenhum componente novo usa string literal visível ao usuário?
- [ ] TypeScript check executado (`npx tsc --noEmit`) sem erros?

> **Regra obrigatória:** Ao final de **cada prompt**, executar `npx tsc --noEmit` e corrigir todos os erros antes de considerar a tarefa concluída.

---

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar o app
npx expo start

# Gerar migrations Drizzle após mudar o schema
npx drizzle-kit generate

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Testes
npm test
```

---

## Contexto de RPG para o Agente

Ao gerar itens, descrições e lógica de jogo, seguir estas regras dos sistemas:

**D&D 5e**

- Peso em libras (lbs). Capacidade: STR × 15 lbs.
- Moedas: CP, SP, EP, GP, PP. Preços em GP por padrão.

**Pathfinder 1e**

- Mesmo sistema de peso do D&D 3.5 (tabela light/medium/heavy por STR).

**Pathfinder 2e**

- Sistema Bulk: L (leve), 1, 2... | 10 itens L = 1 Bulk | limite = STR mod + 5.
- No MVP: exibir em libras com nota "≈ X Bulk" calculado.

**Itens genéricos** (tag `'generic'`): aparecem em todos os sistemas.
