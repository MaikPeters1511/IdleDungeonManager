import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { GameEngine } from '../../engine/game-engine';
import { Hero } from '../../core/interfaces/game-state.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <!-- Welcome Header -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 class="text-4xl font-black text-white tracking-tight">Guild Headquarters</h2>
          <p class="text-slate-400 mt-2 text-lg">Your guild is growing stronger every second.</p>
        </div>
        <div class="flex items-center gap-4">
          <button (click)="manualClick()" 
                  class="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl font-black text-white shadow-xl shadow-yellow-500/20 active:scale-95 transition-all overflow-hidden">
            <span class="relative z-10 flex items-center gap-2">
              <span class="text-2xl group-hover:animate-bounce">💰</span> COLLECT GOLD
            </span>
            <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>

          <div class="flex items-center gap-4 px-6 py-4 glass-panel rounded-2xl shadow-2xl border-primary/20">
            <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl animate-pulse">
              ⚡
            </div>
            <div>
              <p class="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Efficiency Rate</p>
              <p class="text-xl font-black text-white">100% <span class="text-xs text-slate-500 font-normal">Active</span></p>
            </div>
          </div>
        </div>
      </header>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="premium-card group">
          <div class="flex justify-between items-start mb-4">
            <span class="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Wealth</span>
            <span class="text-yellow-500 opacity-50 group-hover:opacity-100 transition-opacity">💰</span>
          </div>
          <p class="text-3xl font-black text-white tabular-nums">{{ stats().totalGoldEarned | number:'1.0-0' }}</p>
          <p class="text-xs text-slate-500 mt-4">Total Gold Collected</p>
        </div>

        <div class="premium-card group">
          <div class="flex justify-between items-start mb-4">
            <span class="text-slate-500 text-xs font-bold uppercase tracking-widest">Conquests</span>
            <span class="text-primary opacity-50 group-hover:opacity-100 transition-opacity">🏰</span>
          </div>
          <p class="text-3xl font-black text-white tabular-nums">{{ stats().totalDungeonsCompleted | number }}</p>
          <p class="text-xs text-slate-500 mt-4">Total Dungeons Cleared</p>
        </div>

        <div class="premium-card group">
          <div class="flex justify-between items-start mb-4">
            <span class="text-slate-500 text-xs font-bold uppercase tracking-widest">Deployed Squad</span>
            <span class="text-secondary opacity-50 group-hover:opacity-100 transition-opacity">⚔️</span>
          </div>
          <p class="text-3xl font-black text-white tabular-nums">{{ activeHeroesCount() }}</p>
          <p class="text-xs text-slate-500 mt-4">Heroes currently farming</p>
        </div>

        <div class="premium-card group">
          <div class="flex justify-between items-start mb-4">
            <span class="text-slate-500 text-xs font-bold uppercase tracking-widest">Revenue Flow</span>
            <span class="text-accent opacity-50 group-hover:opacity-100 transition-opacity">⚡</span>
          </div>
          <p class="text-3xl font-black text-white tabular-nums">{{ globalGps() | number:'1.0-1' }} <span class="text-sm font-normal text-slate-500">/s</span></p>
          <p class="text-xs text-slate-500 mt-4">Average Gold per Second</p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Active Missions -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-black text-white tracking-tight">Active Hero Missions</h3>
            <button class="btn btn-ghost btn-sm text-primary font-bold">Manage All</button>
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            @for (hero of heroes(); track hero.id) {
              @if (hero.isUnlocked && hero.currentDungeonId && !hero.isResting) {
                <div class="premium-card !p-5 flex items-center gap-6 group hover:scale-[1.01]">
                  <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 shadow-inner border border-white/5 group-hover:border-primary/30 transition-colors shrink-0">
                    <img [src]="getHeroImage(hero.heroClass)" class="w-full h-full object-cover" [alt]="hero.name">
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-end mb-3">
                      <div class="truncate">
                        <span class="font-black text-lg text-white block truncate">{{ hero.name }}</span>
                        <span class="text-[10px] text-slate-500 uppercase tracking-widest font-bold truncate">
                          {{ getDungeonName(hero.currentDungeonId) }}
                        </span>
                      </div>
                      <div class="text-right shrink-0">
                        <span class="text-xs font-black text-primary tabular-nums">
                          {{ getTimeRemaining(hero) | number:'1.1-1' }}s
                        </span>
                      </div>
                    </div>
                    
                    <!-- Progress Bar & HP -->
                    <div class="space-y-3">
                      <!-- Mission Progress -->
                      <div>
                        <div class="flex justify-between text-[9px] font-black text-slate-500 mb-0.5">
                          <span>MISSION PROGRESS</span>
                          <span>{{ getDungeonProgressPercent(hero) | number:'1.0-0' }}%</span>
                        </div>
                        <div class="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-white/5">
                          <div class="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                               [style.width.%]="getDungeonProgressPercent(hero)"></div>
                        </div>
                      </div>

                      <!-- HP Status -->
                      <div>
                        <div class="flex justify-between text-[9px] font-black text-slate-500 mb-0.5">
                          <span>HERO HP</span>
                          <span>{{ (hero.currentHp || 0) | number:'1.0-0' }} / {{ getHeroMaxHp(hero) | number:'1.0-0' }}</span>
                        </div>
                        <div class="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden border border-white/5">
                          <div [class]="getHpBarClass(hero)"
                               [style.width.%]="getHpPercent(hero)"></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              }
            } @empty {
              <div class="text-center py-20 premium-card border-dashed border-white/10 flex flex-col items-center">
                <div class="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center text-4xl mb-6 grayscale opacity-50">⚔️</div>
                <h4 class="text-xl font-bold text-white mb-2">The Guild is Quiet</h4>
                <p class="text-slate-500 max-w-sm">No heroes are currently assigned to dungeons. Head over to the Heroes Guild to deploy your warriors.</p>
                <button routerLink="/heroes" class="btn btn-primary mt-8 rounded-full px-8">Hire Heroes</button>
              </div>
            }
          </div>

          <!-- Resting Guild Members -->
          @if (hasRestingHeroes()) {
            <div class="space-y-4 pt-6 border-t border-white/5">
              <h3 class="text-xl font-black text-white tracking-tight">Resting Guild Members</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (hero of heroes(); track hero.id) {
                  @if (hero.isUnlocked && hero.isResting) {
                    <div class="premium-card !p-4 flex items-center gap-4 border-amber-500/10">
                      <div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-white/5 grayscale shrink-0">
                        <img [src]="getHeroImage(hero.heroClass)" class="w-full h-full object-cover">
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-1">
                          <span class="font-bold text-slate-200 truncate">{{ hero.name }}</span>
                          <span class="text-[9px] font-black text-amber-500 uppercase">💤 Resting</span>
                        </div>
                        <div class="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden border border-white/5">
                          <div class="bg-amber-500 h-full transition-all duration-300 animate-pulse" [style.width.%]="getHpPercent(hero)"></div>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>

        <!-- Sidebar Info -->
        <div class="space-y-8">
          <div class="premium-card !p-8 bg-gradient-to-br from-primary/10 to-transparent">
            <h3 class="text-xl font-bold text-white mb-6">Guild Updates</h3>
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0 animate-pulse"></div>
                <p class="text-sm text-slate-400 italic font-medium leading-relaxed">"The Goblin Cave has seen increased activity. Good for business!"</p>
              </div>
              <div class="flex gap-4">
                <div class="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0"></div>
                <p class="text-sm text-slate-400 italic font-medium leading-relaxed">"Local merchants are looking for dragon scales. Reward is high."</p>
              </div>
              <div class="flex gap-4">
                <div class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                <p class="text-sm text-slate-400 italic font-medium leading-relaxed">"A mysterious traveler mentioned a gate to the Abyss..."</p>
              </div>
            </div>
          </div>

          <!-- Quick Tip -->
          <div class="p-6 rounded-2xl bg-accent/10 border border-accent/20">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-accent">💡</span>
              <h4 class="text-xs font-black text-accent uppercase tracking-widest">Pro Tip</h4>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">Deploy a <span class="text-white font-bold">Cleric</span> (like Elena) and a <span class="text-white font-bold">Tank</span> in difficult dungeons to keep your heroes alive!</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  private readonly gameService = inject(GameService);
  
  public readonly heroes = this.gameService.heroes;
  public readonly dungeons = this.gameService.dungeons;
  public readonly stats = this.gameService.stats;
  public readonly gameState = this.gameService.state;

  public manualClick() {
    this.gameService.manualClick();
  }

  public activeHeroesCount() {
    return this.heroes().filter(h => h.isUnlocked && h.currentDungeonId && !h.isResting).length;
  }

  public hasRestingHeroes(): boolean {
    return this.heroes().some(h => h.isUnlocked && h.isResting);
  }

  public globalGps() {
    return GameEngine.calculateGlobalGoldPerSecond(this.gameState());
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
    return this.dungeons().find(d => d.id === id)?.name || 'Unknown Dungeon';
  }

  public getHeroMaxHp(hero: Hero): number {
    return GameEngine.getHeroMaxHp(this.gameState(), hero);
  }

  public getHpPercent(hero: Hero): number {
    const max = this.getHeroMaxHp(hero);
    return Math.min(100, ((hero.currentHp || 0) / max) * 100);
  }

  public getHpBarClass(hero: Hero): string {
    const percent = this.getHpPercent(hero);
    if (percent < 30) return 'bg-red-500 h-full transition-all duration-300';
    if (percent < 70) return 'bg-yellow-500 h-full transition-all duration-300';
    return 'bg-green-500 h-full transition-all duration-300';
  }

  public getDungeonProgressPercent(hero: any): number {
    if (!hero.currentDungeonId || hero.dungeonProgress === undefined) return 0;
    const dungeon = this.dungeons().find(d => d.id === hero.currentDungeonId);
    if (!dungeon) return 0;
    const effectiveDuration = GameEngine.getEffectiveDungeonDuration(this.gameState(), dungeon, hero);
    return Math.min((hero.dungeonProgress / effectiveDuration) * 100, 100);
  }

  public getTimeRemaining(hero: any): number {
    if (!hero.currentDungeonId || hero.dungeonProgress === undefined) return 0;
    const dungeon = this.dungeons().find(d => d.id === hero.currentDungeonId);
    if (!dungeon) return 0;
    const effectiveDuration = GameEngine.getEffectiveDungeonDuration(this.gameState(), dungeon, hero);
    return Math.max(0, effectiveDuration - hero.dungeonProgress);
  }
}
