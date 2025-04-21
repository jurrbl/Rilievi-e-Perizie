import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { DataStorageService } from '../../shared/data-storage.service';
import { FormsModule } from '@angular/forms';

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
  perizieDaRevisionare: any[] = [];
  perizieRevisionate = 0;
  nuovoOperatore = {
    username: '',
    email: '',
    password: '',
    abilitato: true
  };

  constructor(
    private authService: AuthService,
    private dataStorage: DataStorageService
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
    this.dataStorage.inviaRichiesta('get', `/admin/perizie/utente/${utente._id}`)!.subscribe({
      next: (res: any) => {
        const tutte = res.perizie || [];

        this.perizieDaRevisionare = tutte.filter((p: any) =>
          p.stato?.toLowerCase().trim() === 'in_corso'
        );
        this.perizieRevisionate = tutte.filter((p: any) =>
          p.stato?.toLowerCase().trim() !== 'in_corso'
        ).length;
      },
      error: err => {
        console.error('❌ Errore caricamento perizie:', err);
      }
    });
  }

  cambiaStato(perizia: any, nuovoStato: 'completata' | 'annullata'): void {
    const payload = {
      stato: nuovoStato,
      descrizione: perizia.descrizione,
      fotografie: perizia.fotografie
    };

    this.dataStorage.inviaRichiesta('put', `/admin/perizie/${perizia._id}`, payload)!.subscribe({
      next: () => {
        this.perizieDaRevisionare = this.perizieDaRevisionare.filter(p => p._id !== perizia._id);
        this.perizieRevisionate++;
        this.aggiornaConteggioPerizieUtente(perizia.codiceOperatore);
      },
      error: err => {
        console.error('❌ Errore aggiornamento stato:', err);
      }
    });
  }

  aggiornaConteggioPerizieUtente(userId: string) {
    const utente = this.utenti.find(u => u._id === userId);
    if (utente && utente.in_corso_count > 0) {
      utente.in_corso_count -= 1;
    }
  }

  aggiungiOperatore() {
    const payload = {
      username: this.nuovoOperatore.username,
      email: this.nuovoOperatore.email,
      password: this.nuovoOperatore.password,
      role: this.nuovoOperatore.abilitato ? 'user' : 'viewer'
    };

    this.dataStorage.inviaRichiesta('post', '/admin/users', payload)!.subscribe({
      next: () => {
        this.nuovoOperatore = { username: '', email: '', password: '', abilitato: true };
        this.caricaUtenti();
      },
      error: err => {
        console.error('❌ Errore aggiunta operatore:', err);
      }
    });
  }
}
