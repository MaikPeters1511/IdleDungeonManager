import { GameState, HeroClass, UpgradeType, QuestType } from '../interfaces/game-state.interface';

export const INITIAL_GAME_STATE: GameState = {
  version: '1.4.0',
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
      isUnlocked: true,
      currentHp: 200,
      maxHp: 200,
      isResting: false
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
      isUnlocked: false,
      currentHp: 100,
      maxHp: 100,
      isResting: false
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
      isUnlocked: false,
      currentHp: 120,
      maxHp: 120,
      isResting: false
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
      isUnlocked: false,
      currentHp: 110,
      maxHp: 110,
      isResting: false
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
      isUnlocked: false,
      currentHp: 250,
      maxHp: 250,
      isResting: false
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
      isUnlocked: false,
      currentHp: 130,
      maxHp: 130,
      isResting: false
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
      dropChance: 0.15,
      isUnlocked: true,
      difficultyMultiplier: 1,
      damagePerSecond: 2,
      isRaid: false,
      keyCost: 0
    },
    {
      id: 'd2',
      name: 'Haunted Crypt',
      requiredPower: 500,
      duration: 30,
      goldReward: 100,
      xpReward: 50,
      dropChance: 0.25,
      isUnlocked: false,
      difficultyMultiplier: 1.5,
      damagePerSecond: 5,
      isRaid: false,
      keyCost: 0
    },
    {
      id: 'd_raid1',
      name: 'Undead Catacombs (Raid)',
      requiredPower: 1200,
      duration: 60,
      goldReward: 600,
      xpReward: 300,
      dropChance: 0.8,
      isUnlocked: false,
      difficultyMultiplier: 2.2,
      damagePerSecond: 12,
      isRaid: true,
      keyCost: 1
    },
    {
      id: 'd3',
      name: 'Orc Fortress',
      requiredPower: 4500,
      duration: 60,
      goldReward: 500,
      xpReward: 250,
      dropChance: 0.35,
      isUnlocked: false,
      difficultyMultiplier: 2.5,
      damagePerSecond: 10,
      isRaid: false,
      keyCost: 0
    },
    {
      id: 'd4',
      name: 'Dragon Lair',
      requiredPower: 25000,
      duration: 180,
      goldReward: 2500,
      xpReward: 1200,
      dropChance: 0.5,
      isUnlocked: false,
      difficultyMultiplier: 6,
      damagePerSecond: 22,
      isRaid: false,
      keyCost: 0
    },
    {
      id: 'd_raid2',
      name: 'Volcanic Caldera (Raid)',
      requiredPower: 60000,
      duration: 300,
      goldReward: 10000,
      xpReward: 5000,
      dropChance: 1.0,
      isUnlocked: false,
      difficultyMultiplier: 8.5,
      damagePerSecond: 45,
      isRaid: true,
      keyCost: 2
    },
    {
      id: 'd5',
      name: 'Abyssal Gate',
      requiredPower: 150000,
      duration: 600,
      goldReward: 15000,
      xpReward: 7500,
      dropChance: 0.6,
      isUnlocked: false,
      difficultyMultiplier: 15,
      damagePerSecond: 60,
      isRaid: false,
      keyCost: 0
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
  relics: [
    {
      id: 'r1',
      name: 'Sword of Destiny',
      description: 'Increases hero damage by 15% per level.',
      level: 0,
      cost: 1,
      bonusPerLevel: 0.15,
      type: 'DAMAGE'
    },
    {
      id: 'r2',
      name: 'Golden Chalice',
      description: 'Increases gold gain by 20% per level.',
      level: 0,
      cost: 1,
      bonusPerLevel: 0.20,
      type: 'GOLD'
    },
    {
      id: 'r3',
      name: 'Timeglass of Aeons',
      description: 'Reduces dungeon run duration by 10% per level.',
      level: 0,
      cost: 2,
      bonusPerLevel: 0.10,
      type: 'SPEED'
    },
    {
      id: 'r4',
      name: 'Amulet of Vitality',
      description: 'Increases hero max HP by 25% per level.',
      level: 0,
      cost: 1,
      bonusPerLevel: 0.25,
      type: 'HP'
    },
    {
      id: 'r5',
      name: 'Chronos Gear',
      description: 'Reduces Key regen time by 30 seconds per level.',
      level: 0,
      cost: 3,
      bonusPerLevel: 30,
      type: 'KEY_REGEN'
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
  lastKeyRegenTime: Date.now(),
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
  SAVE_VERSION: '1.4.0',
  TICK_RATE: 100, // ms
  OFFLINE_CAP_HOURS: 12,
  XP_PER_LEVEL_BASE: 200,
  XP_LEVEL_EXPONENT: 2.2,
  KEY_REGEN_TIME_BASE: 300, // 5 minutes in seconds (300 seconds)
  MAX_KEYS_DEFAULT: 10
};
