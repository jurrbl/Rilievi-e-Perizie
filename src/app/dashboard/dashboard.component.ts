import { DataStorageService } from './../shared/data-storage.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  name = "";
  role = ""
  username : any = "";
  email : any = "";
  phone : any = "";
  token: string | null = null;
  countPerizie : number = 0; // Inizializza a 0 per evitare errori di undefined

  constructor(private route: ActivatedRoute, private location: Location, private authService : AuthService, private DataStorageService  : DataStorageService) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    console.log('Token from URL:', this.token);

    if (this.token) {
      localStorage.setItem('token', this.token);

      // Rimuovi il token dall'URL
      const urlWithoutToken = this.route.snapshot.pathFromRoot
        .map(route => route.url.map(segment => segment.toString()).join('/'))
        .join('/');
      this.location.replaceState(urlWithoutToken);
    }

    this.username = this.authService.getUser().username; // ✅ prende automaticamente username o googleUsername
    /* let userKey = Object.values(this.username)[2]
    console.log('👤 Utenpreaoodsakodte:', porcodio); */
    this.countPerizie = this.authService.getPerizie().nPerizie;
    console.log(this.countPerizie)
    this.role = this.authService.getUser().role; // ✅ prende automaticamente username o googleUsername
    this.email = this.authService.getUser().email; // ✅ prende automaticamente username o googleUsername
    this.phone = this.authService.getUser().phone; // ✅ prende automaticamente username o googleUsername
  }
  redirectToEmail(email: string): void {
    window.location.href = `mailto:${email}`;
  }

}
