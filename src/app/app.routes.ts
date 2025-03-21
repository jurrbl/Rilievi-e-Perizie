import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { PerizieComponent } from './perizie/perizie.component';
import { MappaComponent } from './mappa/mappa.component';
import { SidebarComponent } from './sidebar/sidebar.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // ✅ All'avvio va sul login
  { path: 'login', component: LoginComponent }, // ✅ Mostra il login senza sidebar
  { path: 'admin', component: AdminComponent }, // ✅ Sezione admin senza sidebar
  { path: 'sidebar', component: SidebarComponent }, //
  {path: 'a', component: HomeComponent },
  // ✅ La sidebar appare SOLO in "home" e i componenti cambiano dentro
  { path: 'home', component: HomeComponent, children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
    { path: 'dashboard', component: DashboardComponent },
    { path: 'perizie', component: PerizieComponent },
    { path: 'mappa', component: MappaComponent }
  ] },
];

export const appRoutingProviders = [
  provideRouter(routes)
];
