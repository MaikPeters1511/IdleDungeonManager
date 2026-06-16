import { Component, inject, computed, signal, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Equipment, ActivePotion, Hero } from '../../core/interfaces/game-state.interface';
import { GameEngine } from '../../engine/game-engine';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-workshop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in fade-in duration-500 pb-20">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="text-4xl font-black text-white tracking-tight">{{ t('Guild Workshop') }}</h2>
          <p class="text-slate-400 mt-2 text-lg">{{ t('Forge legendary gear and brew magical elixirs.') }}</p>
        </div>

        <!-- Tab Switches -->
        <div class="flex bg-slate-950/40 p-1.5 rounded-2xl border border-white/5 shrink-0 self-start md:self-auto">
          <button (click)="activeTab.set('forge')" 
                  [class.bg-primary]="activeTab() === 'forge'"
                  [class.text-white]="activeTab() === 'forge'"
                  [class.text-slate-400]="activeTab() !== 'forge'"
                  class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300">
            🔨 {{ t('Forge') }}
          </button>
          <button (click)="activeTab.set('alchemy')" 
                  [class.bg-secondary]="activeTab() === 'alchemy'"
                  [class.text-white]="activeTab() === 'alchemy'"
                  [class.text-slate-400]="activeTab() !== 'alchemy'"
                  class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300">
            🧪 {{ t('Alchemy Lab') }}
          </button>
        </div>
      </header>

      <!-- FORGE TAB -->
      @if (activeTab() === 'forge') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Inventory List (Left 2 Columns) -->
          <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl font-black text-white tracking-tight">{{ t('Armory Inventory') }}</h3>
              <div class="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span class="flex items-center gap-1.5">💰 <span class="text-yellow-500 font-black">{{ gold() | number:'1.0-0' }}</span></span>
                <span class="flex items-center gap-1.5">🔧 <span class="text-slate-200 font-black">{{ scrap() | number }}</span></span>
              </div>
            </div>

            <!-- Search & Filters -->
            <div class="flex flex-col gap-3.5 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
              <!-- Search & Selects Row -->
              <div class="flex flex-col sm:flex-row gap-3">
                <!-- Search -->
                <div class="flex-1 relative">
                  <span class="absolute inset-y-0 left-3 flex items-center text-slate-500 text-sm">🔍</span>
                  <input type="text"
                         [placeholder]="t('Search items...')"
                         (input)="onSearchInput($event)"
                         [value]="searchQuery()"
                         class="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition">
                </div>

                <!-- Slot Filter -->
                <select (change)="onSlotSelect($event)"
                        [value]="selectedSlot()"
                        class="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-primary/50 w-full sm:w-auto min-w-[120px]">
                  <option value="All">{{ t('All Slots') }}</option>
                  <option value="Weapon">{{ t('Weapon') }}</option>
                  <option value="Armor">{{ t('Armor') }}</option>
                  <option value="Accessory">{{ t('Accessory') }}</option>
                </select>

                <!-- Sort Filter -->
                <select (change)="onSortSelect($event)"
                        [value]="sortBy()"
                        class="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-primary/50 w-full sm:w-auto min-w-[140px]">
                  <option value="newest">{{ t('Newest') }}</option>
                  <option value="rarity-desc">{{ t('Rarity: High to Low') }}</option>
                  <option value="rarity-asc">{{ t('Rarity: Low to High') }}</option>
                  <option value="level-desc">{{ t('Level: High to Low') }}</option>
                  <option value="level-asc">{{ t('Level: Low to High') }}</option>
                </select>
              </div>

              <!-- Rarity Filter Row -->
              <div class="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 self-start">
                @for (r of ['All', 'Common', 'Rare', 'Epic', 'Legendary']; track r) {
                  <button (click)="selectRarity(r)"
                          [class.bg-slate-800]="selectedRarity() === r"
                          [class.text-white]="selectedRarity() === r"
                          [class.text-slate-400]="selectedRarity() !== r"
                          class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition">
                    {{ t(r) }}
                  </button>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              @for (item of displayedInventory(); track item.id) {
                <div class="premium-card flex flex-col sm:flex-row items-center justify-between gap-6 !p-4 hover:border-primary/20 transition-all">
                  
                  <!-- Checkbox & Item Info -->
                  <div class="flex items-center gap-4 w-full sm:w-auto">
                    <input type="checkbox" 
                           [disabled]="item.rarity === 'Legendary'"
                           [checked]="isItemSelected(item.id)"
                           (change)="toggleItemSelection(item.id)"
                           class="checkbox checkbox-primary border-white/20 rounded-lg">
                    
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <span [class]="getRarityBadgeClass(item.rarity)" class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          {{ t(item.rarity) }}
                        </span>
                        @if (item.level && item.level > 1) {
                          <span class="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-black">+{{ item.level - 1 }}</span>
                        }
                        <span class="text-[10px] font-bold text-slate-500 uppercase">{{ t(item.slot) }}</span>
                      </div>
                      <h4 class="text-base font-bold text-white">{{ item.name }}</h4>
                      <p class="text-xs text-primary mt-0.5 font-medium">
                        {{ getItemStatText(item) }}
                      </p>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <!-- Upgrade -->
                    <button (click)="upgradeItem(item.id)" 
                            [disabled]="gold() < getUpgradeCost(item).gold || scrap() < getUpgradeCost(item).scrap"
                            class="btn btn-outline btn-xs px-3 rounded-lg flex flex-col items-center py-2 h-auto text-[9px] font-bold">
                      <span>{{ t('Upgrade') }}</span>
                      <span class="text-[8px] text-slate-400 tabular-nums">
                        💰{{ getUpgradeCost(item).gold | number:'1.0-0' }} | 🔧{{ getUpgradeCost(item).scrap }}
                      </span>
                    </button>
                    <!-- Scrap -->
                    <button (click)="scrapItem(item.id)" 
                            class="btn btn-error btn-outline btn-xs px-3 rounded-lg font-bold">
                      {{ t('Scrap') }} (+{{ getScrapValue(item.rarity) }} 🔧)
                    </button>
                  </div>

                </div>
              } @empty {
                <div class="text-center py-20 premium-card border-dashed border-white/10 flex flex-col items-center">
                  <div class="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-3xl mb-4 grayscale opacity-50">🔨</div>
                  <h4 class="text-lg font-bold text-white mb-1">{{ t('Armory is Empty') }}</h4>
                  <p class="text-xs text-slate-500 max-w-sm">{{ t('No items in inventory. Assigned heroes will automatically find equipment while farming dungeons.') }}</p>
                </div>
              }
            </div>

            @if (filteredInventory().length > displayedInventory().length) {
              <div #scrollAnchor class="text-center py-4 text-xs text-slate-500 font-bold animate-pulse">
                {{ t('Loading more items...') }}
              </div>
            }
          </div>

          <!-- Combine (Forge) Panel (Right Column) -->
          <div class="space-y-6">
            <h3 class="text-2xl font-black text-white tracking-tight">{{ t('Combine Items') }}</h3>
            
            <div class="premium-card bg-gradient-to-br from-primary/10 to-transparent border-primary/20 space-y-6 !p-6">
              <p class="text-xs text-slate-400 leading-relaxed">
                {{ t('Merge three items of the **exact same rarity** to forge a new random item of the next higher tier!') }}
              </p>
              
              <div class="space-y-3">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ t('Selected Items') }} ({{ selectedItemIds().length }}/3)</p>
                <div class="space-y-2">
                  @for (id of selectedItemIds(); track id) {
                    <div class="p-2.5 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                      <span class="font-bold text-white truncate pr-2">{{ getItemName(id) }}</span>
                      <button (click)="toggleItemSelection(id)" class="text-error font-bold">✕</button>
                    </div>
                  } @empty {
                    <p class="text-xs italic text-slate-600">{{ t('Select items using checkboxes.') }}</p>
                  }
                </div>
              </div>

              <!-- Combine Button -->
              <div class="pt-4 border-t border-white/5">
                @if (selectedItemIds().length === 3) {
                  @if (canCombineSelected()) {
                    <button (click)="combineItems()" 
                            class="btn btn-primary w-full rounded-xl py-3 text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20">
                      {{ t('FORGE HIGHER TIER ITEM') }}
                    </button>
                  } @else {
                    <div class="text-center p-3 bg-error/10 border border-error/20 rounded-xl text-[10px] font-bold text-error leading-relaxed">
                      {{ t('All 3 items must have the same rarity, and must not be Legendary!') }}
                    </div>
                  }
                } @else {
                  <button disabled class="btn btn-primary btn-disabled w-full rounded-xl text-xs py-3 font-bold">
                    {{ t('SELECT 3 ITEMS') }}
                  </button>
                }
              </div>
            </div>
          </div>

        </div>
      }

      <!-- ALCHEMY TAB -->
      @if (activeTab() === 'alchemy') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Potions & Healing (Left 2 Columns) -->
          <div class="lg:col-span-2 space-y-10">
            
            <!-- Brewing Section -->
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl font-black text-white tracking-tight">{{ t('Brew Elixirs') }}</h3>
                <span class="flex items-center gap-1.5 text-sm font-bold text-blue-400">{{ t('Gems') }}: <span class="text-white font-black">{{ gems() }} 💎</span></span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Haste -->
                <div class="premium-card flex flex-col h-full !p-5 border border-secondary/15">
                  <div class="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-2xl mb-4 shrink-0">⚡</div>
                  <h4 class="text-base font-bold text-white mb-1">{{ t('Elixir of Haste') }}</h4>
                  <p class="text-xs text-slate-500 flex-1 leading-relaxed">{{ t('Boosts dungeon completion speed by +50% for 5 minutes.') }}</p>
                  <button (click)="brewPotion('HASTE')" 
                          [disabled]="gems() < 15"
                          class="btn btn-secondary btn-sm w-full rounded-xl mt-5 font-black text-xs">
                    15 {{ t('Gems') }}
                  </button>
                </div>

                <!-- Midas -->
                <div class="premium-card flex flex-col h-full !p-5 border border-secondary/15">
                  <div class="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center text-2xl mb-4 shrink-0">💰</div>
                  <h4 class="text-base font-bold text-white mb-1">{{ t('Midas Elixir') }}</h4>
                  <p class="text-xs text-slate-500 flex-1 leading-relaxed">{{ t('Doubles all gold rewards from dungeons for 5 minutes.') }}</p>
                  <button (click)="brewPotion('MIDAS')" 
                          [disabled]="gems() < 20"
                          class="btn btn-secondary w-full btn-sm rounded-xl mt-5 font-black text-xs">
                    20 {{ t('Gems') }}
                  </button>
                </div>

                <!-- Finder -->
                <div class="premium-card flex flex-col h-full !p-5 border border-secondary/15">
                  <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mb-4 shrink-0">💎</div>
                  <h4 class="text-base font-bold text-white mb-1">{{ t('Loot Finder') }}</h4>
                  <p class="text-xs text-slate-500 flex-1 leading-relaxed">{{ t('Doubles the drop chance for equipment items for 5 minutes.') }}</p>
                  <button (click)="brewPotion('FINDER')" 
                          [disabled]="gems() < 25"
                          class="btn btn-secondary w-full btn-sm rounded-xl mt-5 font-black text-xs">
                    25 {{ t('Gems') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Healing Station -->
            <div class="space-y-6">
              <h3 class="text-2xl font-black text-white tracking-tight">{{ t('Healing Chamber') }}</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (hero of heroes(); track hero.id) {
                  @if (hero.isUnlocked) {
                    <div class="premium-card flex items-center justify-between gap-4 !p-4"
                         [class.border-red-500\/10]="(hero.currentHp || 0) < getHeroMaxHp(hero)">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-white/5 shrink-0"
                             [class.grayscale]="hero.isResting">
                          <img [src]="getHeroImage(hero.heroClass)" class="w-full h-full object-cover">
                        </div>
                        <div class="min-w-0">
                          <h4 class="font-bold text-sm text-slate-200 truncate">{{ hero.name }}</h4>
                          <span class="text-[9px] font-black block uppercase tracking-wider" 
                                [class.text-amber-500]="hero.isResting"
                                [class.text-slate-500]="!hero.isResting">
                            {{ hero.isResting ? t('💤 Resting') : 'HP: ' + hero.currentHp + '/' + getHeroMaxHp(hero) }}
                          </span>
                        </div>
                      </div>

                      <button (click)="useHealingPotion(hero.id)" 
                              [disabled]="gems() < 5 || (hero.currentHp || 0) >= getHeroMaxHp(hero)"
                              class="btn btn-outline btn-xs px-2.5 rounded-lg font-bold shrink-0">
                        {{ t('Heal (5 Gems)') }}
                      </button>
                    </div>
                  }
                }
              </div>
            </div>

          </div>

          <!-- Active Buffs Panel (Right Column) -->
          <div class="space-y-6">
            <h3 class="text-2xl font-black text-white tracking-tight">{{ t('Active Buffs') }}</h3>
            
            <div class="premium-card bg-slate-900 border-white/5 space-y-4 !p-6">
              @for (potion of activePotions(); track potion.id) {
                <div class="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span class="text-xl mr-2">{{ getPotionIcon(potion.type) }}</span>
                    <span class="font-bold text-sm text-white">{{ t(potion.name) }}</span>
                    <p class="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                      {{ potion.type === 'HASTE' ? t('Speed +50%') : potion.type === 'MIDAS' ? t('Gold x2') : t('Loot Rate x2') }}
                    </p>
                  </div>
                  <span class="text-sm font-black text-secondary tabular-nums">{{ potion.duration | number:'1.0-0' }}s</span>
                </div>
              } @empty {
                <div class="text-center py-12 text-xs text-slate-500 italic">
                  {{ t('No active elixirs. Brew potions to accelerate your progression!') }}
                </div>
              }
            </div>
          </div>

        </div>
      }

    </div>
  `,
  styles: []
})
export class WorkshopComponent implements OnDestroy {
  private readonly gameService = inject(GameService);
  public readonly trans = inject(TranslationService);

  public readonly activeTab = signal<'forge' | 'alchemy'>('forge');
  public readonly selectedItemIds = signal<string[]>([]);

  public readonly inventory = this.gameService.inventory;
  public readonly activePotions = this.gameService.activePotions;
  public readonly heroes = this.gameService.heroes;
  public readonly gameState = this.gameService.state;

  public readonly gold = computed(() => this.gameService.resources().gold);
  public readonly scrap = computed(() => this.gameService.resources().scrapMetal);
  public readonly gems = computed(() => this.gameService.resources().gems);

  // Search, Filter & Pagination Signals
  public readonly searchQuery = signal<string>('');
  public readonly selectedRarity = signal<string>('All');
  public readonly selectedSlot = signal<string>('All');
  public readonly sortBy = signal<string>('newest');
  public readonly itemsToShow = signal<number>(30);

  // Computed signal for filtered & sorted inventory
  public readonly filteredInventory = computed(() => {
    let items = [...this.inventory()];
    
    // Filter by rarity
    const rarity = this.selectedRarity();
    if (rarity !== 'All') {
      items = items.filter(i => i.rarity === rarity);
    }
    
    // Filter by slot
    const slot = this.selectedSlot();
    if (slot !== 'All') {
      items = items.filter(i => i.slot === slot);
    }
    
    // Filter by search query
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      items = items.filter(i => i.name.toLowerCase().includes(query));
    }
    
    // Sort
    const sortVal = this.sortBy();
    const RARITY_ORDER = { Legendary: 4, Epic: 3, Rare: 2, Common: 1 };
    items.sort((a, b) => {
      if (sortVal === 'rarity-desc') {
        const diff = (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
        if (diff !== 0) return diff;
        return (b.level || 1) - (a.level || 1);
      } else if (sortVal === 'rarity-asc') {
        const diff = (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0);
        if (diff !== 0) return diff;
        return (a.level || 1) - (b.level || 1);
      } else if (sortVal === 'level-desc') {
        const diff = (b.level || 1) - (a.level || 1);
        if (diff !== 0) return diff;
        return (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
      } else if (sortVal === 'level-asc') {
        const diff = (a.level || 1) - (b.level || 1);
        if (diff !== 0) return diff;
        return (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0);
      } else {
        return 0; // Default: 'newest'
      }
    });

    if (sortVal === 'newest') {
      items.reverse();
    }

    return items;
  });

  // Computed signal for currently displayed items (sliced)
  public readonly displayedInventory = computed(() => {
    return this.filteredInventory().slice(0, this.itemsToShow());
  });

  // IntersectionObserver for lazy loading
  private observer: IntersectionObserver | null = null;

  @ViewChild('scrollAnchor') set scrollAnchor(element: ElementRef | undefined) {
    if (element) {
      this.setupObserver(element.nativeElement);
    } else {
      this.cleanupObserver();
    }
  }

  private setupObserver(element: HTMLElement) {
    this.cleanupObserver();
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.itemsToShow.update(num => num + 30);
      }
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0
    });
    this.observer.observe(element);
  }

  private cleanupObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  ngOnDestroy() {
    this.cleanupObserver();
  }

  // Filter setters
  public onSearchInput(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.itemsToShow.set(30);
  }

  public selectRarity(rarity: string) {
    this.selectedRarity.set(rarity);
    this.itemsToShow.set(30);
  }

  public onSlotSelect(event: Event) {
    this.selectedSlot.set((event.target as HTMLSelectElement).value);
    this.itemsToShow.set(30);
  }

  public onSortSelect(event: Event) {
    this.sortBy.set((event.target as HTMLSelectElement).value);
    this.itemsToShow.set(30);
  }

  public t(key: string): string {
    return this.trans.t(key);
  }

  public upgradeItem(id: string) {
    this.gameService.upgradeItem(id);
  }

  public scrapItem(id: string) {
    this.gameService.scrapItem(id);
    this.selectedItemIds.update(ids => ids.filter(i => i !== id));
  }

  public toggleItemSelection(id: string) {
    this.selectedItemIds.update(ids => {
      if (ids.includes(id)) {
        return ids.filter(i => i !== id);
      } else {
        if (ids.length >= 3) {
          alert(this.t('You can only select up to 3 items to combine!'));
          return ids;
        }
        return [...ids, id];
      }
    });
  }

  public isItemSelected(id: string): boolean {
    return this.selectedItemIds().includes(id);
  }

  public getItemName(id: string): string {
    return this.inventory().find(i => i.id === id)?.name || 'Unknown Item';
  }

  public canCombineSelected(): boolean {
    const ids = this.selectedItemIds();
    if (ids.length !== 3) return false;
    const items = this.inventory().filter(i => ids.includes(i.id));
    if (items.length !== 3) return false;
    const rarity = items[0].rarity;
    if (rarity === 'Legendary') return false;
    return items.every(i => i.rarity === rarity);
  }

  public combineItems() {
    if (!this.canCombineSelected()) return;
    this.gameService.combineItems(this.selectedItemIds());
    this.selectedItemIds.set([]);
  }

  public brewPotion(type: 'HASTE' | 'MIDAS' | 'FINDER') {
    this.gameService.brewPotion(type);
  }

  public useHealingPotion(heroId: string) {
    this.gameService.useHealingPotion(heroId);
  }

  public getHeroMaxHp(hero: Hero): number {
    return GameEngine.getHeroMaxHp(this.gameState(), hero);
  }

  public getHeroImage(heroClass: string): string {
    switch(heroClass) {
      case 'Warrior': return 'assets/heroes/warrior.png';
      case 'Mage': return 'assets/heroes/mage.png';
      case 'Rogue': return 'assets/heroes/rogue.png';
      case 'Cleric': return 'assets/heroes/cleric.png';
      case 'Paladin': return 'assets/heroes/paladin.png';
      case 'Archer': return 'assets/heroes/archer.png';
      default: return 'assets/heroes/warrior.png';
    }
  }

  public getUpgradeCost(item: Equipment): { gold: number, scrap: number } {
    const rarity = item.rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary';
    const level = item.level || 1;
    const baseCosts = {
      Common: { gold: 100, scrap: 15 },
      Rare: { gold: 250, scrap: 30 },
      Epic: { gold: 1000, scrap: 100 },
      Legendary: { gold: 5000, scrap: 400 }
    };
    const cost = baseCosts[rarity] || { gold: 100, scrap: 15 };
    return {
      gold: Math.floor(cost.gold * Math.pow(1.5, level - 1)),
      scrap: Math.floor(cost.scrap * Math.pow(1.4, level - 1))
    };
  }

  public getScrapValue(rarity: string): number {
    const scrapMap = { Common: 10, Rare: 25, Epic: 75, Legendary: 250 };
    return scrapMap[rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary'] || 10;
  }

  public getItemStatText(item: Equipment): string {
    const level = item.level || 1;
    const upgradeMultiplier = 1 + (level - 1) * 0.20;
    
    if (item.bonusDamage) return `+${Math.floor(item.bonusDamage * upgradeMultiplier)} ` + this.t('Attack Power');
    if (item.bonusHp) return `+${Math.floor(item.bonusHp * upgradeMultiplier)} ` + this.t('Max HP');
    if (item.bonusGold) return `+${Math.floor(item.bonusGold * 100)}% ` + this.t('Gold Gain');
    if (item.bonusXp) return `+${Math.floor(item.bonusXp * 100)}% ` + this.t('XP Gain');
    return '';
  }

  public getRarityBadgeClass(rarity: string): string {
    switch(rarity) {
      case 'Rare': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Epic': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'Legendary': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse';
      default: return 'bg-slate-700/20 text-slate-400 border border-slate-600/30';
    }
  }

  public getPotionIcon(type: string): string {
    switch(type) {
      case 'HASTE': return '⚡';
      case 'MIDAS': return '💰';
      case 'FINDER': return '💎';
      default: return '🧪';
    }
  }
}
