import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-dungeons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 class="text-3xl font-black text-white">{{ t('Ancient Dungeons') }}</h2>
          <p class="text-slate-400 mt-1">{{ t('Explore dangerous places to find riches and fame.') }}</p>
        </div>
        <div class="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5 shadow-2xl shrink-0">
          <span class="text-slate-500 text-[10px] font-black uppercase tracking-widest">{{ t('Loot keys') }}</span>
          <span class="text-amber-500 font-black text-xl">{{ keys() }}/10 🔑</span>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (dungeon of dungeons(); track dungeon.id) {
          <div class="premium-card relative overflow-hidden flex flex-col !p-0 group" 
               [class.opacity-60]="!dungeon.isUnlocked"
               [class.border-amber-500\/30]="dungeon.isRaid">
            
            <!-- Dungeon Header Image -->
            <div class="h-28 w-full relative overflow-hidden shrink-0">
              <img [src]="getDungeonImage(dungeon.id)" class="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              
              <!-- Modifier Tag -->
              @if (dungeon.modifierType && dungeon.modifierType !== 'NONE') {
                <div [class]="getModifierBadgeClass(dungeon.modifierType)"
                     class="absolute top-3 left-3 font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded shadow-lg border">
                  {{ getModifierName(dungeon.modifierType) }} ({{ dungeon.modifierRemainingTime | number:'1.0-0' }}s)
                </div>
              }

              <!-- Raid Tag -->
              @if (dungeon.isRaid) {
                <div class="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                  Raid ({{ dungeon.keyCost }} 🔑)
                </div>
              }
            </div>

            <div class="p-5 space-y-4 relative flex-1 flex flex-col">
              @if (!dungeon.isUnlocked) {
                <div class="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6 text-center">
                  <span class="text-3xl mb-3">🏚️</span>
                  <p class="text-white font-black text-base mb-1">{{ t(dungeon.name) }}</p>
                  
                  @if (totalGold() >= dungeon.requiredPower) {
                    <button (click)="unlockDungeon(dungeon.id)" 
                            class="btn btn-primary btn-sm rounded-full px-6 mt-4">
                      {{ t('Unlock Dungeon') }}
                    </button>
                  } @else {
                    <div class="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden max-w-[140px] mx-auto">
                      <div class="bg-primary h-full transition-all duration-1000" [style.width.%]="(totalGold() / dungeon.requiredPower) * 100"></div>
                    </div>
                    <p class="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{{ dungeon.requiredPower | number }} {{ t('Gold Needed') }}</p>
                  }
                </div>
              }

              <div class="flex justify-between items-start">
                <h3 class="text-lg font-bold text-white truncate pr-2">{{ t(dungeon.name) }}</h3>
                <span class="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-accent font-black uppercase tracking-tighter shrink-0">x{{ dungeon.difficultyMultiplier | number }} Diff</span>
              </div>

              <div class="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
                <div>
                  <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{{ t('Rewards') }}</p>
                  <p class="text-xs font-bold text-yellow-500">💰 {{ dungeon.goldReward | number }}</p>
                  <p class="text-xs font-bold text-blue-400">✨ {{ dungeon.xpReward | number }}</p>
                  @if (dungeon.isRaid) {
                    <p class="text-xs font-bold text-emerald-400">💎 {{ t('Gems & Essence') }}</p>
                  }
                </div>
                <div>
                  <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{{ t('Danger & Stats') }}</p>
                  <p class="text-xs font-bold text-slate-300">⏱️ {{ dungeon.duration }}s</p>
                  <p class="text-xs font-bold text-slate-400">💔 {{ dungeon.damagePerSecond }} DPS</p>
                  <p class="text-xs font-bold text-slate-500 italic">{{ dungeon.dropChance * 100 }}% {{ t('Loot') }}</p>
                </div>
              </div>

              <div class="pt-2 mt-auto">
                <p class="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">{{ t('Active Heroes') }}</p>
                <div class="flex flex-wrap gap-2">
                  @for (hero of getHeroesInDungeon(dungeon.id); track hero.id) {
                    <div class="relative group/hero w-8 h-8 rounded-lg overflow-hidden border border-white/10 tooltip shadow-lg cursor-pointer" 
                         [attr.data-tip]="t('Click to recall') + ' ' + hero.name"
                         (click)="recallHero(hero.id)">
                      <img [src]="getHeroImage(hero.heroClass)" class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity">
                        <span class="text-white text-[10px] font-black font-sans">✕</span>
                      </div>
                    </div>
                  } @empty {
                    <p class="text-[10px] italic text-slate-600">{{ t('None assigned') }}</p>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class DungeonsComponent {
  private readonly gameService = inject(GameService);
  public readonly trans = inject(TranslationService);
  
  public readonly dungeons = this.gameService.dungeons;
  public readonly heroes = this.gameService.heroes;
  public readonly keys = computed(() => this.gameService.resources().dungeonKeys);
  public readonly totalGold = computed(() => this.gameService.stats().totalGoldEarned);

  public t(key: string): string {
    return this.trans.t(key);
  }

  public getHeroesInDungeon(dungeonId: string) {
    return this.heroes().filter(h => h.currentDungeonId === dungeonId && !h.isResting);
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

  public getDungeonImage(id: string): string {
    switch(id) {
      case 'd1': return 'assets/dungeons/goblin_cave.png';
      case 'd2': return 'assets/dungeons/haunted_crypt.png';
      case 'd_raid1': return 'assets/dungeons/undead_catacombs.png';
      case 'd3': return 'assets/dungeons/orc_fortress.png';
      case 'd4': return 'assets/dungeons/dragon_lair.png';
      case 'd_raid2': return 'assets/dungeons/volcanic_caldera.png';
      case 'd5': return 'assets/dungeons/abyssal_gate.png';
      default: return 'assets/dungeons/goblin_cave.png';
    }
  }

  public unlockDungeon(id: string) {
    this.gameService.unlockDungeon(id);
  }

  public getModifierName(type: string): string {
    switch(type) {
      case 'GOBLIN_SWARM': return this.t('GOBLIN_SWARM');
      case 'TOXIC_MIST': return this.t('TOXIC_MIST');
      case 'TREASURE_GOBLIN': return this.t('TREASURE_GOBLIN');
      case 'ANCIENT_BLESSING': return this.t('ANCIENT_BLESSING');
      default: return this.t('NONE');
    }
  }

  public getModifierBadgeClass(type: string): string {
    switch(type) {
      case 'GOBLIN_SWARM': return 'bg-yellow-500/25 text-yellow-400 border-yellow-500/30';
      case 'TOXIC_MIST': return 'bg-red-500/25 text-red-400 border-red-500/30';
      case 'TREASURE_GOBLIN': return 'bg-emerald-500/25 text-emerald-400 border-emerald-500/30 animate-pulse';
      case 'ANCIENT_BLESSING': return 'bg-blue-500/25 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-700/20 text-slate-400 border-slate-600/30';
    }
  }

  public recallHero(heroId: string): void {
    this.gameService.assignHeroToDungeon(heroId, undefined);
  }
}
