import { GameState, HeroClass, UpgradeType } from '../interfaces/game-state.interface';

export const INITIAL_GAME_STATE: GameState = {
  version: '1.0.0',
  resources: {
    gold: 100,
    gems: 0,
    xp: 0,
    dungeonKeys: 5,
    essence: 0
  },
  heroes: [
    {
      id: 'h1',
      name: 'Alaric',
      heroClass: HeroClass.WARRIOR,
      level: 1,
      xp: 0,
      baseDamage: 10,
      attackSpeed: 1,
      goldBonus: 1,
      critChance: 0.05,
      upgradeCost: 50,
      isUnlocked: true
    },
    {
      id: 'h2',
      name: 'Zephyr',
      heroClass: HeroClass.MAGE,
      level: 1,
      xp: 0,
      baseDamage: 15,
      attackSpeed: 0.8,
      goldBonus: 1.1,
      critChance: 0.1,
      upgradeCost: 150,
      isUnlocked: false
    },
    {
      id: 'h3',
      name: 'Shadow',
      heroClass: HeroClass.ROGUE,
      level: 1,
      xp: 0,
      baseDamage: 8,
      attackSpeed: 2,
      goldBonus: 1.2,
      critChance: 0.2,
      upgradeCost: 300,
      isUnlocked: false
    },
    {
      id: 'h4',
      name: 'Elena',
      heroClass: HeroClass.CLERIC,
      level: 1,
      xp: 0,
      baseDamage: 5,
      attackSpeed: 1.2,
      goldBonus: 1.5,
      critChance: 0.05,
      upgradeCost: 500,
      isUnlocked: false
    }
  ],
  dungeons: [
    {
      id: 'd1',
      name: 'Goblin Cave',
      requiredPower: 0,
      duration: 10,
      goldReward: 20,
      xpReward: 10,
      dropChance: 0.1,
      isUnlocked: true,
      difficultyMultiplier: 1
    },
    {
      id: 'd2',
      name: 'Haunted Crypt',
      requiredPower: 50,
      duration: 30,
      goldReward: 100,
      xpReward: 50,
      dropChance: 0.15,
      isUnlocked: false,
      difficultyMultiplier: 1.5
    },
    {
      id: 'd3',
      name: 'Orc Fortress',
      requiredPower: 200,
      duration: 60,
      goldReward: 500,
      xpReward: 250,
      dropChance: 0.2,
      isUnlocked: false,
      difficultyMultiplier: 2.5
    },
    {
      id: 'd4',
      name: 'Dragon Lair',
      requiredPower: 1000,
      duration: 180,
      goldReward: 2500,
      xpReward: 1200,
      dropChance: 0.3,
      isUnlocked: false,
      difficultyMultiplier: 6
    },
    {
      id: 'd5',
      name: 'Abyssal Gate',
      requiredPower: 5000,
      duration: 600,
      goldReward: 15000,
      xpReward: 7500,
      dropChance: 0.5,
      isUnlocked: false,
      difficultyMultiplier: 15
    }
  ],
  upgrades: [
    {
      id: 'u1',
      name: 'Greedy Goblins',
      description: 'Increases gold gain from all sources by 10% per level.',
      type: UpgradeType.GOLD_GAIN,
      level: 0,
      cost: 100,
      costMultiplier: 1.5,
      bonusPerLevel: 0.1
    },
    {
      id: 'u2',
      name: 'Sharp Blades',
      description: 'Increases hero damage by 15% per level.',
      type: UpgradeType.HERO_DAMAGE,
      level: 0,
      cost: 150,
      costMultiplier: 1.6,
      bonusPerLevel: 0.15
    },
    {
      id: 'u3',
      name: 'Swift Boots',
      description: 'Reduces dungeon run duration by 5% per level.',
      type: UpgradeType.DUNGEON_SPEED,
      level: 0,
      cost: 200,
      costMultiplier: 2,
      bonusPerLevel: 0.05
    }
  ],
  achievements: [
    {
      id: 'a1',
      name: 'First Blood',
      description: 'Complete your first dungeon run.',
      condition: 'dungeons_completed >= 1',
      isUnlocked: false,
      reward: { gold: 50 }
    }
  ],
  stats: {
    totalGoldEarned: 100,
    totalDungeonsCompleted: 0
  },
  lastSaveTime: Date.now(),
  startTime: Date.now()
};

export const GAME_CONSTANTS = {
  SAVE_KEY: 'IDLE_DUNGEON_MANAGER_SAVE',
  SAVE_VERSION: '1.0.0',
  TICK_RATE: 100, // ms
  OFFLINE_CAP_HOURS: 8,
  XP_PER_LEVEL_BASE: 100,
  XP_LEVEL_EXPONENT: 1.5
};
