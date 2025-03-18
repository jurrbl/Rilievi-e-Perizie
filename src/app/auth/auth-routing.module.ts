import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component' // Importa il login
import { HomeComponent } from '../home/home.component'; // Importa la home page
import { AdminComponent } from '../admin/admin.component'; // Importa la dashboard admin

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirect alla home
  { path: 'home', component: HomeComponent }, // Pagina principale
  { path: 'login', component: LoginComponent }, // Login
  { path: 'admin', component: AdminComponent } // Dashboard Admin
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
