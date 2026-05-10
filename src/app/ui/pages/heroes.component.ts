import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Hero } from '../../core/interfaces/game-state.interface';
import { GameEngine } from '../../engine/game-engine';

@Component({
  selector: 'app-heroes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-10 animate-in slide-in-from-bottom-6 duration-700 pb-20">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="text-4xl font-black text-white tracking-tight">Heroes Guild</h2>
          <p class="text-slate-400 mt-2 text-lg">Hire and train elite champions to conquer the unknown.</p>
        </div>
        <div class="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5 shadow-2xl">
          <span class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Guild Funds</span>
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
                <h3 class="text-xl font-black text-white mb-1">{{ hero.heroClass }}</h3>
                <p class="text-xs text-slate-400 mb-6 max-w-[180px]">Join the guild for {{ hero.upgradeCost | number }} Gold.</p>
                <button (click)="unlockHero(hero.id)" 
                        [disabled]="gold() < hero.upgradeCost"
                        class="btn btn-primary btn-md rounded-full px-8 shadow-xl shadow-primary/20">
                  Hire Hero
                </button>
              </div>
            }

            <!-- Hero Portrait & Equipment -->
            <div class="flex flex-col gap-4 shrink-0 mx-auto sm:mx-0">
              <div class="relative">
                <div class="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-white/10 group-hover:border-primary/40 transition-all duration-500">
                  <img [src]="getHeroImage(hero.heroClass)" class="w-full h-full object-cover" [alt]="hero.name">
                </div>
                <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-secondary to-accent rounded-full text-xs font-black text-white shadow-xl border border-white/20 whitespace-nowrap z-10">
                  Level {{ hero.level }}
                </div>
              </div>

              <!-- Equipment Slots -->
              <div class="flex justify-center gap-2">
                <div class="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-xs text-slate-600 hover:border-primary/30 cursor-help" title="Weapon Slot">
                  {{ hero.equipment?.weapon ? '⚔️' : '🔘' }}
                </div>
                <div class="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-xs text-slate-600 hover:border-primary/30 cursor-help" title="Armor Slot">
                  {{ hero.equipment?.armor ? '🛡️' : '🔘' }}
                </div>
                <div class="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-xs text-slate-600 hover:border-primary/30 cursor-help" title="Accessory Slot">
                  {{ hero.equipment?.accessory ? '💍' : '🔘' }}
                </div>
              </div>
            </div>

            <!-- Hero Details -->
            <div class="flex-1 flex flex-col min-w-0">
              <div class="flex justify-between items-start mb-6">
                <div class="min-w-0">
                  <h3 class="text-2xl font-black text-white group-hover:text-primary transition-colors truncate">{{ hero.name }}</h3>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ hero.heroClass }}</span>
                    <span class="text-[10px] font-bold" [class.text-green-500]="hero.currentDungeonId" [class.text-slate-600]="!hero.currentDungeonId">
                      {{ hero.currentDungeonId ? '• DEPLOYED' : '• IDLE' }}
                    </span>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">Status</p>
                  <p class="text-sm font-black text-slate-300 truncate max-w-[150px]">
                    {{ hero.currentDungeonId ? getDungeonName(hero.currentDungeonId) : 'At Guild Hall' }}
                  </p>
                </div>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg">⚔️</div>
                  <div>
                    <p class="text-[10px] font-black text-slate-600 uppercase leading-none mb-1">Total Power</p>
                    <p class="text-lg font-black text-white leading-none">{{ getEffectiveDamage(hero) | number }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div class="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-lg">⏱️</div>
                  <div>
                    <p class="text-[10px] font-black text-slate-600 uppercase leading-none mb-1">Attack Speed</p>
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
                    <span class="text-sm font-black text-white">TRAIN HERO</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-[9px] font-black text-slate-500 uppercase group-hover:text-white/60">Cost</span>
                    <span class="text-sm font-black text-yellow-500 group-hover:text-white tabular-nums">
                      {{ calculateUpgradeCost(hero) | number:'1.0-0' }}
                    </span>
                  </div>
                </button>
                
                <div class="dropdown dropdown-top dropdown-end">
                  <label tabindex="0" class="flex items-center justify-center gap-3 px-6 py-3.5 bg-secondary/10 hover:bg-secondary transition-all duration-300 rounded-2xl border border-secondary/30 text-white font-black cursor-pointer group/deploy min-w-[140px]">
                    <span class="text-xl group-hover/deploy:rotate-12 transition-transform">🚩</span>
                    <span class="text-sm uppercase">DEPLOY</span>
                  </label>
                  <ul tabindex="0" class="dropdown-content z-[30] menu p-3 shadow-2xl bg-slate-950/98 backdrop-blur-2xl rounded-3xl w-72 border border-white/10 mb-4 space-y-2">
                    <li>
                      <a (click)="assignToDungeon(hero.id, undefined)" class="flex items-center gap-3 text-error text-xs font-black hover:bg-error/10 p-3 rounded-xl transition-all">
                        <span>🛑</span> Recall Hero
                      </a>
                    </li>
                    <div class="h-px bg-white/5 my-1 mx-2"></div>
                    <li class="menu-title px-4 py-2">
                      <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Dungeons</span>
                    </li>
                    @for (dungeon of dungeons(); track dungeon.id) {
                      @if (dungeon.isUnlocked) {
                        <li>
                          <a (click)="assignToDungeon(hero.id, dungeon.id)" 
                             [class.bg-primary/10]="hero.currentDungeonId === dungeon.id"
                             class="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-all">
                            <div class="flex flex-col">
                              <span class="font-black text-sm text-slate-200">{{ dungeon.name }}</span>
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
  `,
  styles: [`
    .locked-hero {
      @apply grayscale opacity-80;
    }
  `]
})
export class HeroesComponent {
  private readonly gameService = inject(GameService);
  
  public readonly heroes = this.gameService.heroes;
  public readonly dungeons = this.gameService.dungeons;
  public readonly gold = computed(() => this.gameService.resources().gold);
  public readonly gameState = this.gameService.state;

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
    return this.dungeons().find(d => d.id === id)?.name || 'Unknown';
  }

  public getEffectiveDamage(hero: Hero): number {
    return GameEngine.getHeroEffectiveDamage(this.gameState(), hero);
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
}
