import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Upgrade, Relic } from '../../core/interfaces/game-state.interface';
import { GameEngine } from '../../engine/game-engine';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-upgrades',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in zoom-in-95 duration-500 pb-20">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight">{{ t('Guild Headquarters Upgrades') }}</h2>
          <p class="text-slate-400 mt-1">{{ t('Invest your funds and essence into permanent enhancements.') }}</p>
        </div>
        
        <!-- Tab Switches -->
        <div class="flex bg-slate-950/40 p-1.5 rounded-2xl border border-white/5 shrink-0 self-start md:self-auto">
          <button (click)="activeTab.set('upgrades')" 
                  [class.bg-primary]="activeTab() === 'upgrades'"
                  [class.text-white]="activeTab() === 'upgrades'"
                  [class.text-slate-400]="activeTab() !== 'upgrades'"
                  class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300">
            ⚡ {{ t('Normal Upgrades') }}
          </button>
          <button (click)="activeTab.set('relics')" 
                  [class.bg-secondary]="activeTab() === 'relics'"
                  [class.text-white]="activeTab() === 'relics'"
                  [class.text-slate-400]="activeTab() !== 'relics'"
                  class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300">
            🌀 {{ t('Relics & Prestige') }}
          </button>
        </div>
      </header>

      <!-- Upgrades Tab -->
      @if (activeTab() === 'upgrades') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (upgrade of upgrades(); track upgrade.id) {
            <div class="premium-card flex flex-col h-full group !p-5">
              <div class="flex justify-between items-center mb-4">
                <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {{ getUpgradeIcon(upgrade.type) }}
                </div>
                <span class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{{ t('Level') }} {{ upgrade.level }}</span>
              </div>

              <h3 class="text-lg font-bold text-white mb-1">{{ t(upgrade.name) }}</h3>
              <p class="text-xs text-slate-500 flex-1 leading-relaxed">{{ t(upgrade.description) }}</p>

              <div class="mt-5 pt-4 border-t border-white/5 space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{{ t('Bonus') }}</span>
                  <span class="text-sm font-black text-primary">+{{ upgrade.level * upgrade.bonusPerLevel * 100 | number:'1.0-0' }}%</span>
                </div>
                
                <button (click)="buyUpgrade(upgrade.id)" 
                        [disabled]="gold() < calculateCost(upgrade)"
                        class="btn btn-primary btn-sm w-full rounded-xl shadow-lg shadow-primary/10 font-bold">
                  {{ calculateCost(upgrade) | number:'1.0-0' }} Gold
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Relics & Prestige Tab -->
      @if (activeTab() === 'relics') {
        <div class="space-y-10">
          
          <!-- Reincarnation (Prestige) Panel -->
          <div class="premium-card bg-gradient-to-br from-secondary/15 via-transparent to-transparent border-secondary/20 flex flex-col lg:flex-row justify-between items-center gap-8 !p-8">
            <div class="space-y-3 max-w-2xl text-center lg:text-left">
              <span class="px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-[10px] font-bold uppercase tracking-wider">{{ t('Ascension Portal') }}</span>
              <h3 class="text-2xl font-black text-white">{{ t('Reincarnation') }}</h3>
              <p class="text-sm text-slate-400 leading-relaxed" *ngIf="trans.language() === 'de'">
                Steige in eine höhere Daseinsebene auf! Setzt dein Gold, deine Upgrades und Heldenstufen zurück und sperrt Dungeons. 
                Als Gegenleistung erhältst du <span class="text-secondary font-black">Essenz</span>, mit der du dauerhafte, legendäre Relikte erwerben kannst. 
                <span class="text-white font-bold">Du behältst deine Erfolge, Aufträge, Ausrüstung und Relikte!</span>
              </p>
              <p class="text-sm text-slate-400 leading-relaxed" *ngIf="trans.language() === 'en'">
                Ascend to a higher plane of consciousness! Resets your Gold, Upgrades, Hero Levels, and locks dungeons. 
                In return, you receive <span class="text-secondary font-black">Essence</span>, which you can use to purchase permanent legendary relics. 
                <span class="text-white font-bold">You keep your Achievements, Quests, Inventory, and Relics!</span>
              </p>
              <p class="text-xs text-slate-500 font-semibold italic">{{ t('Formula: 1 Essence per 100,000 lifetime Gold earned.') }}</p>
            </div>
            
            <div class="flex flex-col items-center p-6 bg-slate-950/60 rounded-2xl border border-white/5 min-w-[240px] text-center">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ t('Pending Reward') }}</p>
              <p class="text-4xl font-black text-secondary my-3 tabular-nums">{{ getPendingEssence() | number }} 🌀</p>
              
              @if (getPendingEssence() > 0) {
                <button (click)="prestige()" 
                        class="btn btn-secondary w-full rounded-xl shadow-xl shadow-secondary/10 font-black tracking-wide text-xs py-3.5 px-6">
                  {{ t('ASCEND NOW') }}
                </button>
              } @else {
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                  <div class="bg-secondary h-full transition-all duration-300" [style.width.%]="(totalGoldEarned() / 100000) * 100"></div>
                </div>
                <p class="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                  {{ totalGoldEarned() | number }} / 100,000 Gold
                </p>
              }
            </div>
          </div>

          <!-- Relic Store -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl font-black text-white tracking-tight">{{ t('Ancient Relics') }}</h3>
              <div class="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-xl border border-secondary/20">
                <span class="text-xs text-secondary font-bold uppercase tracking-wider">{{ t('Available Essence:') }}</span>
                <span class="text-sm font-black text-white">{{ essence() | number }} 🌀</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (relic of relics(); track relic.id) {
                <div class="premium-card flex flex-col h-full group border border-secondary/10 !p-5">
                  <div class="flex justify-between items-center mb-4">
                    <div class="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center text-xl group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                      {{ getRelicIcon(relic.type) }}
                    </div>
                    <span class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{{ t('Level') }} {{ relic.level }}</span>
                  </div>

                  <h3 class="text-lg font-bold text-white mb-1">{{ t(relic.name) }}</h3>
                  <p class="text-xs text-slate-500 flex-1 leading-relaxed">{{ t(relic.description) }}</p>

                  <div class="mt-5 pt-4 border-t border-white/5 space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{{ t('Active Bonus') }}</span>
                      <span class="text-sm font-black text-secondary">
                        @if (relic.type === 'KEY_REGEN') {
                          -{{ relic.level * relic.bonusPerLevel }}s
                        } @else {
                          +{{ relic.level * relic.bonusPerLevel * 100 | number:'1.0-0' }}%
                        }
                      </span>
                    </div>
                    
                    <button (click)="buyRelic(relic.id)" 
                            [disabled]="essence() < getRelicCost(relic)"
                            class="btn btn-secondary btn-sm w-full rounded-xl shadow-lg shadow-secondary/10 font-bold">
                      {{ getRelicCost(relic) }} {{ t('Essence') }}
                    </button>
                  </div>
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
export class UpgradesComponent {
  private readonly gameService = inject(GameService);
  public readonly trans = inject(TranslationService);
  
  public readonly activeTab = signal<'upgrades' | 'relics'>('upgrades');

  public readonly upgrades = this.gameService.upgrades;
  public readonly relics = this.gameService.relics;
  public readonly gold = computed(() => this.gameService.resources().gold);
  public readonly essence = computed(() => this.gameService.resources().essence);
  public readonly totalGoldEarned = computed(() => this.gameService.stats().totalGoldEarned);

  public t(key: string): string {
    return this.trans.t(key);
  }

  public calculateCost(upgrade: Upgrade): number {
    return GameEngine.calculateUpgradeCost(upgrade);
  }

  public buyUpgrade(id: string) {
    this.gameService.buyUpgrade(id);
  }

  public getPendingEssence(): number {
    return Math.floor(this.totalGoldEarned() / 100000);
  }

  public prestige() {
    if (confirm(this.t('Are you ready to reincarnate? This resets your Gold, Guild Upgrades, Hero Levels, and locks your Dungeons, but gives you Essence to purchase Relics. This cannot be undone.'))) {
      this.gameService.prestige();
      this.activeTab.set('relics');
    }
  }

  public buyRelic(id: string) {
    this.gameService.buyRelicUpgrade(id);
  }

  public getRelicCost(relic: Relic): number {
    return relic.cost + relic.level;
  }

  public getUpgradeIcon(type: string): string {
    switch(type) {
      case 'GOLD_GAIN': return '💰';
      case 'HERO_DAMAGE': return '⚔️';
      case 'DUNGEON_SPEED': return '👟';
      case 'OFFLINE_EARNINGS': return '💤';
      case 'CRIT_CHANCE': return '🎯';
      default: return '⚡';
    }
  }

  public getRelicIcon(type: string): string {
    switch(type) {
      case 'DAMAGE': return '🗡️';
      case 'GOLD': return '🏆';
      case 'SPEED': return '⏳';
      case 'HP': return '❤️';
      case 'KEY_REGEN': return '⚙️';
      default: return '🌀';
    }
  }
}
