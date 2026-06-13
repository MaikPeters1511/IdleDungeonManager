import { Injectable } from '@angular/core';
import { GameState } from '../core/interfaces/game-state.interface';
import { INITIAL_GAME_STATE, GAME_CONSTANTS } from '../core/constants/game-data';

@Injectable({
  providedIn: 'root'
})
export class SaveService {
  public save(state: GameState): void {
    const data = JSON.stringify({
      ...state,
      lastSaveTime: Date.now()
    });
    localStorage.setItem(GAME_CONSTANTS.SAVE_KEY, data);
  }

  public load(): GameState {
    const saved = localStorage.getItem(GAME_CONSTANTS.SAVE_KEY);
    if (!saved) return { ...INITIAL_GAME_STATE };

    try {
      const parsed = JSON.parse(saved);
      return this.migrate(parsed);
    } catch (e) {
      console.error('Failed to load savegame', e);
      return { ...INITIAL_GAME_STATE };
    }
  }

  public clear(): void {
    localStorage.removeItem(GAME_CONSTANTS.SAVE_KEY);
  }

  private migrate(state: any): GameState {
    // Versioning and migration logic
    if (state.version !== GAME_CONSTANTS.SAVE_VERSION) {
      console.log(`Migrating save from ${state.version} to ${GAME_CONSTANTS.SAVE_VERSION}`);
      state.version = GAME_CONSTANTS.SAVE_VERSION;
    }

    // Ensure new properties exist
    if (!state.stats) {
      state.stats = { ...INITIAL_GAME_STATE.stats };
    }
    
    // Fix missing stats properties
    if (state.stats.totalClicks === undefined) state.stats.totalClicks = 0;
    if (state.stats.totalHeroLevels === undefined) state.stats.totalHeroLevels = 0;

    // Add quests if they don't exist
    if (!state.quests || state.quests.length === 0) {
      state.quests = INITIAL_GAME_STATE.quests.map(q => ({ ...q }));
    }

    // Add relics, inventory, and keys if they don't exist
    if (!state.relics || state.relics.length === 0) {
      state.relics = INITIAL_GAME_STATE.relics.map(r => ({ ...r }));
    }
    if (state.lastKeyRegenTime === undefined) {
      state.lastKeyRegenTime = Date.now();
    }
    if (!state.inventory) {
      state.inventory = [];
    }

    // Version 1.5.0 properties
    if (state.resources.scrapMetal === undefined) {
      state.resources.scrapMetal = 0;
    }
    if (!state.activePotions) {
      state.activePotions = [];
    }
    if (state.lastModifierRefreshTime === undefined) {
      state.lastModifierRefreshTime = Date.now();
    }
    if (state.language === undefined) {
      state.language = 'de';
    }

    // Ensure all heroes are present and update their recruitment costs and HP for existing saves
    INITIAL_GAME_STATE.heroes.forEach(initialHero => {
      const existingHero = state.heroes.find((h: any) => h.id === initialHero.id);
      if (existingHero) {
        existingHero.upgradeCost = initialHero.upgradeCost;
        if (existingHero.maxHp === undefined) {
          existingHero.maxHp = initialHero.maxHp;
          existingHero.currentHp = initialHero.maxHp;
          existingHero.isResting = false;
        }
      } else {
        state.heroes.push({ ...initialHero });
      }
    });

    // Merge dungeons (e.g. adding raids and modifier placeholders if they don't exist)
    INITIAL_GAME_STATE.dungeons.forEach(initialDungeon => {
      const existingDungeon = state.dungeons.find((d: any) => d.id === initialDungeon.id);
      if (existingDungeon) {
        existingDungeon.damagePerSecond = initialDungeon.damagePerSecond;
        existingDungeon.isRaid = initialDungeon.isRaid;
        existingDungeon.keyCost = initialDungeon.keyCost;
        if (existingDungeon.modifierType === undefined) {
          existingDungeon.modifierType = initialDungeon.modifierType || 'NONE';
          existingDungeon.modifierRemainingTime = initialDungeon.modifierRemainingTime || 0;
        }
      } else {
        state.dungeons.push({ ...initialDungeon });
      }
    });

    // Merge upgrades (e.g. adding new u4, u5, u6 if they don't exist)
    INITIAL_GAME_STATE.upgrades.forEach(initialUpgrade => {
      const existingUpgrade = state.upgrades.find((u: any) => u.id === initialUpgrade.id);
      if (!existingUpgrade) {
        state.upgrades.push({ ...initialUpgrade });
      }
    });

    return state as GameState;
  }
}
