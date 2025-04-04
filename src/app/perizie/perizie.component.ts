import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

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

  perizie: any[] = [];
  selectedPerizia: any = null;

  searchValue = '';
  statusValue = '';

  nuovaPerizia: any = {
    codicePerizia: '',
    dataOra: new Date(),
    coordinate: {
      latitudine: 0,
      longitudine: 0
    },
    descrizione: '',
    stato: ''
  };

  constructor(
    private authService: AuthService,
    private dataStorage: DataStorageService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Rimuovi token dall'URL e salvalo localmente
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

  aggiungiPerizia() {
    const nuova = {
      ...this.nuovaPerizia,
      dataOra: new Date(this.nuovaPerizia.dataOra)
    };
    this.perizie.unshift(nuova);
    this.nuovaPerizia = {
      codicePerizia: '',
      dataOra: new Date(),
      coordinate: {
        latitudine: 0,
        longitudine: 0
      },
      descrizione: '',
      stato: ''
    };
    this.currentPage.set(1);
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

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  updateSearch(value: string) {
    this.searchValue = value;
    this.search.set(value);
  }

  updateStatus(value: string) {
    this.statusValue = value;
    this.selectedStatus.set(value);
  }

  mostraDettagli(perizia: any) {
    this.selectedPerizia = perizia;
  }
}
