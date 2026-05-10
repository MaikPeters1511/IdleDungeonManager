import { GameState, HeroClass, UpgradeType, QuestType } from '../interfaces/game-state.interface';

export const INITIAL_GAME_STATE: GameState = {
  version: '1.3.0',
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
      upgradeCost: 2500,
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
      upgradeCost: 15000,
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
      upgradeCost: 75000,
      isUnlocked: false
    },
    {
      id: 'h5',
      name: 'Valerius',
      heroClass: HeroClass.PALADIN,
      level: 1,
      xp: 0,
      baseDamage: 25,
      attackSpeed: 0.7,
      goldBonus: 1.0,
      critChance: 0.15,
      upgradeCost: 350000,
      isUnlocked: false
    },
    {
      id: 'h6',
      name: 'Lirael',
      heroClass: HeroClass.ARCHER,
      level: 1,
      xp: 0,
      baseDamage: 12,
      attackSpeed: 1.5,
      goldBonus: 1.3,
      critChance: 0.25,
      upgradeCost: 1250000,
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
      requiredPower: 500,
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
      requiredPower: 2500,
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
      requiredPower: 15000,
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
      requiredPower: 100000,
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
      costMultiplier: 1.8,
      bonusPerLevel: 0.1
    },
    {
      id: 'u2',
      name: 'Sharp Blades',
      description: 'Increases hero damage and dungeon speed by 15% per level.',
      type: UpgradeType.HERO_DAMAGE,
      level: 0,
      cost: 150,
      costMultiplier: 1.9,
      bonusPerLevel: 0.15
    },
    {
      id: 'u3',
      name: 'Swift Boots',
      description: 'Reduces dungeon run duration significantly.',
      type: UpgradeType.DUNGEON_SPEED,
      level: 0,
      cost: 500,
      costMultiplier: 2.8,
      bonusPerLevel: 0.1
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
    },
    {
      id: 'a2',
      name: 'Golden Empire',
      description: 'Earn a total of 1,000,000 gold.',
      condition: 'total_gold >= 1000000',
      isUnlocked: false,
      reward: { gems: 250 }
    },
    {
      id: 'a3',
      name: 'Grand Guild',
      description: 'Reach a combined guild level of 250.',
      condition: 'guild_level >= 250',
      isUnlocked: false,
      reward: { gems: 500 }
    },
    {
      id: 'a4',
      name: 'Master of Heroes',
      description: 'Unlock all 6 heroes.',
      condition: 'all_heroes_unlocked',
      isUnlocked: false,
      reward: { gems: 1000 }
    }
  ],
  quests: [
    {
      id: 'q1',
      title: 'Veteran Recruiter',
      description: 'Upgrade your heroes 50 times.',
      type: QuestType.UPGRADE_HEROES,
      targetValue: 50,
      currentValue: 0,
      reward: { gold: 15000 },
      isCompleted: false,
      isClaimed: false
    }
  ],
  inventory: [],
  stats: {
    totalGoldEarned: 100,
    totalDungeonsCompleted: 0,
    totalClicks: 0,
    totalHeroLevels: 0
  },
  lastSaveTime: Date.now(),
  startTime: Date.now()
};

export const GAME_CONSTANTS = {
  SAVE_KEY: 'IDLE_DUNGEON_MANAGER_SAVE',
  SAVE_VERSION: '1.3.0',
  TICK_RATE: 100, // ms
  OFFLINE_CAP_HOURS: 12,
  XP_PER_LEVEL_BASE: 200,
  XP_LEVEL_EXPONENT: 2.2
};
