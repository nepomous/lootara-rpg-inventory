# Contexto do projeto — Lootara (RPG Inventory)

> Migrado de `_legacy/CLAUDE.legacy.md` (seções: O Projeto, Stack & Versões, Estrutura de Pastas, Convenções, Comandos Úteis) e de `_legacy/AGENTS.legacy.md`.
> O cabeçalho original mandava ler `SPEC.md` antes de qualquer ação; ele permanece como referência de produto (ver AGENTS.md).

## O Projeto

**Lootara - RPG Inventory** é um app mobile offline-first para jogadores de RPG gerenciarem personagens e inventário. É um projeto Expo simples — **sem backend, sem monorepo**. Todos os dados vivem no dispositivo via SQLite (Drizzle ORM). A biblioteca de itens é um arquivo estático.

## Stack & Versões

| Camada            | Tecnologia                              |
| ----------------- | --------------------------------------- |
| Framework         | Expo SDK + React Native                 |
| Navegação         | Expo Router (file-based)                |
| Banco local       | `expo-sqlite` + Drizzle ORM             |
| Estado global     | Zustand                                 |
| Estado assíncrono | TanStack React Query                    |
| Estilização       | NativeWind (Tailwind para React Native) |
| Forms             | React Hook Form + Zod                   |
| Monetização       | RevenueCat + Google AdMob               |
| Secure storage    | Expo SecureStore                        |
| Animações         | react-native-reanimated                 |

## Parameters (lidos pelas regras/policies do sistema global)

| Parâmetro            | Valor                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| sdk_version          | 54 (vem do AGENTS.md legado; o CLAUDE.md legado dizia "latest stable". **CONFIRMAR contra o package.json**) |
| identifiers          | inglês (variáveis, funções, tipos, arquivos)                                                                |
| comments             | de negócio em português; técnicos em inglês                                                                 |
| user_visible_strings | somente via i18n (ver POL-I18N)                                                                             |
| component_max_lines  | 200                                                                                                         |
| styling              | NativeWind; `StyleSheet.create` apenas para animações com Reanimated                                        |
| data_access          | Drizzle (query builder; nunca SQL raw) em `db/index.ts`, consumido por hooks                                |
| async_state          | TanStack React Query (`useQuery` leitura, `useMutation` escrita)                                            |
| global_state         | Zustand (somente `isPremium` e preferências de UI)                                                          |
| forms_validation     | React Hook Form + Zod                                                                                       |
| locales              | `locales/<locale>/translation.json` para `pt-BR`, `en`, `es`, `fr`, `de`                                    |
| reference_locale     | `pt-BR` (autoria/nomenclatura das chaves; idioma do usuário BR)                                             |
| fallback_locale      | `en` (fallback universal em runtime; deve estar sempre 100% completo)                                       |

## Constraints (CORE-009)

- Não criar backend, API, servidor ou qualquer serviço externo — o app é totalmente local.
- Não usar `expo-sqlite` diretamente com SQL raw — sempre Drizzle.
- Não criar tabela para a biblioteca de itens.
- Não usar React Context para estado de domínio.
- Não usar `StyleSheet.create` para layout geral.

## Architecture decisions

- **AD-001** Sem backend; dados 100% locais (SQLite).
- **AD-002** A biblioteca de itens é um **array TypeScript** em `constants/items.ts` (~200 itens) — não uma tabela. Somente leitura em runtime; `useLibrary` filtra/busca em memória. Itens personalizados do usuário ficam em `bag_items` com `itemId = null` e `customName` preenchido.
- **AD-003** Estado global = Zustand (apenas `isPremium` e preferências de UI). Dados de domínio (personagens, itens da sacola) ficam no banco e são expostos via React Query.
- **AD-004** `db/schema.ts` é a fonte de verdade dos tipos. Lógica de banco fica **somente** em `db/index.ts`, consumida por hooks.
- **AD-005** Migrations geradas com `npx drizzle-kit generate` e aplicadas no app load.
- **AD-006** Nomes de itens da biblioteca ficam em `items.{id}.name` nos 5 locales; componentes usam `t(\`items.${item.id}.name\`, { defaultValue: item.name })`. Ao adicionar um item em `constants/items.ts`, adicionar o `name` nos 5 arquivos.
- **AD-007** Prefixo `use` nos hooks (`useCharacters.ts`, `useBag.ts`, `usePremium.ts`).

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
│   ├── legal/
│   │   └── licenses.tsx      # Tela de licenças e atribuições (CC-BY-4.0)
│   └── _layout.tsx
├── components/
│   ├── CharacterCard.tsx
│   ├── ItemRow.tsx
│   ├── CategoryChip.tsx
│   ├── AdBanner.tsx          # Só renderiza se !isPremium
│   ├── ProUpsellSheet.tsx    # Modal de upsell Pro reutilizável (reason: 'character_limit' | 'backup')
│   └── ...
├── db/
│   ├── schema.ts             # Drizzle schema (= tipos TypeScript)
│   ├── index.ts              # Instância do banco + funções de query
│   └── migrations/           # Gerado pelo Drizzle Kit
├── hooks/
│   ├── useCharacters.ts
│   ├── useBag.ts
│   ├── useLibrary.ts         # Filtra/busca no array estático
│   └── usePremium.ts         # RevenueCat + SecureStore
├── store/
│   └── premiumStore.ts       # Zustand: isPremium, setIsPremium
├── constants/
│   ├── items.ts              # ~200 itens de RPG (estático)
│   ├── theme.ts              # Cores, fontes, espaçamentos
│   └── rpg.ts                # Enums: RPGSystem, ItemCategory, classes, raças, FREE_CHARACTER_LIMIT
└── utils/
    ├── weight.ts             # Cálculo de peso total e capacidade
    └── backup.ts             # Export/import JSON
```

## Commands

```bash
npm install                    # instalar dependências
npx expo start                 # rodar o app
npx drizzle-kit generate       # gerar migrations após mudar o schema
npm run lint                   # lint
npx tsc --noEmit               # type check
npm test                       # testes
```

Verificações de segurança: ver POL-SECRETS (`.ai/system/policies/secrets.md`).

## Credential consoles (POL-SECRETS runbook)

Firebase, Google Cloud, RevenueCat, AdMob.
