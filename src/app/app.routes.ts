import { Routes } from '@angular/router';
import { AdminGuard } from './auth/admin.guard';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/ForgotPassword/ForgotPassword.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/ResetPassword/ResetPassword.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./operatore/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'mappa',
        loadComponent: () => import('./operatore/mappa/mappa.component').then(m => m.MappaComponent)
      },
      {
        path: 'perizie',
        loadComponent: () => import('./operatore/perizie/perizie.component').then(m => m.PerizieComponent)
      },
      {
        path: 'dashboard-admin',
        canActivate: [AdminGuard],
        loadComponent: () => import('./admin/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent)
      },
      {
        path: 'mappa-utenti',
        canActivate: [AdminGuard],
        loadComponent: () => import('./admin/mappa-utenti/mappa-utenti.component').then(m => m.MappaUtentiComponent)
      },
      {
        path: 'perizie-admin',
        canActivate: [AdminGuard],
        loadComponent: () => import('./admin/perizie-admin/perizie-admin.component').then(m => m.PerizieAdminComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
