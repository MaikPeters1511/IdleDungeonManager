import { GameState, Hero, Dungeon, Upgrade, UpgradeType, Resources, QuestType } from '../core/interfaces/game-state.interface';
import { GAME_CONSTANTS } from '../core/constants/game-data';

export class GameEngine {
  /**
   * Processes a single game tick
   * @param state Current game state
   * @param deltaTime Time elapsed in seconds
   * @returns Updated game state
   */
  public static tick(state: GameState, deltaTime: number): GameState {
    const newState: GameState = {
      ...state,
      resources: { ...state.resources },
      stats: { ...state.stats },
      heroes: state.heroes.map(h => ({ ...h })),
      dungeons: state.dungeons.map(d => ({ ...d })),
      upgrades: state.upgrades.map(u => ({ ...u })),
      achievements: state.achievements.map(a => ({ ...a })),
      quests: (state.quests || []).map(q => ({ ...q }))
    };
    
    this.processDungeonProgress(newState, deltaTime);
    this.checkAchievements(newState);
    this.updateQuests(newState);
    
    return newState;
  }

  private static processDungeonProgress(state: GameState, deltaTime: number): void {
    state.heroes.forEach(hero => {
      if (!hero.isUnlocked || !hero.currentDungeonId) return;

      const dungeon = state.dungeons.find(d => d.id === hero.currentDungeonId);
      if (!dungeon) return;

      const effectiveDuration = this.getEffectiveDungeonDuration(state, dungeon, hero);
      
      if (hero.dungeonProgress === undefined) hero.dungeonProgress = 0;
      
      hero.dungeonProgress += deltaTime;

      if (hero.dungeonProgress >= effectiveDuration) {
        hero.dungeonProgress = 0;
        
        const goldBonusMultiplier = 1 + this.getUpgradeBonus(state, UpgradeType.GOLD_GAIN);
        const goldReward = dungeon.goldReward * hero.goldBonus * goldBonusMultiplier;
        const xpReward = dungeon.xpReward;
        
        state.resources.gold += goldReward;
        state.resources.xp += xpReward;
        state.stats.totalGoldEarned += goldReward;
        state.stats.totalDungeonsCompleted += 1;
        
        hero.xp += xpReward;
        const xpNeeded = this.calculateXpToNextLevel(hero.level);
        if (hero.xp >= xpNeeded) {
          hero.level += 1;
          hero.xp -= xpNeeded;
          hero.baseDamage = Math.floor(hero.baseDamage * 1.12); // Slightly slower base scaling
          state.stats.totalHeroLevels = (state.stats.totalHeroLevels || 0) + 1;
        }
      }
    });
  }

  private static checkAchievements(state: GameState): void {
    state.achievements.forEach(ach => {
      if (ach.isUnlocked) return;

      let isConditionMet = false;
      if (ach.id === 'a1' && state.stats.totalDungeonsCompleted >= 1) isConditionMet = true;
      if (ach.id === 'a2' && state.stats.totalGoldEarned >= 10000) isConditionMet = true;
      if (ach.id === 'a3' && state.stats.totalHeroLevels >= 50) isConditionMet = true;
      if (ach.id === 'a4' && state.heroes.every(h => h.isUnlocked)) isConditionMet = true;

      if (isConditionMet) {
        ach.isUnlocked = true;
        if (ach.reward) {
          if (ach.reward.gold) state.resources.gold += ach.reward.gold;
          if (ach.reward.gems) state.resources.gems += ach.reward.gems;
          if (ach.reward.essence) state.resources.essence += ach.reward.essence;
        }
      }
    });
  }

  private static updateQuests(state: GameState): void {
    if (!state.quests) return;
    
    state.quests.forEach(quest => {
      if (quest.isCompleted) return;

      switch (quest.type) {
        case QuestType.COLLECT_GOLD: quest.currentValue = state.stats.totalGoldEarned; break;
        case QuestType.COMPLETE_DUNGEONS: quest.currentValue = state.stats.totalDungeonsCompleted; break;
        case QuestType.UPGRADE_HEROES: quest.currentValue = state.stats.totalHeroLevels || 0; break;
        case QuestType.CLICK_MANUAL: quest.currentValue = state.stats.totalClicks || 0; break;
      }

      if (quest.currentValue >= quest.targetValue) {
        quest.isCompleted = true;
      }
    });
  }

  public static getEffectiveDungeonDuration(state: GameState, dungeon: Dungeon, hero: Hero): number {
    const speedBonus = this.getUpgradeBonus(state, UpgradeType.DUNGEON_SPEED);
    const damageBonus = this.getUpgradeBonus(state, UpgradeType.HERO_DAMAGE);
    
    // Damage now also reduces duration slightly (up to 50% reduction from damage alone)
    const damageFactor = 1 + (damageBonus * 0.5);
    const totalSpeedFactor = (1 + speedBonus) * damageFactor;
    
    return Math.max(0.5, dungeon.duration / totalSpeedFactor);
  }

  public static getHeroEffectiveDamage(state: GameState, hero: Hero): number {
    const damageBonus = this.getUpgradeBonus(state, UpgradeType.HERO_DAMAGE);
    return Math.floor(hero.baseDamage * (1 + damageBonus));
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
    return Math.floor(hero.upgradeCost * Math.pow(1.3, hero.level - 1));
  }

  public static calculateXpToNextLevel(level: number): number {
    return Math.floor(GAME_CONSTANTS.XP_PER_LEVEL_BASE * Math.pow(level, 1.8));
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
          const dungeonGps = dungeon.goldReward / this.getEffectiveDungeonDuration(state, dungeon, hero);
          totalGps += dungeonGps * hero.goldBonus * goldBonusMultiplier;
        }
      }
    });
    return totalGps;
  }
}
