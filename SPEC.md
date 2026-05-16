# SPEC.md — Lootara - RPG Inventory (Sacola de RPG)

## Visão Geral

**Lootara - RPG Inventory** é um aplicativo mobile utilitário para jogadores de RPG de mesa (Pathfinder 1e/2e, D&D 5e e sistemas compatíveis). O app permite criar personagens e gerenciar o inventário de cada um com base em uma biblioteca curada de itens clássicos de RPG.

O foco é ser simples, rápido, bonito e funcionar 100% offline — como uma sacola mágica que o jogador carrega no bolso.

> **Decisão de arquitetura:** Não há backend no MVP. Todos os dados vivem no dispositivo via SQLite local (Drizzle ORM). Backend e sync em nuvem são candidatos à Fase 2, apenas se validados por demanda real dos usuários.

---

## Público-Alvo

- Jogadores de RPG de mesa (casual a hardcore)
- Sistemas suportados: D&D 5e, Pathfinder 1e e 2e (extensível a outros)
- Plataforma: Android (MVP), iOS (fase 2)

---

## Arquitetura

### Estrutura do Projeto

```
rpg-bag/
├── app/                      # Expo Router (file-based routing)
│   ├── (tabs)/
│   │   ├── index.tsx         # Lista de personagens (Home)
│   │   ├── library.tsx       # Biblioteca de itens
│   │   └── settings.tsx      # Configurações, compra, doação
│   ├── character/
│   │   ├── [id].tsx          # Detalhes do personagem + sacola
│   │   └── new.tsx           # Criar personagem
│   └── _layout.tsx
├── components/               # Componentes reutilizáveis
├── db/                       # SQLite + Drizzle ORM
│   ├── schema.ts             # Definição das tabelas (= tipos TypeScript)
│   ├── migrations/           # Migrations geradas pelo Drizzle Kit
│   └── index.ts              # Instância do banco + helpers de query
├── hooks/                    # Custom hooks (useCharacters, useBag, etc.)
├── store/                    # Zustand (estado global: premium, preferences)
├── constants/
│   ├── items.ts              # Biblioteca de ~200 itens (JSON estático)
│   ├── theme.ts              # Cores, fontes, espaçamentos
│   └── rpg.ts                # Enums: sistemas, classes, raças, categorias
├── utils/                    # Funções puras (cálculo de peso, formatação)
└── assets/
```

### Stack

| Camada            | Tecnologia                       | Motivo                          |
| ----------------- | -------------------------------- | ------------------------------- |
| Framework         | Expo SDK (latest) + React Native | Entrega rápida, OTA updates     |
| Navegação         | Expo Router                      | File-based, zero config         |
| Banco local       | expo-sqlite + **Drizzle ORM**    | Tipado, leve, sem servidor      |
| Estado global     | Zustand                          | Simples, sem boilerplate        |
| Estado assíncrono | TanStack React Query             | Cache e revalidação local       |
| Estilização       | NativeWind (Tailwind RN)         | Produtividade, tema consistente |
| Forms             | React Hook Form + Zod            | Validação tipada                |
| Monetização       | RevenueCat + AdMob               | 100% client-side, sem backend   |
| Secure storage    | Expo SecureStore                 | Status de premium persistido    |

### Por que Drizzle ORM + JSON estático?

- Drizzle é totalmente tipado — o schema **é** o tipo TypeScript, sem geração de código extra
- Funciona nativamente com `expo-sqlite` sem overhead
- Migrations geradas automaticamente pelo Drizzle Kit
- A biblioteca de itens é **JSON estático** em `constants/items.ts` — não muda entre sessões, não precisa de tabela, carrega instantaneamente

---

## Funcionalidades

### MVP (v1.0)

#### Personagens

- [ ] Criar personagem (nome, classe, raça, nível, sistema de RPG)
- [ ] Editar personagem
- [ ] Excluir personagem (com confirmação)
- [ ] Listar personagens com avatar/ícone de classe
- [ ] Buscar personagem por nome

#### Sacola (Inventário)

