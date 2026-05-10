import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 class="text-3xl font-bold text-white">Settings</h2>
        <p class="text-slate-400 mt-1">Manage your progress and preferences.</p>
      </header>

      <div class="space-y-6">
        <section class="premium-card">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💾</span> Save Management
          </h3>
          <p class="text-sm text-slate-400 mb-6">Your progress is automatically saved every 30 seconds to your local storage.</p>
          
          <div class="flex flex-wrap gap-4">
            <button (click)="saveGame()" class="btn btn-outline btn-sm rounded-lg border-white/10">
              Manual Save
            </button>
            <button (click)="resetGame()" class="btn btn-error btn-sm rounded-lg">
              Hard Reset
            </button>
          </div>
        </section>

        <section class="premium-card">
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>ℹ️</span> Game Info
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between text-sm py-2 border-b border-white/5">
              <span class="text-slate-500">Version</span>
              <span class="text-slate-200">1.0.0 (MVP)</span>
            </div>
            <div class="flex justify-between text-sm py-2 border-b border-white/5">
              <span class="text-slate-500">Engine</span>
              <span class="text-slate-200">Angular 21</span>
            </div>
            <div class="flex justify-between text-sm py-2">
              <span class="text-slate-500">Developer</span>
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

  public saveGame() {
    this.gameService.save();
    alert('Game saved successfully!');
  }

  public resetGame() {
    if (confirm('Are you SURE you want to reset all your progress? This cannot be undone.')) {
      this.gameService.resetGame();
    }
  }
}
