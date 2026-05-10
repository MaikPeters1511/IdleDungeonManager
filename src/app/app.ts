import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './ui/layout/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="flex h-screen w-full bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
      <app-sidebar></app-sidebar>
      
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <!-- Background Image with Overlay -->
        <div class="absolute inset-0 -z-20">
          <img src="assets/bg/guild_hall.png" class="w-full h-full object-cover opacity-20 grayscale-[0.3]">
          <div class="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0f172a]/90 to-transparent"></div>
        </div>
        
        <!-- Animated Background Orbs -->
        <div class="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full animate-pulse -z-10"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/15 blur-[100px] rounded-full animate-bounce duration-[10s] -z-10"></div>
        <div class="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-accent/5 blur-[80px] rounded-full -z-10"></div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AppComponent {}
