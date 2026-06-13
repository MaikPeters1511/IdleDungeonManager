import { GameState, Hero, Dungeon, Upgrade, UpgradeType, Resources, QuestType, Relic, Equipment, EquipmentRarity, HeroClass } from '../core/interfaces/game-state.interface';
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
      quests: (state.quests || []).map(q => ({ ...q })),
      inventory: (state.inventory || []).map(i => ({ ...i })),
      relics: (state.relics || []).map(r => ({ ...r }))
    };
    
    this.processKeyRegen(newState, deltaTime);
    this.processRestAndHealing(newState, deltaTime);
    this.processDungeonProgress(newState, deltaTime);
    this.checkAchievements(newState);
    this.updateQuests(newState);
    
    return newState;
  }

  private static processKeyRegen(state: GameState, deltaTime: number): void {
    if (state.resources.dungeonKeys >= GAME_CONSTANTS.MAX_KEYS_DEFAULT) {
      state.lastKeyRegenTime = Date.now();
      return;
    }

    const keyRegenReduction = this.getRelicBonus(state, 'KEY_REGEN'); // in seconds
    const regenInterval = Math.max(15, GAME_CONSTANTS.KEY_REGEN_TIME_BASE - keyRegenReduction);

    if (!state.lastKeyRegenTime) {
      state.lastKeyRegenTime = Date.now();
    }

    const now = Date.now();
    const elapsedSeconds = (now - state.lastKeyRegenTime) / 1000;

    if (elapsedSeconds >= regenInterval) {
      const keysToAdd = Math.floor(elapsedSeconds / regenInterval);
      state.resources.dungeonKeys = Math.min(
        GAME_CONSTANTS.MAX_KEYS_DEFAULT,
        state.resources.dungeonKeys + keysToAdd
      );
      state.lastKeyRegenTime = now - ((elapsedSeconds % regenInterval) * 1000);
    }
  }

  private static processRestAndHealing(state: GameState, deltaTime: number): void {
    state.heroes.forEach(hero => {
      const isDeployed = hero.isUnlocked && hero.currentDungeonId && !hero.isResting;
      if (!hero.isUnlocked || isDeployed) return;

      const maxHp = this.getHeroMaxHp(state, hero);
      if (hero.currentHp === undefined) hero.currentHp = maxHp;

      if (hero.currentHp < maxHp) {
        // Base healing: 8% of max HP per second. If Cleric is idle in the guild, heal faster!
        const idleClerics = state.heroes.filter(h => h.isUnlocked && h.heroClass === HeroClass.CLERIC && !h.currentDungeonId).length;
        const clericBonus = 1 + (idleClerics * 0.25);
        const healRate = maxHp * 0.08 * clericBonus;
        
        hero.currentHp = Math.min(maxHp, hero.currentHp + healRate * deltaTime);
      }

      if (hero.isResting && hero.currentHp >= maxHp) {
        hero.isResting = false;
      }
    });
  }

  private static processDungeonProgress(state: GameState, deltaTime: number): void {
    // Group active heroes by dungeon
    const dungeonGroups = new Map<string, Hero[]>();
    state.heroes.forEach(h => {
      if (h.isUnlocked && h.currentDungeonId && !h.isResting) {
        const list = dungeonGroups.get(h.currentDungeonId) || [];
        list.push(h);
        dungeonGroups.set(h.currentDungeonId, list);
      }
    });

    dungeonGroups.forEach((heroesInDungeon, dungeonId) => {
      const dungeon = state.dungeons.find(d => d.id === dungeonId);
      if (!dungeon) return;

      // Group synergy check
      const hasTank = heroesInDungeon.some(h => h.heroClass === HeroClass.WARRIOR || h.heroClass === HeroClass.PALADIN);
      const clerics = heroesInDungeon.filter(h => h.heroClass === HeroClass.CLERIC);
      
      // Cleric heals other heroes by level scale + damage multiplier
      const totalHealPerSecond = clerics.reduce((sum, c) => {
        const damageUpgrade = this.getUpgradeBonus(state, UpgradeType.HERO_DAMAGE);
        const relicBonus = this.getRelicBonus(state, 'DAMAGE');
        return sum + (10 + c.level * 2.5) * (1 + damageUpgrade + relicBonus);
      }, 0);

      heroesInDungeon.forEach(hero => {
        const maxHp = this.getHeroMaxHp(state, hero);
        if (hero.currentHp === undefined) hero.currentHp = maxHp;

        // Damage calculation
        let dps = dungeon.damagePerSecond;
        const isTank = hero.heroClass === HeroClass.WARRIOR || hero.heroClass === HeroClass.PALADIN;
        
        // Non-tanks take half damage if a tank is in the dungeon
        if (hasTank && !isTank) {
          dps *= 0.5;
        }

        // Apply damage and healing
        const damageTaken = dps * deltaTime;
        const healingReceived = totalHealPerSecond * deltaTime;
        
        hero.currentHp = Math.max(0, Math.min(maxHp, hero.currentHp - damageTaken + healingReceived));

        // Death / KO check
        if (hero.currentHp <= 0) {
          hero.isResting = true;
          hero.currentDungeonId = undefined;
          hero.dungeonProgress = 0;
          return;
        }

        // Progress dungeon
        if (hero.dungeonProgress === undefined) hero.dungeonProgress = 0;
        hero.dungeonProgress += deltaTime;

        const effectiveDuration = this.getEffectiveDungeonDuration(state, dungeon, hero);
        if (hero.dungeonProgress >= effectiveDuration) {
          hero.dungeonProgress = 0;

          // Rewards
          const goldUpgradeBonus = this.getUpgradeBonus(state, UpgradeType.GOLD_GAIN);
          const goldRelicBonus = this.getRelicBonus(state, 'GOLD');
          const eqGoldBonus = hero.equipment?.accessory?.bonusGold || 0;
          const goldBonusMultiplier = 1 + goldUpgradeBonus + goldRelicBonus + eqGoldBonus;
          
          const goldReward = dungeon.goldReward * hero.goldBonus * goldBonusMultiplier;
          
          const eqXpBonus = hero.equipment?.accessory?.bonusXp || 0;
          const xpReward = dungeon.xpReward * (1 + eqXpBonus);

          state.resources.gold += goldReward;
          state.resources.xp += xpReward;
          state.stats.totalGoldEarned += goldReward;
          state.stats.totalDungeonsCompleted += 1;

          // Hero level up
          hero.xp += xpReward;
          const xpNeeded = this.calculateXpToNextLevel(hero.level);
          if (hero.xp >= xpNeeded) {
            hero.level += 1;
            hero.xp -= xpNeeded;
            hero.baseDamage = Math.floor(hero.baseDamage * 1.12);
            hero.maxHp = Math.floor((hero.maxHp || 100) * 1.10);
            hero.currentHp = this.getHeroMaxHp(state, hero); // Heal to full on level up
            state.stats.totalHeroLevels = (state.stats.totalHeroLevels || 0) + 1;
          }

          // Equipment Drop Roll
          if (Math.random() < dungeon.dropChance) {
            const newItem = this.generateLoot(dungeon);
            state.inventory.push(newItem);
          }
          
          // Raids extra reward
          if (dungeon.isRaid) {
            const gemsGained = Math.floor(Math.random() * 4) + 2;
            state.resources.gems += gemsGained;
            if (Math.random() < 0.35) {
              state.resources.essence += 1;
            }
          }
        }
      });
    });
  }

  public static generateLoot(dungeon: Dungeon): Equipment {
    const slots: ('Weapon' | 'Armor' | 'Accessory')[] = ['Weapon', 'Armor', 'Accessory'];
    const slot = slots[Math.floor(Math.random() * slots.length)];

    const rand = Math.random();
    let rarity = EquipmentRarity.COMMON;
    
    if (dungeon.isRaid) {
      if (rand < 0.20) rarity = EquipmentRarity.LEGENDARY;
      else if (rand < 0.55) rarity = EquipmentRarity.EPIC;
      else rarity = EquipmentRarity.RARE;
    } else {
      const diff = dungeon.difficultyMultiplier;
      if (diff >= 6.0) {
        if (rand < 0.08) rarity = EquipmentRarity.LEGENDARY;
        else if (rand < 0.28) rarity = EquipmentRarity.EPIC;
        else if (rand < 0.68) rarity = EquipmentRarity.RARE;
      } else if (diff >= 2.0) {
        if (rand < 0.15) rarity = EquipmentRarity.EPIC;
        else if (rand < 0.50) rarity = EquipmentRarity.RARE;
      } else {
        if (rand < 0.15) rarity = EquipmentRarity.RARE;
      }
    }

    const rarityMultiplier = rarity === EquipmentRarity.LEGENDARY ? 8 : rarity === EquipmentRarity.EPIC ? 4 : rarity === EquipmentRarity.RARE ? 2 : 1;
    const levelScale = Math.max(1, dungeon.difficultyMultiplier);

    const id = 'eq_' + Math.random().toString(36).substr(2, 9);
    let name = '';
    let bonusDamage: number | undefined;
    let bonusHp: number | undefined;
    let bonusGold: number | undefined;
    let bonusXp: number | undefined;

    if (slot === 'Weapon') {
      const prefixes = {
        [EquipmentRarity.COMMON]: ['Rusty', 'Battered', 'Dull'],
        [EquipmentRarity.RARE]: ['Steel', 'Sharp', 'Heavy'],
        [EquipmentRarity.EPIC]: ['Demonic', 'Glow', 'Runic'],
        [EquipmentRarity.LEGENDARY]: ['Doomweaver', 'Excalibur', 'Starshard']
      };
      const weapons = ['Sword', 'Dagger', 'Staff', 'Bow', 'Axe'];
      const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
      const weapon = weapons[Math.floor(Math.random() * weapons.length)];
      name = `${prefix} ${weapon}`;
      bonusDamage = Math.floor(levelScale * 4 * rarityMultiplier);
    } else if (slot === 'Armor') {
      const prefixes = {
        [EquipmentRarity.COMMON]: ['Tattered', 'Leather', 'Cloth'],
        [EquipmentRarity.RARE]: ['Chainmail', 'Iron', 'Reinforced'],
        [EquipmentRarity.EPIC]: ['Shadowweave', 'Dragonscale', 'Mythril'],
        [EquipmentRarity.LEGENDARY]: ['Eternal Shield', 'Godplate', 'Astral Cloak']
      };
      const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
      name = `${prefix} Armor`;
      bonusHp = Math.floor(levelScale * 25 * rarityMultiplier);
    } else {
      const prefixes = {
        [EquipmentRarity.COMMON]: ['Brass', 'Copper', 'Glass'],
        [EquipmentRarity.RARE]: ['Silver', 'Garnet', 'Jade'],
        [EquipmentRarity.EPIC]: ['Ruby', 'Diamond', 'Sapphire'],
        [EquipmentRarity.LEGENDARY]: ['Chronos', 'Cursed', 'Celestial']
      };
      const types = ['Ring', 'Amulet', 'Talisman'];
      const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
      const typeName = types[Math.floor(Math.random() * types.length)];
      name = `${prefix} ${typeName}`;
      if (Math.random() < 0.5) {
        bonusGold = 0.05 * rarityMultiplier;
      } else {
        bonusXp = 0.05 * rarityMultiplier;
      }
    }

    return {
      id,
      name,
      slot,
      rarity,
      bonusDamage,
      bonusHp,
      bonusGold,
      bonusXp
    };
  }

  private static checkAchievements(state: GameState): void {
    state.achievements.forEach(ach => {
      if (ach.isUnlocked) return;

      let isConditionMet = false;
      if (ach.id === 'a1' && state.stats.totalDungeonsCompleted >= 1) isConditionMet = true;
      if (ach.id === 'a2' && state.stats.totalGoldEarned >= 1000000) isConditionMet = true;
      if (ach.id === 'a3' && state.stats.totalHeroLevels >= 250) isConditionMet = true;
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
    const relicSpeedBonus = this.getRelicBonus(state, 'SPEED');
    
    const damageFactor = 1 + (damageBonus * 0.5);
    const totalSpeedFactor = (1 + speedBonus + relicSpeedBonus) * damageFactor;
    
    return Math.max(0.5, dungeon.duration / totalSpeedFactor);
  }

  public static getHeroEffectiveDamage(state: GameState, hero: Hero): number {
    const damageBonus = this.getUpgradeBonus(state, UpgradeType.HERO_DAMAGE);
    const relicDamageBonus = this.getRelicBonus(state, 'DAMAGE');
    
    const weaponDamage = hero.equipment?.weapon?.bonusDamage || 0;
    
    return Math.floor((hero.baseDamage + weaponDamage) * (1 + damageBonus + relicDamageBonus));
  }

  public static getHeroMaxHp(state: GameState, hero: Hero): number {
    const baseMaxHp = hero.maxHp || 100;
    const relicHpBonus = this.getRelicBonus(state, 'HP');
    const armorHp = hero.equipment?.armor?.bonusHp || 0;
    
    return Math.floor((baseMaxHp + armorHp) * (1 + relicHpBonus));
  }

  public static getUpgradeBonus(state: GameState, type: UpgradeType): number {
    const upgrade = state.upgrades.find(u => u.type === type);
    if (!upgrade) return 0;
    return upgrade.level * upgrade.bonusPerLevel;
  }

  public static getRelicBonus(state: GameState, type: 'DAMAGE' | 'GOLD' | 'SPEED' | 'HP' | 'KEY_REGEN'): number {
    if (!state.relics) return 0;
    const relic = state.relics.find(r => r.type === type);
    if (!relic) return 0;
    return relic.level * relic.bonusPerLevel;
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
      if (hero.isUnlocked && hero.currentDungeonId && !hero.isResting) {
        const dungeon = state.dungeons.find(d => d.id === hero.currentDungeonId);
        if (dungeon) {
          const goldUpgradeBonus = this.getUpgradeBonus(state, UpgradeType.GOLD_GAIN);
          const goldRelicBonus = this.getRelicBonus(state, 'GOLD');
          const eqGoldBonus = hero.equipment?.accessory?.bonusGold || 0;
          const goldBonusMultiplier = 1 + goldUpgradeBonus + goldRelicBonus + eqGoldBonus;
          
          const dungeonGps = dungeon.goldReward / this.getEffectiveDungeonDuration(state, dungeon, hero);
          totalGps += dungeonGps * hero.goldBonus * goldBonusMultiplier;
        }
      }
    });
    return totalGps;
  }
}
