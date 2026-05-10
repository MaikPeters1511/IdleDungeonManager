export enum HeroClass {
  WARRIOR = 'Warrior',
  MAGE = 'Mage',
  ROGUE = 'Rogue',
  CLERIC = 'Cleric'
}

export interface Resources {
  gold: number;
  gems: number;
  xp: number;
  dungeonKeys: number;
  essence: number;
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
}

export enum UpgradeType {
  HERO_DAMAGE = 'HERO_DAMAGE',
  GOLD_GAIN = 'GOLD_GAIN',
  CRIT_CHANCE = 'CRIT_CHANCE',
  DUNGEON_SPEED = 'DUNGEON_SPEED',
  OFFLINE_EARNINGS = 'OFFLINE_EARNINGS'
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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  isUnlocked: boolean;
  reward?: Partial<Resources>;
}

export interface GameState {
  version: string;
  resources: Resources;
  heroes: Hero[];
  dungeons: Dungeon[];
  upgrades: Upgrade[];
  achievements: Achievement[];
  stats: {
    totalGoldEarned: number;
    totalDungeonsCompleted: number;
  };
  lastSaveTime: number;
  startTime: number;
}
