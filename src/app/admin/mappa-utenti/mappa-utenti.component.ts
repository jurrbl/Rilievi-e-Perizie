import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  NgZone
} from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-mappa-utenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mappa-utenti.component.html',
  styleUrls: ['./mappa-utenti.component.css']
})
export class MappaUtentiComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;
  map!: maplibregl.Map;

  utenti: any[] = [];
  perizieTotali: any[] = [];
  perizieFiltrate: any[] = [];
  periziaSelezionata: any = null;
  utenteAttivo: any = null;
  popupAperti: maplibregl.Popup[] = [];
  immagineIngrandita: string | null = null;

  constructor(private authService: AuthService, private ngZone: NgZone,   private route: ActivatedRoute) {}


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const utenteId = params['utente'];
      
      this.authService.fetchPerizieAdmin().subscribe({
        next: (response) => {
          this.perizieTotali = response.perizie || [];
  
          this.authService.fetchUtentiCompleti().subscribe({
            next: (utenti) => {
              this.utenti = utenti.map(u => ({
                ...u,
                numeroPerizie: this.perizieTotali.filter(p => p.codiceOperatore?.toString() === u._id).length
              }));
  
              // Se esiste ID utente da query string, selezionalo
              if (utenteId) {
                const utente = this.utenti.find(u => u._id === utenteId);
                if (utente) this.selezionaUtente(utente);
              }
            }
          });
        }
      });
    });
  }
  

  ngAfterViewInit(): void {
    const defaultCenter: [number, number] = [12.4964, 41.9028];
    this.map = new maplibregl.Map({
      container: this.mapContainerRef.nativeElement,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256
          }
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
      },
      center: defaultCenter,
      zoom: 5
    });

    this.map.addControl(new maplibregl.NavigationControl());
  }

  selezionaUtente(utente: any): void {
    this.chiudiPopupAperti();
    this.utenteAttivo = utente;
    const id = utente._id?.toString();
    this.perizieFiltrate = this.perizieTotali.filter(
      (p) => p.codiceOperatore?.toString() === id
    );
    this.periziaSelezionata = null;
    setTimeout(() => this.renderMarkers(), 0);
  }

  mostraTutte(): void {
    if (!this.utenteAttivo) return;
    this.chiudiPopupAperti();
    const id = this.utenteAttivo._id.toString();
    this.perizieFiltrate = this.perizieTotali.filter(
      (p) => p.codiceOperatore?.toString() === id
    );
    this.periziaSelezionata = null;
    setTimeout(() => this.renderMarkers(), 0);
  }

  filtraPerizie(stato: string): void {
    if (!this.utenteAttivo) return;
    this.chiudiPopupAperti();
    const id = this.utenteAttivo._id?.toString();
    this.perizieFiltrate =
      stato === 'tutte'
        ? this.perizieTotali.filter((p) => p.codiceOperatore?.toString() === id)
        : this.perizieTotali.filter(
            (p) =>
              p.codiceOperatore?.toString() === id && p.stato === stato
          );
    this.periziaSelezionata = null;
    setTimeout(() => this.renderMarkers(), 0);
  }

  vaiAlDettaglio(perizia: any): void {
    this.periziaSelezionata = perizia;
    setTimeout(() => {
      const el = document.getElementById('dettaglio');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  salvaModifiche(): void {
    if (!this.periziaSelezionata) return;
    const { _id, descrizione, coordinate, indirizzo, fotografie } =
      this.periziaSelezionata;
    this.authService
      .updatePerizia(_id, { descrizione, coordinate, indirizzo, fotografie })
      .subscribe({
        next: () => alert('Modifiche salvate con successo'),
        error: () => alert('Errore durante il salvataggio')
      });
  }

  aggiornaStato(stato: string): void {
    if (!this.periziaSelezionata) return;
    this.authService
      .updatePerizia(this.periziaSelezionata._id, { stato })
      .subscribe({
        next: () => {
          alert(`Stato aggiornato: ${stato}`);
          this.periziaSelezionata.stato = stato;
        },
        error: () => alert('Errore durante aggiornamento stato')
      });
  }

  renderMarkers(): void {
    if (!this.map) return;
    document.querySelectorAll('.maplibregl-marker').forEach((el) =>
      el.remove()
    );
    this.chiudiPopupAperti();

    this.perizieFiltrate.forEach((perizia) => {
      const { codicePerizia, descrizione, coordinate, dataOra, fotografie } =
        perizia;
      if (!coordinate) return;

      const lat = parseFloat(coordinate.latitudine);
      const lon = parseFloat(coordinate.longitudine);
      if (isNaN(lat) || isNaN(lon)) return;

      const el = document.createElement('span');
      el.className = 'material-icons';
      el.textContent = 'place';
      el.style.cssText = 'font-size: 36px; color: #e53935; cursor: pointer';

      const fotoHTML =
        (fotografie || [])
          .map(
            (foto, i) =>
              `<img src="${foto.url}" style="width: 50px; border-radius: 6px; cursor: pointer;" onclick="document.querySelector('#imgModal').src='${foto.url}';document.querySelector('#modalContainer').style.display='flex'" />`
          )
          .join('') || '<p class="no-images">Nessuna immagine</p>';

      const popupContent = `
        <div class="maplibregl-popup-content bg-zinc-900 text-white p-3 rounded-lg max-w-xs shadow-lg">
          <div class="popup-wrapper space-y-2 text-sm">
            <div class="flex gap-2 overflow-x-auto">${fotoHTML}</div>
            <div>
              <p><strong>ID:</strong> ${codicePerizia}</p>
              <p><strong>Data:</strong> ${new Date(dataOra).toLocaleString()}</p>
              <p><strong>Descrizione:</strong> ${descrizione}</p>
              <button class="popup-btn bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded mt-2 text-xs" data-id="${codicePerizia}">Dettaglio</button>
            </div>
          </div>
        </div>`;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lon, lat])
        .setPopup(popup)
        .addTo(this.map);

      this.popupAperti.push(popup);

      popup.on('open', () => {
        setTimeout(() => {
          const btn = document.querySelector(
            `.popup-btn[data-id="${codicePerizia}"]`
          );
          if (btn) {
            btn.addEventListener('click', () => {
              this.ngZone.run(() => this.vaiAlDettaglio(perizia));
            });
          }
        }, 0);
      });
    });
  }

  chiudiPopupAperti(): void {
    this.popupAperti.forEach((popup) => popup.remove());
    this.popupAperti = [];
  }

  chiudiImmagine(): void {
    this.immagineIngrandita = null;
    const modal = document.querySelector('#modalContainer') as HTMLElement;
    if (modal) modal.style.display = 'none';
  }

  hideImage(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) target.style.display = 'none';
  }
}
