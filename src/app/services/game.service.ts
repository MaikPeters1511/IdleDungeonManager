import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { GameState, Hero, Upgrade, UpgradeType, Dungeon, Quest, Relic, Equipment } from '../core/interfaces/game-state.interface';
import { GameEngine } from '../engine/game-engine';
import { SaveService } from './save.service';
import { GAME_CONSTANTS, INITIAL_GAME_STATE } from '../core/constants/game-data';

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
  public readonly relics = computed(() => this.state().relics || []);
  public readonly inventory = computed(() => this.state().inventory || []);

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
    this._state.update(state => {
      if (!dungeonId) {
        return {
          ...state,
          heroes: state.heroes.map(h => h.id === heroId ? { 
            ...h, 
            currentDungeonId: undefined, 
            dungeonProgress: 0 
          } : h)
        };
      }

      const dungeon = state.dungeons.find(d => d.id === dungeonId);
      const hero = state.heroes.find(h => h.id === heroId);
      if (!dungeon || !hero || hero.isResting) return state;

      if (dungeon.isRaid) {
        const cost = dungeon.keyCost || 0;
        if (state.resources.dungeonKeys < cost) {
          return state;
        }

        return {
          ...state,
          resources: {
            ...state.resources,
            dungeonKeys: state.resources.dungeonKeys - cost
          },
          heroes: state.heroes.map(h => h.id === heroId ? { 
            ...h, 
            currentDungeonId: dungeonId, 
            dungeonProgress: 0 
          } : h)
        };
      }

      return {
        ...state,
        heroes: state.heroes.map(h => h.id === heroId ? { 
          ...h, 
          currentDungeonId: dungeonId, 
          dungeonProgress: 0 
        } : h)
      };
    });
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

  public prestige(): void {
    this._state.update(state => {
      const earnedEssence = Math.floor(state.stats.totalGoldEarned / 100000);
      if (earnedEssence <= 0) return state;

      // Keep achievements, quests, inventory, and relics. Reset the rest!
      const resetState: GameState = {
        ...state,
        resources: {
          gold: 100,
          gems: 0,
          xp: 0,
          dungeonKeys: 5,
          essence: state.resources.essence + earnedEssence
        },
        upgrades: state.upgrades.map(u => ({ ...u, level: 0 })),
        dungeons: state.dungeons.map(d => ({
          ...d,
          isUnlocked: d.id === 'd1'
        })),
        heroes: state.heroes.map(h => {
          const startHero = INITIAL_GAME_STATE.heroes.find(sh => sh.id === h.id)!;
          return {
            ...h,
            level: 1,
            xp: 0,
            baseDamage: startHero.baseDamage,
            maxHp: startHero.maxHp,
            currentHp: startHero.maxHp,
            isUnlocked: startHero.isUnlocked,
            currentDungeonId: undefined,
            dungeonProgress: 0,
            isResting: false,
            equipment: {}
          };
        }),
        stats: {
          totalGoldEarned: 100,
          totalDungeonsCompleted: 0,
          totalClicks: 0,
          totalHeroLevels: 0
        },
        lastKeyRegenTime: Date.now()
      };

      return resetState;
    });
  }

  public buyRelicUpgrade(relicId: string): void {
    this._state.update(state => {
      const relic = state.relics.find(r => r.id === relicId);
      if (!relic) return state;

      const cost = relic.cost + relic.level;
      if (state.resources.essence >= cost) {
        return {
          ...state,
          resources: {
            ...state.resources,
            essence: state.resources.essence - cost
          },
          relics: state.relics.map(r => r.id === relicId ? { ...r, level: r.level + 1 } : r)
        };
      }
      return state;
    });
  }

  public equipItem(heroId: string, itemId: string, slot: 'Weapon' | 'Armor' | 'Accessory'): void {
    this._state.update(state => {
      const hero = state.heroes.find(h => h.id === heroId);
      const item = state.inventory.find(i => i.id === itemId);
      if (!hero || !item || item.slot !== slot) return state;

      let newInventory = [...state.inventory];
      const slotName = slot.toLowerCase() as 'weapon' | 'armor' | 'accessory';
      const currentItem = hero.equipment?.[slotName];
      
      if (currentItem) {
        newInventory.push(currentItem);
      }

      newInventory = newInventory.filter(i => i.id !== itemId);

      const updatedHero = {
        ...hero,
        equipment: {
          ...hero.equipment,
          [slotName]: item
        }
      };

      if (slot === 'Armor') {
        const oldMax = GameEngine.getHeroMaxHp(state, hero);
        const newMax = GameEngine.getHeroMaxHp({ ...state, heroes: state.heroes.map(h => h.id === heroId ? updatedHero : h) }, updatedHero);
        updatedHero.currentHp = (updatedHero.currentHp || 0) + (newMax - oldMax);
      }

      return {
        ...state,
        inventory: newInventory,
        heroes: state.heroes.map(h => h.id === heroId ? updatedHero : h)
      };
    });
  }

  public unequipItem(heroId: string, slot: 'weapon' | 'armor' | 'accessory'): void {
    this._state.update(state => {
      const hero = state.heroes.find(h => h.id === heroId);
      const item = hero?.equipment?.[slot];
      if (!hero || !item) return state;

      const updatedHero = {
        ...hero,
        equipment: {
          ...hero.equipment,
          [slot]: undefined
        }
      };

      if (slot === 'armor') {
        const oldMax = GameEngine.getHeroMaxHp(state, hero);
        const newMax = GameEngine.getHeroMaxHp({ ...state, heroes: state.heroes.map(h => h.id === heroId ? updatedHero : h) }, updatedHero);
        updatedHero.currentHp = Math.max(1, (updatedHero.currentHp || 0) - (oldMax - newMax));
      }

      return {
        ...state,
        inventory: [...state.inventory, item],
        heroes: state.heroes.map(h => h.id === heroId ? updatedHero : h)
      };
    });
  }
}
