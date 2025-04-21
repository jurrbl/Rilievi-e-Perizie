import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-mappa-utenti',
  standalone: true,
  imports: [CommonModule],
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Carica utenti
    this.utenti = this.authService.getAllUsers();

    // Carica perizie
    const perizieResponse : any = this.authService.getPerizie();
    console.log('✔️ Perizie complete:', perizieResponse);

    // Se è un oggetto con proprietà `perizie`, estrai correttamente l'array
    this.perizieTotali = Array.isArray(perizieResponse)
      ? perizieResponse
      : perizieResponse.perizie || [];

    // Di default mostra quelle "in_corso"
    this.perizieFiltrate = this.perizieTotali.filter(p => p.stato === 'in_corso');
  }


  ngAfterViewInit(): void {
    const defaultCenter: [number, number] = [12.4964, 41.9028]; // Roma centro
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
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm'
        }]
      },
      center: defaultCenter,
      zoom: 5
    });

    this.map.addControl(new maplibregl.NavigationControl());
  }
  selezionaUtente(utente: any): void {
    this.utenteAttivo = utente;
    const id = utente._id?.toString();
    this.perizieFiltrate = this.perizieTotali.filter(p => p.codiceOperatore?.toString() === id);
    this.periziaSelezionata = null;
    setTimeout(() => this.renderMarkers(), 0);
  }


  mostraTutte(): void {
    if (!this.utenteAttivo) return;
    const id = this.utenteAttivo._id.toString();
    this.perizieFiltrate = this.perizieTotali.filter(
      p => p.codiceOperatore?.toString() === id
    );
    this.periziaSelezionata = null;
    setTimeout(() => this.renderMarkers(), 0);
  }
  filtraPerizie(stato: string): void {
    if (!this.utenteAttivo) return;
    const id = this.utenteAttivo._id?.toString();

    this.perizieFiltrate = stato === 'tutte'
      ? this.perizieTotali.filter(p => p.codiceOperatore?.toString() === id)
      : this.perizieTotali.filter(
          p => p.codiceOperatore?.toString() === id && p.stato === stato
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

  renderMarkers(): void {
    if (!this.map) return;

    document.querySelectorAll('.maplibregl-marker').forEach(el => el.remove());

    this.perizieFiltrate.forEach(perizia => {
      const { codicePerizia, descrizione, coordinate, dataOra, fotografie } = perizia;
      if (!coordinate) return;

      const lat = parseFloat(coordinate.latitudine);
      const lon = parseFloat(coordinate.longitudine);
      if (isNaN(lat) || isNaN(lon)) return;

      const el = document.createElement('span');
      el.className = 'material-icons';
      el.textContent = 'place';
      el.style.cssText = 'font-size: 36px; color: #e53935; cursor: pointer';

      const fotoHTML = (fotografie || []).map((foto, i) => `<img src="${foto.url}" class="${i === 0 ? 'active' : ''}" />`).join('');
      const popupContent = `
        <div class="maplibregl-popup-content">
          <div class="popup-wrapper">
            <div class="popup-images">${fotoHTML || '<p class="no-images">Nessuna immagine</p>'}</div>
            <div class="popup-details">
              <p><strong>ID:</strong> ${codicePerizia}</p>
              <p><strong>Data/Ora:</strong> ${new Date(dataOra).toLocaleString()}</p>
              <p><strong>Descrizione:</strong> ${descrizione}</p>
              <button class="popup-btn" onclick="document.getElementById('dettaglio')?.scrollIntoView({ behavior: 'smooth' })">🔍 Dettaglio</button>
            </div>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);
      new maplibregl.Marker({ element: el }).setLngLat([lon, lat]).setPopup(popup).addTo(this.map);
    });
  }

  hideImage(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) target.style.display = 'none';
  }
}
