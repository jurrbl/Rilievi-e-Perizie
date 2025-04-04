import { DataStorageService } from './../shared/data-storage.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../auth/auth.service';

/* installate per avere tipo 1 ora fa 2 ore fa nell'ultimo accesso */
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

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
  profilePicture : string = "";
  token: string | null = null;
  countPerizie : number = 0;
  lastSeen : string = "";

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

    this.username = this.authService.getUser().username;
    this.countPerizie = this.authService.getPerizie().length;
    this.role = this.authService.getUser().role;
    this.email = this.authService.getUser().email;
    this.phone = this.authService.getUser().phone;
    this.profilePicture = this.authService.getUser().profilePicture;
    const lastSeenDate = new Date(this.authService.getUser().lastSeen);
    this.lastSeen = this.authService.getUser().lastSeen
  ? formatDistanceToNow(new Date(this.authService.getUser().lastSeen), { addSuffix: true, locale: it })
  : 'Mai';
  }

  redirectToEmail(email: string): void {
    window.location.href = `mailto:${email}`;
  }

}
