import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-dungeons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 class="text-3xl font-black text-white">Ancient Dungeons</h2>
          <p class="text-slate-400 mt-1">Explore dangerous places to find riches and fame.</p>
        </div>
        <div class="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5 shadow-2xl shrink-0">
          <span class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Loot keys</span>
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
                  <p class="text-white font-black text-base mb-1">{{ dungeon.name }}</p>
                  
                  @if (totalGold() >= dungeon.requiredPower) {
                    <button (click)="unlockDungeon(dungeon.id)" 
                            class="btn btn-primary btn-sm rounded-full px-6 mt-4">
                      Unlock Dungeon
                    </button>
                  } @else {
                    <div class="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden max-w-[140px] mx-auto">
                      <div class="bg-primary h-full transition-all duration-1000" [style.width.%]="(totalGold() / dungeon.requiredPower) * 100"></div>
                    </div>
                    <p class="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{{ dungeon.requiredPower | number }} Gold Needed</p>
                  }
                </div>
              }

              <div class="flex justify-between items-start">
                <h3 class="text-lg font-bold text-white truncate pr-2">{{ dungeon.name }}</h3>
                <span class="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-accent font-black uppercase tracking-tighter shrink-0">x{{ dungeon.difficultyMultiplier | number }} Diff</span>
              </div>

              <div class="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
                <div>
                  <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Rewards</p>
                  <p class="text-xs font-bold text-yellow-500">💰 {{ dungeon.goldReward | number }}</p>
                  <p class="text-xs font-bold text-blue-400">✨ {{ dungeon.xpReward | number }}</p>
                  @if (dungeon.isRaid) {
                    <p class="text-xs font-bold text-emerald-400">💎 Gems & Essence</p>
                  }
                </div>
                <div>
                  <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Danger & Stats</p>
                  <p class="text-xs font-bold text-slate-300">⏱️ {{ dungeon.duration }}s</p>
                  <p class="text-xs font-bold text-slate-400">💔 {{ dungeon.damagePerSecond }} DPS</p>
                  <p class="text-xs font-bold text-slate-500 italic">{{ dungeon.dropChance * 100 }}% Loot</p>
                </div>
              </div>

              <div class="pt-2 mt-auto">
                <p class="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Active Heroes</p>
                <div class="flex flex-wrap gap-2">
                  @for (hero of getHeroesInDungeon(dungeon.id); track hero.id) {
                    <div class="w-8 h-8 rounded-lg overflow-hidden border border-white/10 tooltip shadow-lg" 
                         [attr.data-tip]="hero.name">
                      <img [src]="getHeroImage(hero.heroClass)" class="w-full h-full object-cover">
                    </div>
                  } @empty {
                    <p class="text-[10px] italic text-slate-600">None assigned</p>
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
  
  public readonly dungeons = this.gameService.dungeons;
  public readonly heroes = this.gameService.heroes;
  public readonly keys = computed(() => this.gameService.resources().dungeonKeys);
  public readonly totalGold = computed(() => this.gameService.stats().totalGoldEarned);

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
}
