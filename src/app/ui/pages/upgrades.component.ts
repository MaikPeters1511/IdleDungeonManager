import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Upgrade } from '../../core/interfaces/game-state.interface';
import { GameEngine } from '../../engine/game-engine';

@Component({
  selector: 'app-upgrades',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in zoom-in-95 duration-500">
      <header>
        <h2 class="text-3xl font-bold text-white">Guild Upgrades</h2>
        <p class="text-slate-400 mt-1">Invest gold to permanently improve your guild's efficiency.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (upgrade of upgrades(); track upgrade.id) {
          <div class="premium-card flex flex-col h-full group !p-5">
            <div class="flex justify-between items-center mb-4">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {{ getUpgradeIcon(upgrade.type) }}
              </div>
              <span class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Level {{ upgrade.level }}</span>
            </div>

            <h3 class="text-lg font-bold text-white mb-1">{{ upgrade.name }}</h3>
            <p class="text-xs text-slate-500 flex-1 leading-relaxed">{{ upgrade.description }}</p>

            <div class="mt-5 pt-4 border-t border-white/5 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Bonus</span>
                <span class="text-sm font-black text-primary">+{{ upgrade.level * upgrade.bonusPerLevel * 100 | number:'1.0-0' }}%</span>
              </div>
              
              <button (click)="buyUpgrade(upgrade.id)" 
                      [disabled]="gold() < calculateCost(upgrade)"
                      class="btn btn-primary btn-sm w-full rounded-xl shadow-lg shadow-primary/10">
                {{ calculateCost(upgrade) | number:'1.0-0' }} Gold
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class UpgradesComponent {
  private readonly gameService = inject(GameService);
  
  public readonly upgrades = this.gameService.upgrades;
  public readonly gold = computed(() => this.gameService.resources().gold);

  public calculateCost(upgrade: Upgrade): number {
    return GameEngine.calculateUpgradeCost(upgrade);
  }

  public buyUpgrade(id: string) {
    this.gameService.buyUpgrade(id);
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
}