- [ ] Cada personagem tem uma sacola de itens
- [ ] Adicionar item à sacola (da biblioteca ou personalizado)
- [ ] Definir quantidade de cada item
- [ ] Marcar item como: equipado / na mochila / guardado
- [ ] Remover item da sacola
- [ ] Ver peso total carregado vs. capacidade (baseado em STR, opcional)
- [ ] Notas por item na sacola

#### Biblioteca de Itens (estática)

- [ ] Catálogo com ~200 itens comuns de RPG:
  - Armas (espada longa, adaga, arco curto, cajado, etc.)
  - Armaduras (couro, cota de malha, placas, escudo, etc.)
  - Adventuring Gear (corda, tocha, lanterna, kit de cura, etc.)
  - Poções (cura leve, média, grave; antídoto, etc.)
  - Ferramentas (thieves' tools, kit de alquimia, instrumentos)
  - Itens mágicos comuns
  - Munição (flechas, virotes, esferas de funda)
  - Recipientes (mochila, bolsa, baú, estojo de pergaminhos)
- [ ] Busca e filtro por categoria e sistema
- [ ] Detalhes do item (peso, custo em PO, descrição em português)

#### Backup & Restore

- [ ] Exportar todos os dados como arquivo JSON (compartilhar via SO)
- [ ] Importar arquivo JSON para restaurar dados
- [ ] Aviso claro ao usuário: dados ficam só no aparelho

#### Monetização

- [ ] **Ads** — banner na tela de listagem de personagens (não intrusivo)
- [ ] **One-time purchase** — remove todos os anúncios permanentemente
- [ ] **Doação** — botão "Buy me a coffee" nas configurações (deep link Ko-fi/BMC)

### Fase 2 (v1.x — só se validado por demanda)

- [ ] Sync opcional com Supabase (conta de usuário, backup automático)
- [ ] Compartilhar sacola entre jogadores (QR Code ou link)
- [ ] Suporte completo a moedas (PC, PP, PE, PO, PL) com conversão
- [ ] Encumbrance automático por sistema (D&D 5e STR×15, PF2 Bulk)
- [ ] Foto de personagem (câmera/galeria)
- [ ] Modo DM — múltiplos personagens de NPC

### Fase 3 (v2.0)

- [ ] Character sheet básico integrado
- [ ] Import de compendiums externos (Archives of Nethys, D&D Beyond)
- [ ] Widgets Android
- [ ] Versão iOS

---

## Modelos de Dados

### Tabelas SQLite — Drizzle Schema (`db/schema.ts`)

#### `characters`

```ts
{
  id:          text (UUID, PK)
  name:        text NOT NULL
  class:       text NOT NULL
  race:        text NOT NULL
  level:       integer NOT NULL  // 1–20
  system:      text NOT NULL     // 'dnd5e' | 'pf1' | 'pf2' | 'other'
  avatarEmoji: text              // fallback visual, ex: '⚔️'
  createdAt:   integer           // unix timestamp
  updatedAt:   integer
}
```

#### `bag_items`

```ts
{
  id:          text (UUID, PK)
  characterId: text NOT NULL  → characters.id (cascade delete)
  itemId:      text           // id do item estático; null se custom
  customName:  text           // nome livre se item personalizado
  quantity:    integer NOT NULL  // mínimo 1
  location:    text NOT NULL     // 'equipped' | 'backpack' | 'stored'
  notes:       text
  createdAt:   integer
  updatedAt:   integer
}
```

### Biblioteca de Itens — JSON estático (`constants/items.ts`)

```ts
type Item = {
  id: string;
  name: string; // em inglês (padrão RPG)
  category: ItemCategory;
  weight: number; // em libras
  cost: number; // em peças de ouro
  description: string; // em português
  system: RPGSystem[]; // ex: ['dnd5e', 'pf1', 'pf2']
  rarity: "common" | "uncommon" | "rare" | "very_rare" | "legendary";
};

type ItemCategory =
  | "weapon"
  | "armor"
  | "gear"
  | "potion"
  | "tool"
  | "magic"
  | "ammunition"
  | "container";

type RPGSystem = "dnd5e" | "pf1" | "pf2" | "generic";
```

---

## Monetização — Detalhe Técnico

| Feature           | Implementação                                     |
| ----------------- | ------------------------------------------------- |
| Ads               | Google AdMob via `react-native-google-mobile-ads` |
| One-time purchase | RevenueCat SDK + Google Play Billing              |
| Doação            | `Linking.openURL()` para Ko-fi ou BMC             |

- Status de premium verificado via `RevenueCat.getCustomerInfo()` no app load
- Resultado cacheado em `SecureStore` (chave `premium_status`) para acesso offline imediato
- Se `isPremium === true`, o componente `<AdBanner />` simplesmente não renderiza
- RevenueCat funciona 100% client-side — sem backend próprio necessário

---

## Contexto de RPG

### D&D 5e

- Encumbrance: STR × 15 lbs = capacidade de carga
- Moedas: CP, SP, EP, GP, PP (10CP = 1SP, 5SP = 1EP, 2EP = 1GP, 10GP = 1PP)

### Pathfinder 1e

- Encumbrance: mesmo sistema do D&D 3.5 (por STR, tabela de light/medium/heavy)

### Pathfinder 2e

- Sistema de **Bulk**: itens têm valor L (leve), 1, 2...
- Limite: STR modifier + 5 Bulk; 10 itens L = 1 Bulk
- No MVP: usar libras como unidade universal com nota de conversão para Bulk

### Biblioteca — Itens Mínimos por Categoria

| Categoria        | Exemplos                                                               | Mínimo |
| ---------------- | ---------------------------------------------------------------------- | ------ |
| Weapons          | Longsword, Dagger, Shortbow, Quarterstaff, Handaxe, Rapier, Greataxe   | 20     |
| Armor            | Leather, Studded Leather, Chain Mail, Half Plate, Full Plate, Shields  | 10     |
| Adventuring Gear | Rope, Torch, Lantern, Rations, Bedroll, Tinderbox, Piton, Mirror       | 30     |
| Potions          | Healing (minor/mod/major), Antitoxin, Invisibility, Speed, Fire Breath | 15     |
| Tools            | Thieves' Tools, Healer's Kit, Alchemist's Supplies, Disguise Kit       | 15     |
| Magic Items      | Ring of Protection, Cloak of Elvenkind, Bag of Holding, +1 Weapon      | 20     |
| Ammunition       | Arrows ×20, Bolts ×20, Sling Bullets ×20, Blowgun Needles ×50          | 5      |
| Containers       | Backpack, Belt Pouch, Chest, Sack, Scroll Case, Quiver                 | 8      |

**Total mínimo: ~123 itens. Meta para v1.0: 200+.**

---

## Design & UX

- **Tema padrão:** Dark — atmosfera de dungeon (fundo escuro, dourado, vermelho carmesim)
- **Fontes:** Cinzel (display/títulos) + Nunito (corpo/labels)
- **Animações:** `react-native-reanimated` para transições e feedback de toque
- **Acessibilidade:** suporte a fontes grandes do sistema, contraste mínimo WCAG AA

---

## Qualidade

- TypeScript strict em todos os arquivos — sem `any` implícito
- ESLint + Prettier configurados na raiz
- Jest para utils puras e hooks críticos
- Maestro para smoke tests E2E nas telas principais

---

## Roadmap de Release

| Versão | Foco                                           | Prazo estimado |
| ------ | ---------------------------------------------- | -------------- |
| v0.1   | Setup Expo + Drizzle + tema + CRUD personagens | Semana 1–2     |
| v0.2   | Sacola + biblioteca de itens estática          | Semana 3–4     |
| v0.3   | Ads + one-time purchase + doação               | Semana 5       |
| v0.4   | Export/import JSON (backup local)              | Semana 6       |
| v1.0   | Polish, testes, publicação Play Store          | Semana 7–8     |
| v1.5   | Sync Supabase (somente se validado)            | Mês 3+         |
