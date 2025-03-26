import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Perizia {
  codice: string;
  data: Date;
  luogo: string;
  descrizione: string;
  stato: string;
}

@Component({
  selector: 'app-perizie-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perizie.component.html',
})
export class PerizieComponent {
  search = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);
  perPage = 5;
  Math = Math;

  nuovaPerizia: Perizia = {
    codice: '',
    data: new Date(),
    luogo: '',
    descrizione: '',
    stato: '',
  };

  aggiungiPerizia() {
    const nuova = { ...this.nuovaPerizia, data: new Date(this.nuovaPerizia.data) };
    this.perizie.unshift(nuova); // aggiunta in cima
    this.nuovaPerizia = {
      codice: '',
      data: new Date(),
      luogo: '',
      descrizione: '',
      stato: '',
    };
    this.currentPage.set(1); // torna alla prima pagina
  }


  // Questi due servono SOLO per il template (compatibili con ngModel)
  searchValue = '';
  statusValue = '';

  perizie: Perizia[] = [
    { codice: 'PZ001', data: new Date(), luogo: 'Milano', descrizione: 'Incidente stradale', stato: 'completata' },
    { codice: 'PZ002', data: new Date(), luogo: 'Roma', descrizione: 'Danno alla proprietà', stato: 'in_corso' },
    { codice: 'PZ003', data: new Date(), luogo: 'Napoli', descrizione: 'Verifica danni', stato: 'annullata' }
  ];

  filtered = computed(() => {
    const searchTerm = this.search().toLowerCase().trim();
    const statusFilter = this.selectedStatus();

    return this.perizie.filter(p =>
      (p.codice.toLowerCase().includes(searchTerm) ||
        p.luogo.toLowerCase().includes(searchTerm) ||
        p.descrizione.toLowerCase().includes(searchTerm)) &&
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

  goToDettagli(perizia: Perizia) {
    window.location.href = `/dettagli/${perizia.codice}`;
  }

  updateSearch(value: string) {
    this.searchValue = value;
    this.search.set(value);
  }

  updateStatus(value: string) {
    this.statusValue = value;
    this.selectedStatus.set(value);
  }
}
