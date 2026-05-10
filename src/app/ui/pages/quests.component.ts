import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-quests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="text-4xl font-black text-white tracking-tight">Guild Quests</h2>
          <p class="text-slate-400 mt-2 text-lg">Complete special tasks to earn legendary rewards.</p>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        @for (quest of quests(); track quest.id) {
          <div class="premium-card group relative overflow-hidden flex flex-col p-0" 
               [class.opacity-60]="quest.isClaimed">
            
            <!-- Quest Image Header -->
            <div class="h-48 w-full relative overflow-hidden shrink-0">
              <img [src]="getQuestImage(quest.type)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              
              <!-- Completion Badge -->
              @if (quest.isCompleted && !quest.isClaimed) {
                <div class="absolute top-4 right-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl animate-bounce">
                  Ready to Claim
                </div>
              }
            </div>

            <div class="p-8 space-y-6 flex-1 flex flex-col">
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5 bg-slate-800/50">
                    {{ getQuestIcon(quest.type) }}
                  </div>
                  <div>
                    <h3 class="text-2xl font-black text-white group-hover:text-primary transition-colors">{{ quest.title }}</h3>
                    <p class="text-slate-400 font-medium">{{ quest.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-3">
                <div class="flex justify-between text-xs font-black uppercase tracking-[0.2em]">
                  <span class="text-slate-500">Quest Progress</span>
                  <span class="text-white tabular-nums">{{ quest.currentValue | number }} / {{ quest.targetValue | number }}</span>
                </div>
                <div class="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div class="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                       [ngClass]="quest.isCompleted ? 'bg-green-500 shadow-green-500/20' : 'bg-gradient-to-r from-primary to-secondary'"
                       [style.width.%]="getProgressPercent(quest)"></div>
                </div>
              </div>

              <!-- Reward Area -->
              <div class="mt-4 pt-6 border-t border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bounty:</span>
                  <div class="flex gap-4">
                    @if (quest.reward.gold) {
                      <div class="flex items-center gap-2">
                        <span class="text-lg">💰</span>
                        <span class="text-xl font-black text-yellow-500">{{ quest.reward.gold | number }}</span>
                      </div>
                    }
                    @if (quest.reward.gems) {
                      <div class="flex items-center gap-2">
                        <span class="text-lg">💎</span>
                        <span class="text-xl font-black text-cyan-400">{{ quest.reward.gems | number }}</span>
                      </div>
                    }
                  </div>
                </div>

                @if (quest.isCompleted && !quest.isClaimed) {
                  <button (click)="claim(quest.id)" 
                          class="btn btn-primary btn-lg rounded-2xl px-10 shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                    Claim Reward
                  </button>
                } @else if (quest.isClaimed) {
                  <div class="flex items-center gap-2 text-slate-500 font-bold">
                    <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl">✓</div>
                    <span>COLLECTED</span>
                  </div>
                } @else {
                   <div class="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] border border-white/5 px-4 py-2 rounded-xl">
                     In Progress
                   </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class QuestsComponent {
  private readonly gameService = inject(GameService);
  public readonly quests = this.gameService.quests;

  public getProgressPercent(quest: any): number {
    return Math.min((quest.currentValue / quest.targetValue) * 100, 100);
  }

  public getQuestIcon(type: string): string {
    switch(type) {
      case 'COLLECT_GOLD': return '💰';
      case 'COMPLETE_DUNGEONS': return '🏚️';
      case 'UPGRADE_HEROES': return '⚡';
      case 'CLICK_MANUAL': return '🖱️';
      default: return '📜';
    }
  }

  public getQuestImage(type: string): string {
    switch(type) {
      case 'COLLECT_GOLD': return 'assets/quests/gold_collection.png';
      case 'COMPLETE_DUNGEONS': return 'assets/quests/dungeon_master.png';
      case 'UPGRADE_HEROES': return 'assets/quests/hero_training.png';
      case 'CLICK_MANUAL': return 'assets/quests/clicking_frenzy.png';
      default: return 'assets/quests/gold_collection.png';
    }
  }

  public claim(id: string) {
    this.gameService.claimQuestReward(id);
  }
}
