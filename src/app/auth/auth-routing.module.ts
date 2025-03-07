import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component' // Importa il login

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Reindirizza a /login di default
  { path: 'login', component: LoginComponent }, // Rotta per il login
  { path: '**', redirectTo: '/login' } // Reindirizza tutto il resto a login (opzionale)
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
