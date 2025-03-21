import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // ✅ Importa CommonModule per *ngFor, *ngIf e DatePipe
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perizie',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], // ✅ Aggiunto CommonModule
  templateUrl: './perizie.component.html',
  styleUrls: ['./perizie.component.css'],
})
export class PerizieComponent {
  searchQuery = '';
  filterDate: string | null = null;
  filterStatus = '';
  selectedPerizia: any = null;

  perizie = [
    { codice: 'PZ001', data: new Date(), luogo: 'Milano', descrizione: 'Incidente stradale', stato: 'completata', foto: ['assets/foto1.jpg', 'assets/foto2.jpg'] },
    { codice: 'PZ002', data: new Date(), luogo: 'Roma', descrizione: 'Danno alla proprietà', stato: 'in_corso', foto: ['assets/foto3.jpg'] },
    { codice: 'PZ003', data: new Date(), luogo: 'Napoli', descrizione: 'Verifica danni', stato: 'annullata', foto: ['assets/foto4.jpg', 'assets/foto5.jpg'] },
  ];

  filteredPerizie() {
    return this.perizie.filter(perizia =>
      (this.searchQuery === '' || perizia.codice.includes(this.searchQuery)) &&
      (!this.filterDate || new Date(perizia.data).toISOString().split('T')[0] === this.filterDate) &&
      (this.filterStatus === '' || perizia.stato === this.filterStatus)
    );
  }

  viewDetails(perizia: any) {
    this.selectedPerizia = perizia;
  }

  closeDetails() {
    this.selectedPerizia = null;
  }
}
