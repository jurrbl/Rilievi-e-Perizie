import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { PerizieComponent } from './perizie/perizie.component';
import { MappaComponent } from './mappa/mappa.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ForgotPasswordComponent } from './ForgotPassword/ForgotPassword.component';
import { ResetPasswordComponent } from './ResetPassword/ResetPassword.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'sidebar', component: SidebarComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {path: 'a', component: HomeComponent },
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
