import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { DataStorageService } from '../../shared/data-storage.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css'],
})
export class DashboardAdminComponent implements OnInit {
  username = '';
  email = '';
  phone = '';
  profilePicture = '';
  role = '';
  lastSeen = '';
  utenti: any[] = [];
  perizieRevisionate = 0;

  nuovoOperatore = {
    username: '',
    email: '',
    password: '',
    abilitato: true
  };

  constructor(
    private authService: AuthService,
    private dataStorage: DataStorageService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.username = user.username || user.googleUsername || '';
      this.email = user.email || '';
      this.phone = user.phone || '';
      this.profilePicture = user.profilePicture || '';
      this.role = user.role || 'admin';
      this.lastSeen = new Date().toLocaleString();
    }

    this.caricaUtenti();
  }

  caricaUtenti(): void {
    this.dataStorage.inviaRichiesta('get', '/admin/utenti-con-perizie')!.subscribe({
      next: (res: any) => {
        this.utenti = res.utenti || [];
      },
      error: err => {
        console.error('❌ Errore nel caricamento utenti con perizie:', err);
      }
    });
  }

  visualizzaPerizieUtente(utente: any) {
    this.router.navigate(['/home/mappa-utenti'], {
      queryParams: { utente: utente._id }
    });
  }

  aggiungiOperatore() {
    const payload = {
      username: this.nuovoOperatore.username,
      email:    this.nuovoOperatore.email,
      password: this.nuovoOperatore.password,
      role:     'user'
    };
  
    // 👉 Loggiamo il payload prima della richiesta
    console.log('📤 Payload new operator:', payload);
  
    this.dataStorage.inviaRichiesta('post', '/admin/users', payload)!.subscribe({
      next: res => {
        console.log('✅ Risposta creazione operatore:', res);
        this.nuovoOperatore = { username: '', email: '', password: '', abilitato: true };
        this.caricaUtenti();
      },
      error: err => {
        // 👉 Logghiamo l’intero HttpErrorResponse
        console.error('❌ Errore aggiunta operatore:', err);
        // 👉 Logghiamo il body di risposta (spesso contiene message + details)
        console.error('❌ Dettaglio error.body:', err.error);
        alert(err.error?.message || 'Errore creazione operatore');
      }
    });
  }
}
