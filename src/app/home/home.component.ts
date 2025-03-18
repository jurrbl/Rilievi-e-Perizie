import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Perizia {
  codice_perizia: string;
  data: string;
  descrizione: string;
  immagine?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  perizie: Perizia[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.caricaPerizie();
  }

  caricaPerizie() {
    this.perizie = [
      {
        codice_perizia: 'PRZ001',
        data: '2024-03-18',
        descrizione: 'Perizia su edificio commerciale',
        immagine: 'https://source.unsplash.com/random/200x200?building'
      },
      {
        codice_perizia: 'PRZ002',
        data: '2024-03-17',
        descrizione: 'Perizia su appartamento privato',
        immagine: 'https://source.unsplash.com/random/200x200?apartment'
      }
    ];
  }

  visualizzaDettagli(perizia: Perizia) {
    alert(`Dettagli perizia: ${perizia.descrizione}`);
  }

  openUploadModal() {
    alert('Apertura modal per caricamento nuova perizia...');
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
