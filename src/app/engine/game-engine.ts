import { GameState, Hero, Dungeon, Upgrade, UpgradeType, Resources } from '../core/interfaces/game-state.interface';
import { GAME_CONSTANTS } from '../core/constants/game-data';

export class GameEngine {
  /**
   * Processes a single game tick
   * @param state Current game state
   * @param deltaTime Time elapsed in seconds
   * @returns Updated game state
   */
  public static tick(state: GameState, deltaTime: number): GameState {
    // Create a deep enough copy for reactivity
    const newState: GameState = {
      ...state,
      resources: { ...state.resources },
      stats: { ...state.stats },
      heroes: state.heroes.map(h => ({ ...h })),
      dungeons: state.dungeons.map(d => ({ ...d })),
      upgrades: state.upgrades.map(u => ({ ...u })),
      achievements: state.achievements.map(a => ({ ...a }))
    };
    
    // 1. Process Heroes in Dungeons
    this.processDungeonProgress(newState, deltaTime);
    
    // 2. Check Achievements
    this.checkAchievements(newState);
    
    return newState;
  }

  private static processDungeonProgress(state: GameState, deltaTime: number): void {
    state.heroes.forEach(hero => {
      if (!hero.isUnlocked || !hero.currentDungeonId) return;

      const dungeon = state.dungeons.find(d => d.id === hero.currentDungeonId);
      if (!dungeon) return;

      const effectiveDuration = this.getEffectiveDungeonDuration(state, dungeon);
      
      if (hero.dungeonProgress === undefined) hero.dungeonProgress = 0;
      
      hero.dungeonProgress += deltaTime;

      if (hero.dungeonProgress >= effectiveDuration) {
        // Dungeon Completed!
        hero.dungeonProgress = 0;
        
        const goldBonusMultiplier = 1 + this.getUpgradeBonus(state, UpgradeType.GOLD_GAIN);
        const goldReward = dungeon.goldReward * hero.goldBonus * goldBonusMultiplier;
        const xpReward = dungeon.xpReward;
        
        state.resources.gold += goldReward;
        state.resources.xp += xpReward;
        state.stats.totalGoldEarned += goldReward;
        state.stats.totalDungeonsCompleted += 1;
        
        // Add XP to hero
        hero.xp += xpReward;
        const xpNeeded = this.calculateXpToNextLevel(hero.level);
        if (hero.xp >= xpNeeded) {
          hero.level += 1;
          hero.xp -= xpNeeded;
          hero.baseDamage = Math.floor(hero.baseDamage * 1.15); // Faster scaling
        }
      }
    });
  }

  private static checkAchievements(state: GameState): void {
    state.achievements.forEach(ach => {
      if (ach.isUnlocked) return;

      let isConditionMet = false;
      if (ach.id === 'a1' && state.stats.totalDungeonsCompleted >= 1) {
        isConditionMet = true;
      }
      // Add more achievement checks here

      if (isConditionMet) {
        ach.isUnlocked = true;
        if (ach.reward) {
          if (ach.reward.gold) state.resources.gold += ach.reward.gold;
          if (ach.reward.gems) state.resources.gems += ach.reward.gems;
          if (ach.reward.essence) state.resources.essence += ach.reward.essence;
        }
        console.log(`Achievement Unlocked: ${ach.name}`);
      }
    });
  }

  public static calculateOfflineProgress(state: GameState, lastTime: number, currentTime: number): { state: GameState, earned: Partial<Resources>, seconds: number } {
    const elapsedSeconds = (currentTime - lastTime) / 1000;
    const cappedSeconds = Math.min(elapsedSeconds, GAME_CONSTANTS.OFFLINE_CAP_HOURS * 3600);
    
    if (cappedSeconds < 60) return { state, earned: { gold: 0 }, seconds: cappedSeconds };

    const goldPerSecond = this.calculateGlobalGoldPerSecond(state);
    const earnedGold = goldPerSecond * cappedSeconds;
    
    const newState = { ...state };
    newState.resources = { ...state.resources, gold: state.resources.gold + earnedGold };
    newState.stats = { ...state.stats, totalGoldEarned: state.stats.totalGoldEarned + earnedGold };
    
    return {
      state: newState,
      earned: { gold: earnedGold },
      seconds: cappedSeconds
    };
  }

  public static calculateGlobalGoldPerSecond(state: GameState): number {
    let totalGps = 0;
    state.heroes.forEach(hero => {
      if (hero.isUnlocked && hero.currentDungeonId) {
        const dungeon = state.dungeons.find(d => d.id === hero.currentDungeonId);
        if (dungeon) {
          const goldBonusMultiplier = 1 + this.getUpgradeBonus(state, UpgradeType.GOLD_GAIN);
          const dungeonGps = dungeon.goldReward / this.getEffectiveDungeonDuration(state, dungeon);
          totalGps += dungeonGps * hero.goldBonus * goldBonusMultiplier;
        }
      }
    });
    return totalGps;
  }

  public static getEffectiveDungeonDuration(state: GameState, dungeon: Dungeon): number {
    const speedBonus = this.getUpgradeBonus(state, UpgradeType.DUNGEON_SPEED);
    // Speed bonus of 0.5 means duration / 1.5, which is correct
    return dungeon.duration / (1 + speedBonus);
  }

  public static getUpgradeBonus(state: GameState, type: UpgradeType): number {
    const upgrade = state.upgrades.find(u => u.type === type);
    if (!upgrade) return 0;
    return upgrade.level * upgrade.bonusPerLevel;
  }

  public static calculateUpgradeCost(upgrade: Upgrade): number {
    return Math.floor(upgrade.cost * Math.pow(upgrade.costMultiplier, upgrade.level));
  }

  public static calculateHeroUpgradeCost(hero: Hero): number {
    return Math.floor(hero.upgradeCost * Math.pow(1.2, hero.level - 1));
  }

  public static calculateXpToNextLevel(level: number): number {
    return Math.floor(GAME_CONSTANTS.XP_PER_LEVEL_BASE * Math.pow(level, GAME_CONSTANTS.XP_LEVEL_EXPONENT));
  }
}
