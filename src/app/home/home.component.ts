import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';
  
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, RouterModule, NgClass],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  sidebarOpen = true;
  animate = true;
  username = '';
  countPerizie = 0;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private dataStorage: DataStorageService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.dataStorage.inviaRichiesta('get', '/auth/me')?.subscribe({
        next: (res: any) => {
          console.log('👤 Utente da /auth/me:', res);
          this.authService.setUser(res);
          this.username = res.username || res.googleUsername || '';
        },
        error: (err) => {
          console.error('Errore durante /me:', err);
        },
      });

     
      this.dataStorage.inviaRichiesta('get', '/auth/perizie')?.subscribe({
        next: (res: any) => {
          this.authService.setPerizie(res.perizie ?? res); // se è array diretto, usa solo res
          this.countPerizie = res.nPerizie ?? res.length ?? 0;
        },
        error: (err) => {
          console.error('❌ Errore durante /perizie:', err);
        }
      });
    }
  }


}
