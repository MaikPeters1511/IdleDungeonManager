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
      // Implement specific migrations here
      state.version = GAME_CONSTANTS.SAVE_VERSION;
    }

    // Ensure new properties exist
    if (!state.stats) {
      state.stats = { totalGoldEarned: state.resources.gold, totalDungeonsCompleted: 0 };
    }

    return state as GameState;
  }
}
