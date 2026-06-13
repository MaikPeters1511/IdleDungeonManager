import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header>
        <h2 class="text-4xl font-black text-white tracking-tight">{{ t('Trophy Room') }}</h2>
        <p class="text-slate-400 mt-2 text-lg">{{ t('Your legacy is carved in gold and blood.') }}</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (ach of achievements(); track ach.id) {
          <div class="premium-card relative overflow-hidden group transition-all duration-500" 
               [class.grayscale]="!ach.isUnlocked"
               [class.opacity-50]="!ach.isUnlocked">
            
            <div class="flex items-center gap-6">
              <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl shadow-inner border border-white/5 group-hover:border-primary/30 transition-colors">
                {{ ach.isUnlocked ? '🏆' : '🔒' }}
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-white mb-1">{{ t(ach.name) }}</h3>
                <p class="text-xs text-slate-500 leading-relaxed">{{ t(ach.description) }}</p>
              </div>
            </div>

            @if (ach.isUnlocked) {
              <div class="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span class="text-[10px] font-black text-green-500 uppercase tracking-widest">{{ t('Completed') }}</span>
                <span class="text-xs font-bold text-slate-400 italic">{{ t('Reward Claimed') }}</span>
              </div>
            } @else {
              <div class="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span class="text-[10px] font-black text-slate-600 uppercase tracking-widest">{{ t('In Progress') }}</span>
                <div class="flex items-center gap-2">
                  @if (ach.reward?.gold) {
                    <span class="text-xs font-bold text-yellow-500/50">+{{ ach.reward?.gold }} 💰</span>
                  }
                </div>
              </div>
            }

            <!-- Decorative corner -->
            <div class="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
          </div>
        }
      </div>
    </div>
  `
})
export class AchievementsComponent {
  private readonly gameService = inject(GameService);
  public readonly trans = inject(TranslationService);
  public readonly achievements = computed(() => this.gameService.state().achievements || []);

  public t(key: string): string {
    return this.trans.t(key);
  }
}
