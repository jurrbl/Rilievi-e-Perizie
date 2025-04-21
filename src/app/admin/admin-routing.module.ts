import { Routes } from '@angular/router';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { MappaUtentiComponent } from './mappa-utenti/mappa-utenti.component';
import { PerizieAdminComponent } from './perizie-admin/perizie-admin.component';

export const adminRoutes: Routes = [
  { path: 'dashboard', component: DashboardAdminComponent },
  { path: 'mappa', component: MappaUtentiComponent },
  { path: 'perizie', component: PerizieAdminComponent }
];
