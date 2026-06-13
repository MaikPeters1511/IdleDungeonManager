import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Hero } from '../../core/interfaces/game-state.interface';
import { GameEngine } from '../../engine/game-engine';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-heroes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-10 animate-in slide-in-from-bottom-6 duration-700 pb-20">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="text-4xl font-black text-white tracking-tight">{{ t('Heroes Guild') }}</h2>
          <p class="text-slate-400 mt-2 text-lg">{{ t('Hire and train elite champions to conquer the unknown.') }}</p>
        </div>
        <div class="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5 shadow-2xl">
          <span class="text-slate-500 text-[10px] font-black uppercase tracking-widest">{{ t('Guild Funds') }}</span>
          <span class="text-yellow-500 font-black text-xl">{{ gold() | number:'1.0-0' }} 💰</span>
        </div>
      </header>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        @for (hero of heroes(); track hero.id) {
          <div class="premium-card group relative flex flex-col sm:flex-row gap-8 !p-6" 
               [class.locked-hero]="!hero.isUnlocked">
            
            @if (!hero.isUnlocked) {
              <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-20 p-8 text-center border border-white/10 rounded-2xl overflow-hidden">
                <div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4 shadow-2xl">🔒</div>
                <h3 class="text-xl font-black text-white mb-1">{{ t(hero.heroClass) }}</h3>
                <p class="text-xs text-slate-400 mb-6 max-w-[180px]">{{ t('Join the guild for') }} {{ hero.upgradeCost | number }} Gold.</p>
                <button (click)="unlockHero(hero.id)" 
                        [disabled]="gold() < hero.upgradeCost"
                        class="btn btn-primary btn-md rounded-full px-8 shadow-xl shadow-primary/20 font-bold">
                  {{ t('Hire Hero') }}
                </button>
              </div>
            }

            <!-- Hero Portrait & Equipment -->
            <div class="flex flex-col gap-4 shrink-0 mx-auto sm:mx-0">
              <div class="relative">
                <div class="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-white/10 group-hover:border-primary/40 transition-all duration-500">
                  <img [src]="getHeroImage(hero.heroClass)" class="w-full h-full object-cover" [alt]="hero.name" [class.grayscale]="hero.isResting">
                </div>
                <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-secondary to-accent rounded-full text-xs font-black text-white shadow-xl border border-white/20 whitespace-nowrap z-10">
                  {{ t('Level') }} {{ hero.level }}
                </div>
              </div>

              <!-- HP Display -->
              <div class="space-y-1.5 px-1 mt-2">
                <div class="flex justify-between text-[10px] font-black text-slate-400">
                  <span>{{ t('HP STATE') }}</span>
                  <span class="tabular-nums">{{ (hero.currentHp || 0) | number:'1.0-0' }} / {{ getHeroMaxHp(hero) | number:'1.0-0' }}</span>
                </div>
                <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                  <div [class]="getHpBarClass(hero)"
                       [style.width.%]="getHpPercent(hero)"></div>
                </div>
              </div>

              <!-- Equipment Slots -->
              <div class="flex justify-center gap-3 mt-1">
                <button (click)="openEquipModal(hero.id, 'Weapon')" 
                        [class]="getEquipmentSlotClass(hero.equipment?.weapon)"
                        [title]="hero.equipment?.weapon ? hero.equipment?.weapon?.name + ' (Weapon)' : t('Equip Weapon')">
                  {{ hero.equipment?.weapon ? '⚔️' : '🔘' }}
                </button>
                <button (click)="openEquipModal(hero.id, 'Armor')" 
                        [class]="getEquipmentSlotClass(hero.equipment?.armor)"
                        [title]="hero.equipment?.armor ? hero.equipment?.armor?.name + ' (Armor)' : t('Equip Armor')">
                  {{ hero.equipment?.armor ? '🛡️' : '🔘' }}
                </button>
                <button (click)="openEquipModal(hero.id, 'Accessory')" 
                        [class]="getEquipmentSlotClass(hero.equipment?.accessory)"
                        [title]="hero.equipment?.accessory ? hero.equipment?.accessory?.name + ' (Accessory)' : t('Equip Accessory')">
                  {{ hero.equipment?.accessory ? '💍' : '🔘' }}
                </button>
              </div>
            </div>

            <!-- Hero Details -->
            <div class="flex-1 flex flex-col min-w-0">
              <div class="flex justify-between items-start mb-6">
                <div class="min-w-0">
                  <h3 class="text-2xl font-black text-white group-hover:text-primary transition-colors truncate">{{ hero.name }}</h3>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ t(hero.heroClass) }}</span>
                    <span class="text-[10px] font-bold" 
                          [class.text-green-500]="hero.currentDungeonId && !hero.isResting" 
                          [class.text-amber-500]="hero.isResting"
                          [class.text-slate-600]="!hero.currentDungeonId && !hero.isResting">
                      {{ hero.isResting ? t('• RESTING') : (hero.currentDungeonId ? t('• DEPLOYED') : t('• IDLE')) }}
                    </span>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">{{ t('Status') }}</p>
                  <p class="text-sm font-black text-slate-300 truncate max-w-[150px]">
                    @if (hero.isResting) {
                      {{ t('Recovering HP') }}
                    } @else {
                      {{ hero.currentDungeonId ? getDungeonName(hero.currentDungeonId) : t('At Guild Hall') }}
                    }
                  </p>
                </div>
              </div>

              <!-- Class Skill Badge -->
              <div class="mb-4 p-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-xs shrink-0">
                <div class="flex items-center gap-1.5 font-black text-secondary uppercase text-[9px] tracking-wider mb-1">
                  <span>✨ {{ t('Class Skill:') }}</span>
                  <span>{{ getHeroSkillName(hero.heroClass) }}</span>
                </div>
                <p class="text-slate-400 leading-normal text-[11px]">{{ getHeroSkillDescription(hero.heroClass) }}</p>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg">⚔️</div>
                  <div>
                    <p class="text-[10px] font-black text-slate-600 uppercase leading-none mb-1">{{ t('Total Power') }}</p>
                    <p class="text-lg font-black text-white leading-none">{{ getEffectiveDamage(hero) | number }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div class="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-lg">⏱️</div>
                  <div>
                    <p class="text-[10px] font-black text-slate-600 uppercase leading-none mb-1">{{ t('Attack Speed') }}</p>
                    <p class="text-lg font-black text-white leading-none">{{ hero.attackSpeed }}s</p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-wrap gap-3 mt-auto">
                <button (click)="upgradeHero(hero.id)" 
                        [disabled]="gold() < calculateUpgradeCost(hero)"
                        class="flex-grow group/btn relative overflow-hidden flex items-center justify-between px-4 py-3.5 bg-white/5 hover:bg-primary transition-all duration-300 rounded-2xl border border-white/5 hover:border-primary disabled:opacity-50">
                  <div class="flex items-center gap-2">
                    <span class="text-lg group-hover:scale-110 transition-transform">⚡</span>
                    <span class="text-sm font-black text-white">{{ t('TRAIN HERO') }}</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-[9px] font-black text-slate-500 uppercase group-hover:text-white/60">{{ t('Cost') }}</span>
                    <span class="text-sm font-black text-yellow-500 group-hover:text-white tabular-nums">
                      {{ calculateUpgradeCost(hero) | number:'1.0-0' }}
                    </span>
                  </div>
                </button>
                
                <div class="dropdown dropdown-top dropdown-end">
                  <label tabindex="0" 
                         [class.opacity-50]="hero.isResting"
                         [attr.disabled]="hero.isResting ? true : null"
                         class="flex items-center justify-center gap-3 px-6 py-3.5 bg-secondary/10 hover:bg-secondary transition-all duration-300 rounded-2xl border border-secondary/30 text-white font-black cursor-pointer group/deploy min-w-[140px]">
                    <span class="text-xl group-hover/deploy:rotate-12 transition-transform">🚩</span>
                    <span class="text-sm uppercase">{{ t('DEPLOY') }}</span>
                  </label>
                  <ul tabindex="0" class="dropdown-content z-[30] menu p-3 shadow-2xl bg-slate-950/98 backdrop-blur-2xl rounded-3xl w-72 border border-white/10 mb-4 space-y-2">
                    <li>
                      <a (click)="assignToDungeon(hero.id, undefined)" class="flex items-center gap-3 text-error text-xs font-black hover:bg-error/10 p-3 rounded-xl transition-all">
                        <span>🛑</span> {{ t('Recall Hero') }}
                      </a>
                    </li>
                    <div class="h-px bg-white/5 my-1 mx-2"></div>
                    <li class="menu-title px-4 py-2">
                      <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ t('Available Dungeons') }}</span>
                    </li>
                    @for (dungeon of dungeons(); track dungeon.id) {
                      @if (dungeon.isUnlocked) {
                        <li>
                          <a (click)="assignToDungeon(hero.id, dungeon.id)" 
                             [class.bg-primary/10]="hero.currentDungeonId === dungeon.id"
                             class="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-all">
                             <div class="flex flex-col">
                               <div class="flex items-center gap-1.5">
                                 <span class="font-black text-sm text-slate-200">{{ t(dungeon.name) }}</span>
                                 @if (dungeon.isRaid) {
                                   <span class="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded uppercase font-bold">Raid</span>
                                 }
                               </div>
                               <span class="text-[9px] font-bold text-slate-500 uppercase">Est: {{ getDungeonDuration(dungeon, hero) | number:'1.1-1' }}s</span>
                             </div>
                            <span class="text-lg">🏚️</span>
                          </a>
                        </li>
                      }
                    }
                  </ul>
                </div>
              </div>
            </div>

            <!-- XP Progress Bar -->
            <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800/50 rounded-b-2xl overflow-hidden">
              <div class="bg-gradient-to-r from-primary via-secondary to-accent h-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                   [style.width.%]="getXpPercent(hero)"></div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Equip Equipment Modal -->
    @if (selectedEquipSlot(); as selected) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div (click)="closeEquipModal()" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        
        <!-- Modal Card -->
        <div class="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-xl font-black text-white">{{ t('Equip ' + selected.slot) }}</h3>
              <p class="text-xs text-slate-400 mt-1">Select an item to equip on {{ getHeroName(selected.heroId) }}.</p>
            </div>
            <button (click)="closeEquipModal()" class="btn btn-circle btn-ghost btn-sm text-slate-400 hover:text-white">✕</button>
          </div>

          <!-- Currently Equipped -->
          @if (getEquippedItem(selected.heroId, selected.slot); as equipped) {
            <div class="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between mb-6">
              <div>
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">{{ t('Currently Equipped') }}</p>
                <p class="text-sm font-black text-white mt-1">{{ equipped.name }}</p>
                <p class="text-xs text-secondary mt-0.5">{{ getEquipItemStatText(equipped) }}</p>
              </div>
              <button (click)="unequipItem(selected.heroId, selected.slot)" class="btn btn-error btn-xs rounded-lg px-3">
                {{ t('Unequip') }}
              </button>
            </div>
          } @else {
            <div class="p-4 bg-slate-950/40 rounded-2xl border border-white/5 text-center text-xs text-slate-500 mb-6 italic">
              {{ t('No ' + selected.slot.toLowerCase() + ' currently equipped.') }}
            </div>
          }

          <!-- Inventory List -->
          <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{{ t('Available in Armory') }}</p>
            
            @for (item of getMatchingInventory(selected.slot); track item.id) {
              <div class="p-3 bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 hover:border-primary/20 rounded-xl flex items-center justify-between transition-all group/item">
                <div>
                  <span [class]="getRarityBadgeClass(item.rarity)" class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mb-1 inline-block">
                    {{ t(item.rarity) }}
                  </span>
                  <p class="text-sm font-bold text-white">{{ item.name }}</p>
                  <p class="text-xs text-primary mt-0.5">{{ getEquipItemStatText(item) }}</p>
                </div>
                
                <button (click)="equipItem(selected.heroId, item.id, selected.slot)" class="btn btn-primary btn-xs rounded-lg px-4 font-bold">
                  {{ t('Equip') }}
                </button>
              </div>
            } @empty {
              <div class="text-center py-10 border border-dashed border-white/5 rounded-xl text-xs text-slate-500 italic">
                {{ t('No matching ' + selected.slot.toLowerCase() + 's in your armory. Go clear dungeons to find loot!') }}
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .locked-hero {
      @apply grayscale opacity-80;
    }
  `]
})
export class HeroesComponent {
  private readonly gameService = inject(GameService);
  public readonly trans = inject(TranslationService);
  
  public readonly selectedEquipSlot = signal<{ heroId: string, slot: 'Weapon' | 'Armor' | 'Accessory' } | null>(null);

  public readonly heroes = this.gameService.heroes;
  public readonly dungeons = this.gameService.dungeons;
  public readonly gold = computed(() => this.gameService.resources().gold);
  public readonly gameState = this.gameService.state;

  public t(key: string): string {
    return this.trans.t(key);
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

  public getDungeonName(id: string): string {
    const name = this.dungeons().find(d => d.id === id)?.name || 'Unknown';
    return this.t(name);
  }

  public getEffectiveDamage(hero: Hero): number {
    return GameEngine.getHeroEffectiveDamage(this.gameState(), hero);
  }

  public getHeroMaxHp(hero: Hero): number {
    return GameEngine.getHeroMaxHp(this.gameState(), hero);
  }

  public getHpPercent(hero: Hero): number {
    const max = this.getHeroMaxHp(hero);
    return Math.min(100, ((hero.currentHp || 0) / max) * 100);
  }

  public getHpBarClass(hero: Hero): string {
    if (hero.isResting) return 'bg-amber-500 h-full transition-all duration-300';
    const percent = this.getHpPercent(hero);
    if (percent < 30) return 'bg-red-500 h-full transition-all duration-300';
    if (percent < 70) return 'bg-yellow-500 h-full transition-all duration-300';
    return 'bg-green-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
  }

  public getEquipmentSlotClass(item: any): string {
    const base = 'w-10 h-10 rounded-xl border flex items-center justify-center text-xs transition-all duration-200 ';
    if (!item) return base + 'bg-slate-800/50 border-white/5 text-slate-600 hover:border-primary/30 hover:bg-slate-800';
    
    switch(item.rarity) {
      case 'Rare': return base + 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20';
      case 'Epic': return base + 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20';
      case 'Legendary': return base + 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20';
      default: return base + 'bg-slate-700/20 border-slate-600/30 text-slate-300 hover:bg-slate-700/35';
    }
  }

  public openEquipModal(heroId: string, slot: 'Weapon' | 'Armor' | 'Accessory') {
    this.selectedEquipSlot.set({ heroId, slot });
  }

  public closeEquipModal() {
    this.selectedEquipSlot.set(null);
  }

  public getHeroName(heroId: string): string {
    return this.heroes().find(h => h.id === heroId)?.name || '';
  }

  public getEquippedItem(heroId: string, slot: 'Weapon' | 'Armor' | 'Accessory'): any {
    const hero = this.heroes().find(h => h.id === heroId);
    if (!hero || !hero.equipment) return null;
    return hero.equipment[slot.toLowerCase() as 'weapon' | 'armor' | 'accessory'];
  }

  public getMatchingInventory(slot: 'Weapon' | 'Armor' | 'Accessory'): any[] {
    return this.gameService.inventory().filter(item => item.slot === slot);
  }

  public equipItem(heroId: string, itemId: string, slot: 'Weapon' | 'Armor' | 'Accessory') {
    this.gameService.equipItem(heroId, itemId, slot);
    this.closeEquipModal();
  }

  public unequipItem(heroId: string, slotStr: 'Weapon' | 'Armor' | 'Accessory') {
    const slot = slotStr.toLowerCase() as 'weapon' | 'armor' | 'accessory';
    this.gameService.unequipItem(heroId, slot);
    this.closeEquipModal();
  }

  public getEquipItemStatText(item: any): string {
    if (item.bonusDamage) return `+${item.bonusDamage} ` + this.t('Attack Power');
    if (item.bonusHp) return `+${item.bonusHp} ` + this.t('Max HP');
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

  public getDungeonDuration(dungeon: any, hero: Hero): number {
    return GameEngine.getEffectiveDungeonDuration(this.gameState(), dungeon, hero);
  }

  public calculateUpgradeCost(hero: Hero): number {
    return GameEngine.calculateHeroUpgradeCost(hero);
  }

  public getXpPercent(hero: Hero): number {
    const needed = GameEngine.calculateXpToNextLevel(hero.level);
    return (hero.xp / needed) * 100;
  }

  public upgradeHero(id: string) {
    this.gameService.upgradeHero(id);
  }

  public unlockHero(id: string) {
    this.gameService.unlockHero(id);
  }

  public assignToDungeon(heroId: string, dungeonId: string | undefined) {
    this.gameService.assignHeroToDungeon(heroId, dungeonId);
  }

  public getHeroSkillName(heroClass: string): string {
    let raw = '';
    switch(heroClass) {
      case 'Warrior': raw = 'Taunt (🛡️ Spott)'; break;
      case 'Mage': raw = 'Meteor Strike (☄️ Meteor)'; break;
      case 'Rogue': raw = 'Assassinate (🗡️ Meucheln)'; break;
      case 'Cleric': raw = 'Resurrection (👼 Wiederbelebung)'; break;
      case 'Paladin': raw = 'Aura of Protection (🛡️ Schutz-Aura)'; break;
      case 'Archer': raw = 'Critical Strike (🎯 Volltreffer)'; break;
      default: raw = 'Gilde-Training';
    }
    return this.t(raw);
  }

  public getHeroSkillDescription(heroClass: string): string {
    let raw = '';
    switch(heroClass) {
      case 'Warrior': raw = 'Alaric nimmt allen Schaden von Mitstreitern im selben Dungeon auf sich (reduziert um 20% Block).'; break;
      case 'Mage': raw = 'Zephyr hat eine Chance von 15% pro Sekunde, den Dungeon-Fortschritt um 1.5 Sekunden zu beschleunigen.'; break;
      case 'Rogue': raw = 'Shadow hat eine Chance von 3% pro Sekunde, den Dungeon-Lauf sofort erfolgreich abzuschließen.'; break;
      case 'Cleric': raw = 'Elena rettet gefallene Helden im Dungeon einmal pro Minute vor dem K.O. und belebt sie mit 30% HP wieder.'; break;
      case 'Paladin': raw = 'Valerius schützt alle Gefährten im selben Dungeon und verringert deren erlittenen Schaden permanent um 25%.'; break;
      case 'Archer': raw = 'Liraels präziser Bogenkampf verringert die Durchlaufzeit ihrer Dungeons dauerhaft um 25%.'; break;
      default: raw = 'Gibt passive Boni im Kampf.';
    }
    return this.t(raw);
  }
}
