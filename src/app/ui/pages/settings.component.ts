import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 class="text-3xl font-bold text-white">{{ t('Settings') }}</h2>
        <p class="text-slate-400 mt-1">{{ t('Manage your progress and preferences.') }}</p>
      </header>

      <div class="space-y-6">
        <!-- Spracheinstellung -->
        <section class="premium-card">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🌐</span> {{ t('Language') }}
          </h3>
          <p class="text-sm text-slate-400 mb-4">{{ t('Choose your preferred language.') }}</p>
          
          <div class="flex gap-4">
            <button (click)="setLanguage('de')" 
                    [class]="'btn btn-sm rounded-lg flex items-center gap-2 ' + (trans.language() === 'de' ? 'btn-primary' : 'btn-outline border-white/10')">
              <span>🇩🇪</span> {{ t('German (Deutsch)') }}
            </button>
            <button (click)="setLanguage('en')" 
                    [class]="'btn btn-sm rounded-lg flex items-center gap-2 ' + (trans.language() === 'en' ? 'btn-primary' : 'btn-outline border-white/10')">
              <span>🇬🇧</span> {{ t('English (English)') }}
            </button>
          </div>
        </section>

        <section class="premium-card">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💾</span> {{ t('Save Management') }}
          </h3>
          <p class="text-sm text-slate-400 mb-6">{{ t('Your progress is automatically saved every 30 seconds to your local storage.') }}</p>
          
          <div class="flex flex-wrap gap-4">
            <button (click)="saveGame()" class="btn btn-outline btn-sm rounded-lg border-white/10">
              {{ t('Manual Save') }}
            </button>
            <button (click)="resetGame()" class="btn btn-error btn-sm rounded-lg">
              {{ t('Hard Reset') }}
            </button>
          </div>
        </section>

        <section class="premium-card">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>ℹ️</span> {{ t('Game Info') }}
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between text-sm py-2 border-b border-white/5">
              <span class="text-slate-500">{{ t('Version') }}</span>
              <span class="text-slate-200">1.5.0</span>
            </div>
            <div class="flex justify-between text-sm py-2 border-b border-white/5">
              <span class="text-slate-500">{{ t('Engine') }}</span>
              <span class="text-slate-200">Angular 21</span>
            </div>
            <div class="flex justify-between text-sm py-2">
              <span class="text-slate-500">{{ t('Developer') }}</span>
              <span class="text-primary font-bold">Maiki</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class SettingsComponent {
  private readonly gameService = inject(GameService);
  public readonly trans = inject(TranslationService);

  public t(key: string): string {
    return this.trans.t(key);
  }

  public setLanguage(lang: 'de' | 'en') {
    this.gameService.changeLanguage(lang);
    alert(this.t('Language changed successfully!'));
  }

  public saveGame() {
    this.gameService.save();
    alert(this.t('Game saved successfully!'));
  }

  public resetGame() {
    if (confirm(this.t('Are you SURE you want to reset all your progress? This cannot be undone.'))) {
      this.gameService.resetGame();
    }
  }
}
