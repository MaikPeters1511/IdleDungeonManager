import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { GameState, Hero, Upgrade, UpgradeType, Dungeon, Quest } from '../core/interfaces/game-state.interface';
import { GameEngine } from '../engine/game-engine';
import { SaveService } from './save.service';
import { GAME_CONSTANTS } from '../core/constants/game-data';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly saveService = inject(SaveService);
  
  // The core state
  private readonly _state = signal<GameState>(this.saveService.load());
  
  // Public read-only signals
  public readonly state = this._state.asReadonly();
  public readonly resources = computed(() => this.state().resources);
  public readonly heroes = computed(() => this.state().heroes);
  public readonly dungeons = computed(() => this.state().dungeons);
  public readonly upgrades = computed(() => this.state().upgrades);
  public readonly stats = computed(() => this.state().stats);
  public readonly quests = computed(() => this.state().quests || []);

  private lastTickTime = Date.now();
  private gameLoopInterval: any;

  constructor() {
    this.startLoop();
    this.handleOfflineProgress();
    
    // Auto-save every 30 seconds
    effect(() => {
      const interval = setInterval(() => {
        this.save();
      }, 30000);
      return () => clearInterval(interval);
    });
  }

  private startLoop(): void {
    this.gameLoopInterval = setInterval(() => {
      this.tick();
    }, GAME_CONSTANTS.TICK_RATE);
  }

  private tick(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastTickTime) / 1000;
    this.lastTickTime = now;

    this._state.update(state => GameEngine.tick(state, deltaTime));
  }

  private handleOfflineProgress(): void {
    const state = this.state();
    const now = Date.now();
    const offlineResult = GameEngine.calculateOfflineProgress(state, state.lastSaveTime, now);
    
    if (offlineResult.seconds > 60) {
      console.log(`Welcome back! You earned ${offlineResult.earned.gold} gold while away.`);
      this._state.set(offlineResult.state);
    }
  }

  public save(): void {
    this.saveService.save(this.state());
  }

  public resetGame(): void {
    this.saveService.clear();
    window.location.reload();
  }

  public manualClick(): void {
    this._state.update(state => ({
      ...state,
      resources: { ...state.resources, gold: state.resources.gold + (1 * (1 + GameEngine.getUpgradeBonus(state, UpgradeType.GOLD_GAIN))) },
      stats: { 
        ...state.stats, 
        totalGoldEarned: state.stats.totalGoldEarned + (1 * (1 + GameEngine.getUpgradeBonus(state, UpgradeType.GOLD_GAIN))),
        totalClicks: (state.stats.totalClicks || 0) + 1
      }
    }));
  }

  // Actions
  public upgradeHero(heroId: string): void {
    this._state.update(state => {
      const hero = state.heroes.find(h => h.id === heroId);
      if (!hero) return state;

      const cost = GameEngine.calculateHeroUpgradeCost(hero);
      if (state.resources.gold >= cost) {
        return {
          ...state,
          resources: { ...state.resources, gold: state.resources.gold - cost },
          stats: { ...state.stats, totalHeroLevels: (state.stats.totalHeroLevels || 0) + 1 },
          heroes: state.heroes.map(h => h.id === heroId ? { 
            ...h, 
            level: h.level + 1, 
            baseDamage: Math.floor(h.baseDamage * 1.15) 
          } : h)
        };
      }
      return state;
    });
  }

  public unlockHero(heroId: string): void {
    this._state.update(state => {
      const hero = state.heroes.find(h => h.id === heroId);
      if (!hero || hero.isUnlocked) return state;

      if (state.resources.gold >= hero.upgradeCost) {
        return {
          ...state,
          resources: { ...state.resources, gold: state.resources.gold - hero.upgradeCost },
          heroes: state.heroes.map(h => h.id === heroId ? { ...h, isUnlocked: true } : h)
        };
      }
      return state;
    });
  }

  public assignHeroToDungeon(heroId: string, dungeonId: string | undefined): void {
    this._state.update(state => ({
      ...state,
      heroes: state.heroes.map(h => h.id === heroId ? { 
        ...h, 
        currentDungeonId: dungeonId, 
        dungeonProgress: 0 
      } : h)
    }));
  }

  public buyUpgrade(upgradeId: string): void {
    this._state.update(state => {
      const upgrade = state.upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return state;

      const cost = GameEngine.calculateUpgradeCost(upgrade);
      if (state.resources.gold >= cost) {
        return {
          ...state,
          resources: { ...state.resources, gold: state.resources.gold - cost },
          upgrades: state.upgrades.map(u => u.id === upgradeId ? { ...u, level: u.level + 1 } : u)
        };
      }
      return state;
    });
  }

  public unlockDungeon(dungeonId: string): void {
    this._state.update(state => {
      const dungeon = state.dungeons.find(d => d.id === dungeonId);
      if (!dungeon || dungeon.isUnlocked) return state;

      if (state.stats.totalGoldEarned >= dungeon.requiredPower) {
        return {
          ...state,
          dungeons: state.dungeons.map(d => d.id === dungeonId ? { ...d, isUnlocked: true } : d)
        };
      }
      return state;
    });
  }

  public claimQuestReward(questId: string): void {
    this._state.update(state => {
      const quest = state.quests.find(q => q.id === questId);
      if (!quest || !quest.isCompleted || quest.isClaimed) return state;

      const newState = {
        ...state,
        resources: { ...state.resources },
        quests: state.quests.map(q => q.id === questId ? { ...q, isClaimed: true } : q)
      };

      if (quest.reward.gold) newState.resources.gold += quest.reward.gold;
      if (quest.reward.gems) newState.resources.gems += quest.reward.gems;
      if (quest.reward.xp) newState.resources.xp += quest.reward.xp;
      
      return newState;
    });
  }
}
