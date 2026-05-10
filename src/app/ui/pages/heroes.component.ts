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
    <div class="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
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

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        @for (hero of heroes(); track hero.id) {
          <div class="premium-card group relative flex flex-col sm:flex-row gap-6 !p-5" 
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

            <!-- Hero Portrait -->
            <div class="relative shrink-0 mx-auto sm:mx-0">
              <div class="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-white/10 group-hover:border-primary/40 transition-all duration-500">
                <img [src]="getHeroImage(hero.heroClass)" class="w-full h-full object-cover" [alt]="hero.name">
              </div>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-secondary to-accent rounded-full text-[10px] font-black text-white shadow-xl border border-white/20 whitespace-nowrap z-10">
                Lvl {{ hero.level }}
              </div>
            </div>

            <!-- Hero Details -->
            <div class="flex-1 flex flex-col min-w-0">
              <div class="flex justify-between items-start mb-4">
                <div class="min-w-0">
                  <h3 class="text-xl font-black text-white group-hover:text-primary transition-colors truncate">{{ hero.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">{{ hero.heroClass }}</span>
                    <span class="text-[10px] font-bold" [class.text-green-500]="hero.currentDungeonId" [class.text-slate-600]="!hero.currentDungeonId">
                      {{ hero.currentDungeonId ? '• ACTIVE' : '• IDLE' }}
                    </span>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Task</p>
                  <p class="text-xs font-bold text-slate-300 truncate max-w-[120px]">
                    {{ hero.currentDungeonId ? getDungeonName(hero.currentDungeonId) : 'Resting' }}
                  </p>
                </div>
              </div>

              <!-- Compact Stats -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs">⚔️</div>
                  <div>
                    <p class="text-[9px] font-black text-slate-600 uppercase leading-none mb-1">Power</p>
                    <p class="text-sm font-bold text-slate-200 leading-none">{{ hero.baseDamage | number }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-xs">⏱️</div>
                  <div>
                    <p class="text-[9px] font-black text-slate-600 uppercase leading-none mb-1">Speed</p>
                    <p class="text-sm font-bold text-slate-200 leading-none">{{ hero.attackSpeed }}s</p>
                  </div>
                </div>
              </div>

              <!-- Actions Area -->
              <div class="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
                <button (click)="upgradeHero(hero.id)" 
                        [disabled]="gold() < calculateUpgradeCost(hero)"
                        class="flex-grow group/btn relative overflow-hidden flex items-center justify-between px-3 py-2.5 bg-white/5 hover:bg-primary transition-all duration-300 rounded-xl border border-white/5 hover:border-primary disabled:opacity-50">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">⚡</span>
                    <span class="text-xs font-bold text-white">Train</span>
                  </div>
                  <span class="text-xs font-black text-yellow-500 group-hover:text-white tabular-nums">
                    {{ calculateUpgradeCost(hero) | number:'1.0-0' }}
                  </span>
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]"></div>
                </button>
                
                <div class="dropdown dropdown-top dropdown-end flex-grow">
                  <label tabindex="0" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary/10 hover:bg-secondary transition-all duration-300 rounded-xl border border-secondary/30 text-white font-black cursor-pointer group/deploy">
                    <span class="text-sm group-hover/deploy:rotate-12 transition-transform">🚩</span>
                    <span class="text-xs uppercase">Deploy</span>
                  </label>
                  <ul tabindex="0" class="dropdown-content z-[30] menu p-2 shadow-2xl bg-slate-950/95 backdrop-blur-2xl rounded-2xl w-64 border border-white/10 mb-4 space-y-1">
                    <li>
                      <a (click)="assignToDungeon(hero.id, undefined)" class="flex items-center gap-3 text-error text-xs font-bold hover:bg-error/10 py-2.5 rounded-lg transition-all">
                        <span>🛑</span> Recall Hero
                      </a>
                    </li>
                    <div class="h-px bg-white/5 my-1 mx-2"></div>
                    <li class="menu-title px-4 py-1.5">
                      <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Dungeon</span>
                    </li>
                    @for (dungeon of dungeons(); track dungeon.id) {
                      @if (dungeon.isUnlocked) {
                        <li>
                          <a (click)="assignToDungeon(hero.id, dungeon.id)" 
                             [class.bg-primary/10]="hero.currentDungeonId === dungeon.id"
                             class="flex justify-between items-center py-2.5 px-4 rounded-lg hover:bg-white/5 transition-all text-xs">
                            <span class="font-bold text-slate-200">{{ dungeon.name }}</span>
                            <span class="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded-full text-slate-500">{{ dungeon.duration }}s</span>
                          </a>
                        </li>
                      }
                    }
                  </ul>
                </div>
              </div>
            </div>

            <!-- XP Progress Bar -->
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/50 rounded-b-2xl overflow-hidden">
              <div class="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500" 
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
    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }
  `]
})
export class HeroesComponent {
  private readonly gameService = inject(GameService);
  
  public readonly heroes = this.gameService.heroes;
  public readonly dungeons = this.gameService.dungeons;
  public readonly gold = computed(() => this.gameService.resources().gold);

  public getHeroImage(heroClass: string): string {
    switch(heroClass) {
      case 'Warrior': return 'assets/heroes/warrior.png';
      case 'Mage': return 'assets/heroes/mage.png';
      case 'Rogue': return 'assets/heroes/rogue.png';
      case 'Cleric': return 'assets/heroes/cleric.png';
      default: return 'assets/heroes/warrior.png';
    }
  }

  public getDungeonName(id: string): string {
    return this.dungeons().find(d => d.id === id)?.name || 'Unknown';
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
