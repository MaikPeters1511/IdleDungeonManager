import { Routes } from '@angular/router';
import { DashboardComponent } from './ui/pages/dashboard.component';
import { HeroesComponent } from './ui/pages/heroes.component';
import { DungeonsComponent } from './ui/pages/dungeons.component';
import { WorkshopComponent } from './ui/pages/workshop.component';
import { UpgradesComponent } from './ui/pages/upgrades.component';
import { AchievementsComponent } from './ui/pages/achievements.component';
import { QuestsComponent } from './ui/pages/quests.component';
import { SettingsComponent } from './ui/pages/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'heroes', component: HeroesComponent },
  { path: 'dungeons', component: DungeonsComponent },
  { path: 'workshop', component: WorkshopComponent },
  { path: 'upgrades', component: UpgradesComponent },
  { path: 'quests', component: QuestsComponent },
  { path: 'achievements', component: AchievementsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'dashboard' }
];
