import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PerizieService } from '../shared/perizie.service';

@Component({
  selector: 'app-perizie-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perizie.component.html',
})
export class PerizieComponent implements OnInit {
  search = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);
  perPage = 5;
  Math = Math;
  notificaSuccesso = false;
  messaggioAlert: string = '';
  alertSuccesso: boolean = true;
  perizie: any[] = [];
  selectedPerizia: any = null;

  nuovaPerizia: any = {
    indirizzo: '',
    dataOra: '',
    descrizione: '',
    stato: ''
  };

  constructor(
    private authService: AuthService,
    private perizieService: PerizieService,
    private dataStorage: DataStorageService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      localStorage.setItem('token', token);
      const urlWithoutToken = this.route.snapshot.pathFromRoot
        .map(route => route.url.map(segment => segment.toString()).join('/'))
        .join('/');
      this.location.replaceState(urlWithoutToken);
    }

    const perizieRaw = this.authService.getPerizie();
    if (perizieRaw && Array.isArray(perizieRaw)) {
      this.perizie = perizieRaw.map((p: any) => ({
        ...p,
        dataOra: new Date(p.dataOra)
      }));
    }
  }


  async aggiungiPerizia() {
    try {
      const { indirizzo, dataOra, descrizione, stato } = this.nuovaPerizia;
      const currentUser = this.authService.getUser();

      const coords = await this.getCoordinateDaIndirizzo(indirizzo);

      const nuova = {
        coordinate: coords,
        dataOra,
        descrizione,
        stato,
        codiceOperatore: currentUser._id
      };

      const nuovaSalvata = await this.perizieService.salvaPerizia(nuova);
      this.perizie.unshift({
        ...nuovaSalvata,
        dataOra: new Date(nuovaSalvata.dataOra)
      });
      this.authService.setPerizie(this.perizie);

      // Impostazione messaggio successo
      this.messaggioAlert = 'Perizia aggiunta con successo!';
      this.alertSuccesso = true;

      this.nuovaPerizia = {
        indirizzo: '',
        dataOra: '',
        descrizione: '',
        stato: ''
      };
      this.currentPage.set(1);

      // Nascondi messaggio dopo 5 secondi
      setTimeout(() => (this.messaggioAlert = ''), 5000);

    } catch (error: any) {
      console.error('Errore nel salvataggio:', error);

      // Impostazione messaggio errore
      this.messaggioAlert = error.message || 'Si è verificato un errore nel salvataggio della perizia.';
      this.alertSuccesso = false;

      // Nascondi messaggio dopo 5 secondi
      setTimeout(() => (this.messaggioAlert = ''), 5000);
    }
  }

  async getCoordinateDaIndirizzo(indirizzo: string): Promise<{ latitudine: number, longitudine: number }> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(indirizzo)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length === 0) throw new Error('Indirizzo non trovato');

    return {
      latitudine: parseFloat(data[0].lat),
      longitudine: parseFloat(data[0].lon)
    };
  }
  vaiAllaMappa() {
    this.router.navigate(['/mappa']);
  }

  filtered = computed(() => {
    const searchTerm = this.search().toLowerCase().trim();
    const statusFilter = this.selectedStatus();
    return this.perizie.filter(p =>
      (p.codicePerizia?.toLowerCase().includes(searchTerm) ||
        p.descrizione?.toLowerCase().includes(searchTerm)) &&
      (statusFilter === '' || p.stato === statusFilter)
    );
  });

  paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.perPage;
    return this.filtered().slice(start, start + this.perPage);
  });

  totalPages = computed(() =>
    Math.ceil(this.filtered().length / this.perPage)
  );

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  chiudiDettagli() {
    this.selectedPerizia = null;
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  updateSearch(value: string) {
    this.search.set(value);
  }

  updateStatus(value: string) {
    this.selectedStatus.set(value);
  }

  mostraDettagli(perizia: any) {
    this.selectedPerizia = perizia;
  }
}
