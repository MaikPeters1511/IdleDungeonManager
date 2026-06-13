export enum HeroClass {
  WARRIOR = 'Warrior',
  MAGE = 'Mage',
  ROGUE = 'Rogue',
  CLERIC = 'Cleric',
  PALADIN = 'Paladin',
  ARCHER = 'Archer'
}

export interface Resources {
  gold: number;
  gems: number;
  xp: number;
  dungeonKeys: number;
  essence: number;
  scrapMetal: number;
}

export enum EquipmentRarity {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary'
}

export interface Equipment {
  id: string;
  name: string;
  slot: 'Weapon' | 'Armor' | 'Accessory';
  rarity: EquipmentRarity;
  bonusDamage?: number;
  bonusGold?: number;
  bonusXp?: number;
  bonusHp?: number;
  level?: number; // Upgrade level
}

export interface Hero {
  id: string;
  name: string;
  heroClass: HeroClass;
  level: number;
  xp: number;
  baseDamage: number;
  attackSpeed: number; // Attack per second
  goldBonus: number; // Multiplier
  critChance: number; // 0-1
  upgradeCost: number;
  isUnlocked: boolean;
  currentDungeonId?: string;
  dungeonProgress?: number; // 0 to duration
  lastAttackTime?: number;
  equipment?: {
    weapon?: Equipment;
    armor?: Equipment;
    accessory?: Equipment;
  };
  currentHp?: number;
  maxHp?: number;
  isResting?: boolean;
}

export interface Dungeon {
  id: string;
  name: string;
  requiredPower: number;
  duration: number; // seconds
  goldReward: number;
  xpReward: number;
  dropChance: number; // 0-1
  isUnlocked: boolean;
  difficultyMultiplier: number;
  damagePerSecond: number; // damage dealt to heroes per second
  isRaid?: boolean; // whether it requires keys
  keyCost?: number; // key cost to run (if isRaid is true)
  modifierType?: 'NONE' | 'GOBLIN_SWARM' | 'TOXIC_MIST' | 'TREASURE_GOBLIN' | 'ANCIENT_BLESSING';
  modifierRemainingTime?: number; // duration in seconds
}

export enum UpgradeType {
  HERO_DAMAGE = 'HERO_DAMAGE',
  GOLD_GAIN = 'GOLD_GAIN',
  CRIT_CHANCE = 'CRIT_CHANCE',
  DUNGEON_SPEED = 'DUNGEON_SPEED',
  OFFLINE_EARNINGS = 'OFFLINE_EARNINGS',
  GUILD_REGEN = 'GUILD_REGEN',
  GUILD_XP = 'GUILD_XP',
  GUILD_VAULT = 'GUILD_VAULT'
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  type: UpgradeType;
  level: number;
  cost: number;
  costMultiplier: number;
  bonusPerLevel: number;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  level: number;
  cost: number; // in essence
  bonusPerLevel: number;
  type: 'DAMAGE' | 'GOLD' | 'SPEED' | 'HP' | 'KEY_REGEN';
}

export interface ActivePotion {
  id: string;
  name: string;
  type: 'HASTE' | 'MIDAS' | 'FINDER';
  duration: number; // remaining duration in seconds
  multiplier: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  isUnlocked: boolean;
  reward?: Partial<Resources>;
}

export enum QuestType {
  COLLECT_GOLD = 'COLLECT_GOLD',
  COMPLETE_DUNGEONS = 'COMPLETE_DUNGEONS',
  UPGRADE_HEROES = 'UPGRADE_HEROES',
  CLICK_MANUAL = 'CLICK_MANUAL'
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  targetValue: number;
  currentValue: number;
  reward: Partial<Resources>;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface GameState {
  version: string;
  resources: Resources;
  heroes: Hero[];
  dungeons: Dungeon[];
  upgrades: Upgrade[];
  achievements: Achievement[];
  quests: Quest[];
  inventory: Equipment[];
  relics: Relic[];
  activePotions?: ActivePotion[];
  lastModifierRefreshTime?: number;
  lastKeyRegenTime?: number;
  language?: 'de' | 'en';
  stats: {
    totalGoldEarned: number;
    totalDungeonsCompleted: number;
    totalClicks: number;
    totalHeroLevels: number;
  };
  lastSaveTime: number;
  startTime: number;
}
