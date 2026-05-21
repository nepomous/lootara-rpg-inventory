import type { ItemCategory, ItemRarity, RPGSystem } from "./rpg";

export type { ItemCategory, ItemRarity } from "./rpg";

export type Item = {
  id: string;
  name: string; // em inglês (padrão RPG)
  category: ItemCategory;
  weight: number; // em libras
  cost: number; // em peças de ouro (GP)
  description: string; // em português
  lore?: string; // flavor text / lore exclusivo — desbloqueável via rewarded ad
  system: RPGSystem[]; // sistemas onde o item aparece
  rarity: ItemRarity;
};

// Todos os itens "generic" aparecem em todos os sistemas.
// IDs seguem o padrão: categoria_nome_snake_case
export const ITEMS: Item[] = [
  // ── ARMAS (weapon) ────────────────────────────────────────────────────────

  {
    id: "weapon_longsword",
    name: "Longsword",
    category: "weapon",
    weight: 3,
    cost: 15,
    description:
      "Espada longa versátil de aço, empunhada com uma ou duas mãos. Dano: 1d8 cortante (1 mão) ou 1d10 (2 mãos).",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "weapon_shortsword",
    name: "Shortsword",
    category: "weapon",
    weight: 2,
    cost: 10,
    description:
      "Espada curta ágil, favorita de ladinos e duelistas. Possui as propriedades Leve e Acuidade. Dano: 1d6 perfurante.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "weapon_dagger",
    name: "Dagger",
    category: "weapon",
    weight: 1,
    cost: 2,
    description:
      "Adaga leve e facilmente ocultável. Pode ser arremessada. Propriedades: Leve, Arremesso, Acuidade. Dano: 1d4 perfurante.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "weapon_handaxe",
    name: "Handaxe",
    category: "weapon",
    weight: 2,
    cost: 5,
    description:
      "Machadinha de cabo curto, eficiente corpo a corpo ou arremessada. Propriedades: Leve, Arremesso. Dano: 1d6 cortante.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "weapon_greataxe",
    name: "Greataxe",
    category: "weapon",
    weight: 7,
    cost: 30,
    description:
      "Grande machado de batalha de duas mãos, destruidor de armaduras. Propriedade: Pesada, Duas Mãos. Dano: 1d12 cortante.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "weapon_greatsword",
    name: "Greatsword",
    category: "weapon",
    weight: 6,
    cost: 50,
    description:
      "Espada longa de duas mãos, símbolo de poder marcial. Propriedades: Pesada, Duas Mãos. Dano: 2d6 cortante.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "weapon_rapier",
    name: "Rapier",
    category: "weapon",
    weight: 2,
    cost: 25,
    description:
      "Florete elegante de lâmina fina, ideal para duelistas e bardos. Propriedade: Acuidade. Dano: 1d8 perfurante.",
    system: ["dnd5e", "pf1", "pf2"],
    rarity: "common",
  },
  {
    id: "weapon_shortbow",
    name: "Shortbow",
    category: "weapon",
    weight: 2,
    cost: 25,
    description:
      "Arco curto de madeira, ágil e fácil de usar a cavalo ou em espaços fechados. Alcance: 24/96 m. Dano: 1d6 perfurante.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "weapon_longbow",
    name: "Longbow",
    category: "weapon",
    weight: 2,
    cost: 50,
    description:
      "Arco longo de alto alcance, preferido de patrulheiros e elfos. Alcance: 45/180 m. Propriedade: Pesada, Duas Mãos. Dano: 1d8 perfurante.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "weapon_quarterstaff",
    name: "Quarterstaff",
    category: "weapon",
    weight: 4,
    cost: 2,
    description:
      "Cajado de madeira resistente, versátil e discreto. Empunhado com uma ou duas mãos. Dano: 1d6 (1 mão) ou 1d8 (2 mãos) contundente.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "weapon_mace",
    name: "Mace",
    category: "weapon",
    weight: 4,
    cost: 5,
    description:
      "Maça de cabeça metálica, eficiente contra armaduras pesadas. Dano: 1d6 contundente.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "weapon_warhammer",
    name: "Warhammer",
    category: "weapon",
    weight: 2,
    cost: 15,
    description:
      "Martelo de guerra versátil, forjado para a batalha. Propriedade: Versátil. Dano: 1d8 (1 mão) ou 1d10 (2 mãos) contundente.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "weapon_spear",
    name: "Spear",
    category: "weapon",
    weight: 3,
    cost: 1,
    description:
      "Lança de haste longa, versátil para ataque corpo a corpo ou arremesso. Alcance: 6/18 m. Dano: 1d6 perfurante.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "weapon_hand_crossbow",
    name: "Hand Crossbow",
    category: "weapon",
    weight: 3,
    cost: 75,
    description:
      "Besta de mão compacta, usada com uma mão. Favorita de ladinos. Alcance: 9/36 m. Dano: 1d6 perfurante.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "weapon_light_crossbow",
    name: "Light Crossbow",
    category: "weapon",
    weight: 5,
    cost: 25,
    description:
      "Besta leve de fácil manuseio, popular entre aventureiros iniciantes. Alcance: 24/96 m. Dano: 1d8 perfurante.",
    system: ["generic"],
    rarity: "common",
  },

  // ── ARMADURAS (armor) ─────────────────────────────────────────────────────

  {
    id: "armor_leather",
    name: "Leather Armor",
    category: "armor",
    weight: 10,
    cost: 10,
    description:
      "Armadura de couro endurecido, leve e silenciosa. CA 11 + mod DES. Armadura Leve.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "armor_studded_leather",
    name: "Studded Leather",
    category: "armor",
    weight: 13,
    cost: 45,
    description:
      "Couro reforçado com rebites metálicos. CA 12 + mod DES. Armadura Leve.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "armor_chain_shirt",
    name: "Chain Shirt",
    category: "armor",
    weight: 20,
    cost: 50,
    description:
      "Camisola de cota de malha que protege o torso sem restringir muito o movimento. CA 13 + mod DES (máx 2). Armadura Média.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "armor_chain_mail",
    name: "Chain Mail",
    category: "armor",
    weight: 55,
    cost: 75,
    description:
      "Armadura completa de anéis metálicos entrelaçados. CA 16. Armadura Pesada. Penalidade de Furtividade.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "armor_plate",
    name: "Plate Armor",
    category: "armor",
    weight: 65,
    cost: 1500,
    description:
      "A melhor armadura convencional disponível. Placas de metal articuladas cobrem todo o corpo. CA 18. Armadura Pesada. Penalidade de Furtividade.",
    system: ["dnd5e", "pf1"],
    rarity: "uncommon",
  },
  {
    id: "armor_shield",
    name: "Shield",
    category: "armor",
    weight: 6,
    cost: 10,
    description:
      "Escudo de madeira com reforço metálico. Empunhado com uma mão, concede +2 à CA.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "armor_hide",
    name: "Hide Armor",
    category: "armor",
    weight: 12,
    cost: 10,
    description:
      "Armadura rústica feita de couros grossos e peles. CA 12 + mod DES (máx 2). Armadura Média.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "armor_half_plate",
    name: "Half Plate",
    category: "armor",
    weight: 40,
    cost: 750,
    description:
      "Placas metálicas cobrindo o torso e ombros, com cota de malha nas demais áreas. CA 15 + mod DES (máx 2). Armadura Média.",
    system: ["dnd5e", "pf1"],
    rarity: "uncommon",
  },

  // ── EQUIPAMENTOS (gear) ───────────────────────────────────────────────────

  {
    id: "gear_rope_hempen",
    name: "Hempen Rope (50 ft)",
    category: "gear",
    weight: 10,
    cost: 1,
    description:
      "Rolo de 15 metros de corda de cânhamo resistente. Aguenta até 400 kg. Essencial para escaladas e armadilhas.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "gear_rope_silk",
    name: "Silk Rope (50 ft)",
    category: "gear",
    weight: 5,
    cost: 10,
    description:
      "Rolo de 15 metros de corda de seda, mais leve e resistente que a de cânhamo. Favorita de ladinos.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "gear_torch",
    name: "Torch",
    category: "gear",
    weight: 1,
    cost: 0.01,
    description:
      "Tocha que ilumina um raio de 6 metros por 1 hora. Pode ser usada como arma improvisada (1d4 fogo).",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "gear_lantern_hooded",
    name: "Hooded Lantern",
    category: "gear",
    weight: 2,
    cost: 5,
    description:
      "Lanterna com capuz ajustável que pode ser fechado para bloquear a luz. Ilumina 9 m brilhante + 9 m tênue por 6 horas (1 frasco de óleo).",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "gear_oil_flask",
    name: "Oil Flask",
    category: "gear",
    weight: 1,
    cost: 0.1,
    description:
      "Frasco de óleo que alimenta lanternas por 6 horas. Pode ser jogado como projétil incendiário (dano de fogo na área).",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "gear_healers_kit",
    name: "Healer's Kit",
    category: "gear",
    weight: 3,
    cost: 5,
    description:
      "Kit com bandagens, unguentos e talas. Contém 10 usos. Estabiliza um personagem com 0 PV sem teste de Medicina.",
    system: ["dnd5e"],
    rarity: "common",
  },
  {
    id: "gear_tinderbox",
    name: "Tinderbox",
    category: "gear",
    weight: 1,
    cost: 0.5,
    description:
      "Caixa com pederneira, isca e pavio para acender fogo em 1 ação (ou 1 minuto em condições adversas).",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "gear_rations",
    name: "Rations (1 day)",
    category: "gear",
    weight: 2,
    cost: 0.5,
    description:
      "Provisões para um dia: carne seca, biscoitos duros, queijo e frutas secas. Suficiente para manter um aventureiro em campo.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "gear_waterskin",
    name: "Waterskin",
    category: "gear",
    weight: 5,
    cost: 0.2,
    description:
      "Odre de couro com capacidade para 4 litros de líquido. Pesado quando cheio, leve quando vazio (0,5 lb).",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "gear_grappling_hook",
    name: "Grappling Hook",
    category: "gear",
    weight: 4,
    cost: 2,
    description:
      "Gancho de ferro com 4 pontas para prender em beiradas e superfícies. Usado com corda para escalada.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "gear_crowbar",
    name: "Crowbar",
    category: "gear",
    weight: 5,
    cost: 2,
    description:
      "Pé de cabra de ferro que concede vantagem em testes de Força para abrir portas e caixas trancadas.",
    system: ["dnd5e"],
    rarity: "common",
  },
  {
    id: "gear_bedroll",
    name: "Bedroll",
    category: "gear",
    weight: 7,
    cost: 1,
    description:
      "Colchonete enrolável para descanso em campo. Proporciona descanso longo adequado em ambientes hostis.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "gear_spellbook",
    name: "Spellbook",
    category: "gear",
    weight: 3,
    cost: 50,
    description:
      "Livro de magias encadernado em couro com 100 páginas em branco. Essencial para magos registrarem seus feitiços.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "gear_component_pouch",
    name: "Component Pouch",
    category: "gear",
    weight: 2,
    cost: 25,
    description:
      "Pequena bolsa com compartimentos contendo todos os componentes materiais sem valor para conjuração de magias.",
    system: ["dnd5e"],
    rarity: "common",
  },
  {
    id: "gear_mirror_steel",
    name: "Steel Mirror",
    category: "gear",
    weight: 0.5,
    cost: 5,
    description:
      "Espelho de aço polido. Útil para ver ao redor de cantos, identificar vampiros e sinalizar aliados à distância.",
    system: ["generic"],
    rarity: "common",
  },

  // ── POÇÕES (potion) ───────────────────────────────────────────────────────

  {
    id: "potion_healing",
    name: "Potion of Healing",
    category: "potion",
    weight: 0.5,
    cost: 50,
    description:
      "Líquido vermelho brilhante que recupera 2d4+2 pontos de vida quando bebido como ação bônus.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "potion_greater_healing",
    name: "Potion of Greater Healing",
    category: "potion",
    weight: 0.5,
    cost: 150,
    description:
      "Poção de cura potente que recupera 4d4+4 pontos de vida. Brilha intensamente ao ser agitada.",
    system: ["dnd5e", "pf1"],
    rarity: "uncommon",
  },
  {
    id: "potion_superior_healing",
    name: "Potion of Superior Healing",
    category: "potion",
    weight: 0.5,
    cost: 450,
    description:
      "Elixir de cura superior que recupera 8d4+8 pontos de vida. Reservado para aventureiros experientes.",
    lore: "Diz a lenda que a receita desta poção foi transcrita pelo alquimista Aldric Voss após uma visão divina nas ruínas de Aethermoor. Cada frasco requer o sangue de uma fênix recém-renascida e pétalas de lotus lunar colhidas sob eclipse total. Quem bebe sente, por um breve instante, o toque quente de uma mão invisível afastando a morte.",
    system: ["dnd5e"],
    rarity: "rare",
  },
  {
    id: "potion_antitoxin",
    name: "Antitoxin",
    category: "potion",
    weight: 0,
    cost: 50,
    description:
      "Antídoto que confere vantagem em testes de resistência contra veneno por 1 hora. Não é uma poção mágica.",
    system: ["dnd5e"],
    rarity: "common",
  },
  {
    id: "potion_climbing",
    name: "Potion of Climbing",
    category: "potion",
    weight: 0.5,
    cost: 180,
    description:
      "Ao beber, você ganha velocidade de escalar igual à de caminhada e vantagem em testes de escalada por 1 hora.",
    system: ["dnd5e"],
    rarity: "common",
  },
  {
    id: "potion_fire_breath",
    name: "Potion of Fire Breath",
    category: "potion",
    weight: 0.5,
    cost: 150,
    description:
      "Após beber, você pode usar ação bônus para soprar fogo em cone de 9 m (4d6 fogo, CD 13). Pode ser usado 3 vezes em 1 hora.",
    system: ["dnd5e"],
    rarity: "uncommon",
  },

  // ── FERRAMENTAS (tool) ────────────────────────────────────────────────────

  {
    id: "tool_thieves",
    name: "Thieves' Tools",
    category: "tool",
    weight: 1,
    cost: 25,
    description:
      "Estojo com gazuas, espelhos em miniatura, grampos e pinças. Necessário para arrombar fechaduras e desarmar armadilhas.",
    system: ["dnd5e", "pf1", "pf2"],
    rarity: "common",
  },
  {
    id: "tool_herbalism_kit",
    name: "Herbalism Kit",
    category: "tool",
    weight: 3,
    cost: 5,
    description:
      "Kit com bolsas, tesouras, almofariz e ervas medicinais. Permite criar antídotos e poções de cura não mágicas.",
    system: ["dnd5e"],
    rarity: "common",
  },
  {
    id: "tool_alchemist_supplies",
    name: "Alchemist's Supplies",
    category: "tool",
    weight: 8,
    cost: 50,
    description:
      "Equipamentos de alquimia: dois frascos de vidro, um bico de Bunsen, um par de pinças e reagentes variados.",
    system: ["dnd5e", "pf2"],
    rarity: "common",
  },
  {
    id: "tool_cartographer",
    name: "Cartographer's Tools",
    category: "tool",
    weight: 6,
    cost: 15,
    description:
      "Instrumentos de cartografia: pergaminhos, compassos, réguas e tinta especial para criar e interpretar mapas.",
    system: ["dnd5e"],
    rarity: "common",
  },
  {
    id: "tool_disguise_kit",
    name: "Disguise Kit",
    category: "tool",
    weight: 3,
    cost: 25,
    description:
      "Kit de disfarce com cosméticos, cabelos postiços, roupas adicionais e acessórios para mudar sua aparência.",
    system: ["dnd5e"],
    rarity: "common",
  },
  {
    id: "tool_poisoner_kit",
    name: "Poisoner's Kit",
    category: "tool",
    weight: 2,
    cost: 50,
    description:
      "Estojo para preparação e aplicação de venenos: frascos, seringas, luvas e reagentes básicos.",
    system: ["dnd5e", "pf2"],
    rarity: "uncommon",
  },
  {
    id: "tool_lute",
    name: "Lute",
    category: "tool",
    weight: 2,
    cost: 35,
    description:
      "Instrumento de cordas de caixa abaulada. Instrumento bardo clássico. Permite usar proficiência com instrumentos de cordas.",
    system: ["dnd5e"],
    rarity: "common",
  },

  // ── ITENS MÁGICOS (magic) ─────────────────────────────────────────────────

  {
    id: "magic_bag_of_holding",
    name: "Bag of Holding",
    category: "magic",
    weight: 15,
    cost: 4000,
    description:
      "Bolsa mágica de interior extradimensional: carrega até 500 lb / 64 pés³, sem importar o peso externo. Abre em espaço dobrado causa explosão.",
    system: ["dnd5e", "pf1"],
    rarity: "uncommon",
  },
  {
    id: "magic_cloak_protection",
    name: "Cloak of Protection",
    category: "magic",
    weight: 1,
    cost: 3500,
    description:
      "Capa encantada que concede +1 à CA e a todos os testes de resistência enquanto vestida. Requer sintonia.",
    system: ["dnd5e"],
    rarity: "uncommon",
  },
  {
    id: "magic_ring_protection",
    name: "Ring of Protection",
    category: "magic",
    weight: 0,
    cost: 3500,
    description:
      "Anel mágico que concede +1 à CA e a todos os testes de resistência. Requer sintonia.",
    lore: 'Forjado pelo anão Torvin Ashmantle nas profundezas de Kharak Dûm, este anel foi presenteado à rainha Seraphel como dote de aliança entre dois reinos em guerra. Ao longo de três gerações, sobreviveu a batalhas, trairções e um incêndio que reduziu o palácio a cinzas. A inscrição interna, desgastada pelo tempo, lê: "Que o escudo da montanha permaneça sobre ti."',
    system: ["dnd5e", "pf1"],
    rarity: "rare",
  },
  {
    id: "magic_boots_elvenkind",
    name: "Boots of Elvenkind",
    category: "magic",
    weight: 1,
    cost: 2500,
    description:
      "Botas élficas encantadas que silenciam seus passos. Vantagem em testes de Furtividade relacionados a movimento. Não requer sintonia.",
    system: ["dnd5e", "pf1"],
    rarity: "uncommon",
  },
  {
    id: "magic_amulet_health",
    name: "Amulet of Health",
    category: "magic",
    weight: 0,
    cost: 8000,
    description:
      "Amuleto que eleva sua Constituição para 19. Sem efeito se sua Constituição já for 19 ou maior. Requer sintonia.",
    lore: "Criado pelos sacerdotes do Templo da Chama Perpétua em homenagem ao guerreiro Daenos, o Imortal, que segundo os escritos sagrados sobreviveu a dezessete lanças durante a Batalha do Passo Vermelho. A pedra central pulsa com um calor suave, como um segundo coração. Dizem que quem o usa por mais de um ano passa a sonhar com batalhas que nunca travou — memórias do próprio Daenos gravadas na gema.",
    system: ["dnd5e"],
    rarity: "rare",
  },
  {
    id: "magic_+1_longsword",
    name: "+1 Longsword",
    category: "magic",
    weight: 3,
    cost: 1000,
    description:
      "Espada longa encantada com +1 em testes de ataque e rolagens de dano. A lâmina brilha levemente no escuro.",
    system: ["dnd5e", "pf1"],
    rarity: "uncommon",
  },
  {
    id: "magic_wand_magic_missiles",
    name: "Wand of Magic Missiles",
    category: "magic",
    weight: 1,
    cost: 6000,
    description:
      "Varinha com 7 cargas. Gasta 1–3 cargas para lançar Mísseis Mágicos nos níveis correspondentes. Recupera 1d6+1 cargas ao amanhecer.",
    system: ["dnd5e"],
    rarity: "uncommon",
  },
  {
    id: "magic_sending_stones",
    name: "Sending Stones",
    category: "magic",
    weight: 0,
    cost: 5000,
    description:
      "Par de pedras polidas encantadas. Uma vez por dia, o portador pode transmitir uma mensagem de 25 palavras ao portador da pedra par.",
    system: ["dnd5e"],
    rarity: "uncommon",
  },

  // ── MUNIÇÃO (ammunition) ──────────────────────────────────────────────────

  {
    id: "ammo_arrows_20",
    name: "Arrows (20)",
    category: "ammunition",
    weight: 1,
    cost: 1,
    description:
      "Aljava com 20 flechas de madeira e penas. Compatível com arcos curtos e longos. Se o ataque falha, a flecha se perde em 50% dos casos.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "ammo_bolts_20",
    name: "Crossbow Bolts (20)",
    category: "ammunition",
    weight: 1.5,
    cost: 1,
    description:
      "Estojo com 20 virotes de besta. Compatível com bestas leves e de mão. Mais pesados que flechas, mais penetrantes.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "ammo_sling_bullets_20",
    name: "Sling Bullets (20)",
    category: "ammunition",
    weight: 1.5,
    cost: 0.04,
    description:
      "Vinte esferas de chumbo para funda. Baratas e abundantes, mas requerem uma funda para uso. Dano: 1d4 contundente.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "ammo_silvered_arrows_5",
    name: "Silvered Arrows (5)",
    category: "ammunition",
    weight: 0.25,
    cost: 25,
    description:
      "5 flechas de ponta prateada. Superam resistência e imunidade a dano não-mágico de mortos-vivos e licantropos.",
    system: ["dnd5e", "pf1"],
    rarity: "uncommon",
  },

  // ── RECIPIENTES (container) ───────────────────────────────────────────────

  {
    id: "container_backpack",
    name: "Backpack",
    category: "container",
    weight: 5,
    cost: 2,
    description:
      "Mochila de couro resistente com capacidade para 30 lb (1 pé³ de volume). Item básico de qualquer aventureiro.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "container_chest",
    name: "Chest",
    category: "container",
    weight: 25,
    cost: 5,
    description:
      "Baú de madeira reforçado com metal, com capacidade para 300 lb (12 pés³). Pode ser trancado com cadeado.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "container_pouch",
    name: "Pouch",
    category: "container",
    weight: 1,
    cost: 0.5,
    description:
      "Bolsa de couro pequena para carregar moedas ou componentes de magia. Capacidade: 6 lb / 1/5 pé³.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "container_quiver",
    name: "Quiver",
    category: "container",
    weight: 1,
    cost: 1,
    description:
      "Aljava de couro que comporta até 20 flechas ou virotes. Permite saque rápido de munição em combate.",
    system: ["generic"],
    rarity: "common",
  },
  {
    id: "container_scroll_case",
    name: "Scroll Case",
    category: "container",
    weight: 1,
    cost: 1,
    description:
      "Estojo cilíndrico de couro ou osso para armazenar e proteger até 10 pergaminhos de dano e umidade.",
    system: ["dnd5e", "pf1"],
    rarity: "common",
  },
  {
    id: "container_saddlebags",
    name: "Saddlebags",
    category: "container",
    weight: 8,
    cost: 4,
    description:
      "Par de alforjes para montaria, com capacidade total de 60 lb. Fixados nos flancos do animal.",
    system: ["generic"],
    rarity: "common",
  },
];

// Helper: filtrar itens por categoria
export function getItemsByCategory(category: ItemCategory): Item[] {
  return ITEMS.filter((item) => item.category === category);
}

// Helper: filtrar itens por sistema (inclui itens genéricos)
export function getItemsBySystem(
  system: Exclude<RPGSystem, "generic">,
): Item[] {
  return ITEMS.filter(
    (item) => item.system.includes(system) || item.system.includes("generic"),
  );
}

// Helper: buscar item por ID
export function getItemById(id: string): Item | undefined {
  return ITEMS.find((item) => item.id === id);
}
