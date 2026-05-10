import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GameService } from '../../services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="h-full w-72 bg-slate-900/50 backdrop-blur-xl flex flex-col border-r border-white/5 relative z-50">
      <!-- Logo Section -->
      <div class="p-8 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-lg shadow-primary/20">
            🏰
          </div>
          <div>
            <h1 class="text-xl font-black tracking-tight text-white leading-none">IDLE</h1>
            <p class="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Dungeon</p>
          </div>
        </div>
      </div>

      <!-- Resource Display -->
      <div class="px-6 py-6 mx-4 my-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-slate-400">
            <span class="text-lg">💰</span>
            <span class="text-xs font-bold uppercase tracking-wider">Gold</span>
          </div>
          <span class="text-lg font-black text-yellow-500 tabular-nums">
            {{ resources().gold | number:'1.0-0' }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-slate-400">
            <span class="text-lg">💎</span>
            <span class="text-xs font-bold uppercase tracking-wider">Gems</span>
          </div>
          <span class="text-lg font-black text-blue-400 tabular-nums">
            {{ resources().gems | number }}
          </span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <a routerLink="/dashboard" routerLinkActive="nav-active" class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-text">Dashboard</span>
        </a>
        <a routerLink="/heroes" routerLinkActive="nav-active" class="nav-item">
          <span class="nav-icon">⚔️</span>
          <span class="nav-text">Heroes Guild</span>
        </a>
        <a routerLink="/dungeons" routerLinkActive="nav-active" class="nav-item">
          <span class="nav-icon">🏚️</span>
          <span class="nav-text">Dungeons</span>
        </a>
        <a routerLink="/upgrades" routerLinkActive="nav-active" class="nav-item">
          <span class="nav-icon">⚡</span>
          <span class="nav-text">Upgrades</span>
        </a>
        <a routerLink="/achievements" routerLinkActive="nav-active" class="nav-item">
          <span class="nav-icon">🏆</span>
          <span class="nav-text">Trophy Room</span>
        </a>
      </nav>

      <!-- Footer / Settings -->
      <div class="p-4 mt-auto">
        <a routerLink="/settings" routerLinkActive="bg-white/10" 
           class="flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 hover:bg-white/5 text-slate-500 hover:text-slate-200 text-sm font-medium">
          <span>⚙️</span> Settings
        </a>
      </div>
    </div>
  `,
  styles: [`
    .nav-item {
      @apply flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent;
    }
    .nav-text {
      @apply text-sm font-bold tracking-tight;
    }
    .nav-icon {
      @apply text-xl grayscale transition-all duration-200;
    }
    .nav-active {
      @apply bg-primary/10 border-primary/20 text-white shadow-xl shadow-primary/5;
    }
    .nav-active .nav-icon {
      @apply grayscale-0 scale-110;
    }
  `]
})
export class SidebarComponent {
  private readonly gameService = inject(GameService);
  public readonly resources = this.gameService.resources;
}
