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
  public readonly activePotions = computed(() => this.state().activePotions || []);
  public readonly scrapMetal = computed(() => this.state().resources.scrapMetal || 0);
  public readonly language = computed(() => this.state().language || 'de');

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

  public changeLanguage(lang: 'de' | 'en'): void {
    this._state.update(state => ({
      ...state,
      language: lang
    }));
    this.save();
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
          essence: state.resources.essence + earnedEssence,
          scrapMetal: 0
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

  public brewPotion(type: 'HASTE' | 'MIDAS' | 'FINDER'): void {
    this._state.update(state => {
      const costs = { HASTE: 15, MIDAS: 20, FINDER: 25 };
      const cost = costs[type];
      if (state.resources.gems < cost) return state;

      const names = {
        HASTE: 'Elixir of Haste',
        MIDAS: 'Midas Elixir',
        FINDER: 'Loot Finder Potion'
      };

      const newPotion = {
        id: 'pot_' + Math.random().toString(36).substr(2, 9),
        name: names[type],
        type,
        duration: 300, // 5 minutes in seconds
        multiplier: type === 'HASTE' ? 1.5 : 2.0
      };

      return {
        ...state,
        resources: {
          ...state.resources,
          gems: state.resources.gems - cost
        },
        activePotions: [...(state.activePotions || []), newPotion]
      };
    });
  }

  public useHealingPotion(heroId: string): void {
    this._state.update(state => {
      if (state.resources.gems < 5) return state;
      const hero = state.heroes.find(h => h.id === heroId);
      if (!hero) return state;

      const maxHp = GameEngine.getHeroMaxHp(state, hero);
      const updatedHero = {
        ...hero,
        currentHp: maxHp,
        isResting: false
      };

      return {
        ...state,
        resources: {
          ...state.resources,
          gems: state.resources.gems - 5
        },
        heroes: state.heroes.map(h => h.id === heroId ? updatedHero : h)
      };
    });
  }

  public scrapItem(itemId: string): void {
    this._state.update(state => {
      const item = state.inventory.find(i => i.id === itemId);
      if (!item) return state;

      const scrapMap = {
        Common: 10,
        Rare: 25,
        Epic: 75,
        Legendary: 250
      };
      const metalEarned = scrapMap[item.rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary'] || 10;

      return {
        ...state,
        resources: {
          ...state.resources,
          scrapMetal: (state.resources.scrapMetal || 0) + metalEarned
        },
        inventory: state.inventory.filter(i => i.id !== itemId)
      };
    });
  }

  public upgradeItem(itemId: string): void {
    this._state.update(state => {
      let targetItem: Equipment | undefined;
      let isEquipped = false;
      let equippedHeroId = '';
      let equippedSlot = '';

      targetItem = state.inventory.find(i => i.id === itemId);
      if (!targetItem) {
        state.heroes.forEach(h => {
          if (h.equipment) {
            ['weapon', 'armor', 'accessory'].forEach(slot => {
              const item = h.equipment?.[slot as 'weapon' | 'armor' | 'accessory'];
              if (item && item.id === itemId) {
                targetItem = item;
                isEquipped = true;
                equippedHeroId = h.id;
                equippedSlot = slot;
              }
            });
          }
        });
      }

      if (!targetItem) return state;

      const rarity = targetItem.rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary';
      const level = targetItem.level || 1;

      const baseCosts = {
        Common: { gold: 100, scrap: 15 },
        Rare: { gold: 250, scrap: 30 },
        Epic: { gold: 1000, scrap: 100 },
        Legendary: { gold: 5000, scrap: 400 }
      };

      const cost = baseCosts[rarity] || { gold: 100, scrap: 15 };
      const goldCost = Math.floor(cost.gold * Math.pow(1.5, level - 1));
      const scrapCost = Math.floor(cost.scrap * Math.pow(1.4, level - 1));

      if (state.resources.gold < goldCost || (state.resources.scrapMetal || 0) < scrapCost) {
        return state;
      }

      const upgradedItem: Equipment = {
        ...targetItem,
        level: level + 1
      };

      let newInventory = [...state.inventory];
      let newHeroes = state.heroes.map(h => ({ ...h }));

      if (isEquipped) {
        newHeroes = newHeroes.map(h => {
          if (h.id === equippedHeroId && h.equipment) {
            const updatedEquip = { ...h.equipment, [equippedSlot]: upgradedItem };
            const updatedHero = { ...h, equipment: updatedEquip };
            
            if (equippedSlot === 'armor') {
              const oldMax = GameEngine.getHeroMaxHp(state, h);
              const newMax = GameEngine.getHeroMaxHp({ ...state, heroes: newHeroes }, updatedHero);
              updatedHero.currentHp = (updatedHero.currentHp || 0) + (newMax - oldMax);
            }
            return updatedHero;
          }
          return h;
        });
      } else {
        newInventory = newInventory.map(i => i.id === itemId ? upgradedItem : i);
      }

      return {
        ...state,
        resources: {
          ...state.resources,
          gold: state.resources.gold - goldCost,
          scrapMetal: state.resources.scrapMetal - scrapCost
        },
        inventory: newInventory,
        heroes: newHeroes
      };
    });
  }

  public combineItems(itemIds: string[]): void {
    if (itemIds.length !== 3) return;

    this._state.update(state => {
      const items = state.inventory.filter(i => itemIds.includes(i.id));
      if (items.length !== 3) return state;

      const rarity = items[0].rarity;
      if (rarity === 'Legendary') return state;
      if (items.some(i => i.rarity !== rarity)) return state;

      const nextRarityMap = {
        Common: 'Rare',
        Rare: 'Epic',
        Epic: 'Legendary'
      };
      const nextRarity = nextRarityMap[rarity as 'Common' | 'Rare' | 'Epic'] as 'Rare' | 'Epic' | 'Legendary';

      const dummyDungeon = state.dungeons[0];
      const newItem = GameEngine.generateLoot(dummyDungeon);
      newItem.rarity = nextRarity as any;
      
      const rarityMultiplier = nextRarity === 'Legendary' ? 8 : nextRarity === 'Epic' ? 4 : 2;
      const levelScale = 2.0;

      if (newItem.slot === 'Weapon') {
        newItem.bonusDamage = Math.floor(levelScale * 4 * rarityMultiplier);
      } else if (newItem.slot === 'Armor') {
        newItem.bonusHp = Math.floor(levelScale * 25 * rarityMultiplier);
      } else {
        if (newItem.bonusGold) newItem.bonusGold = 0.05 * rarityMultiplier;
        else newItem.bonusXp = 0.05 * rarityMultiplier;
      }
      newItem.level = 1;
      newItem.name = 'Forged ' + newItem.name;

      const newInventory = state.inventory.filter(i => !itemIds.includes(i.id));
      newInventory.push(newItem);

      return {
        ...state,
        inventory: newInventory
      };
    });
  }
}
