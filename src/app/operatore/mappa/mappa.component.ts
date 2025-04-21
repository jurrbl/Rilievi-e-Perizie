import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mappa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mappa.component.html',
  styleUrls: ['./mappa.component.css']

})
export class MappaComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;
  map!: maplibregl.Map;
  perizie: any[] = [];
  perizieFiltrate: any[] = [];
  periziaSelezionata: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    const tutte = this.authService.getPerizie() || [];
    this.perizie = tutte.filter(p => p.codiceOperatore?.toString() === currentUser._id?.toString());
    this.perizieFiltrate = [...this.perizie];
  }

  ngAfterViewInit(): void {
    const defaultCenter: [number, number] = [7.6869, 45.0703];

    this.map = new maplibregl.Map({
      container: this.mapContainerRef.nativeElement,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            minzoom: 1
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: defaultCenter,
      zoom: 5
    });

    this.map.addControl(new maplibregl.NavigationControl());
    this.renderMarkers();
  }

  filtraPerizie(stato: string): void {
    if (stato === 'tutte') {
      this.perizieFiltrate = [...this.perizie];
    } else {
      this.perizieFiltrate = this.perizie.filter(p => p.stato?.toLowerCase() === stato);
    }

    setTimeout(() => this.renderMarkers(), 0);
  }

  vaiAlDettaglio(perizia: any): void {
    this.periziaSelezionata = perizia;

    if (this.map && perizia.coordinate) {
      const lat = Number(perizia.coordinate.latitudine);
      const lon = Number(perizia.coordinate.longitudine);
      this.map.flyTo({
        center: [lon, lat],
        zoom: 16,
        speed: 1.2,
        curve: 1
      });
    }

    setTimeout(() => {
      const el = document.getElementById('dettaglio');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  renderMarkers(): void {
    if (!this.map) return;

    // Rimuove tutti i marker esistenti
    const markerElements = document.querySelectorAll('.maplibregl-marker');
    markerElements.forEach(el => el.remove());

    const bounds = new maplibregl.LngLatBounds();
    let markerCount = 0;

    this.perizieFiltrate.forEach(perizia => {
      const { codicePerizia, descrizione, coordinate, dataOra, fotografie } = perizia;

      if (!coordinate) return;

      const lat = parseFloat(coordinate.latitudine);
      const lon = parseFloat(coordinate.longitudine);

      // Validazione robusta
      if (isNaN(lat) || isNaN(lon)) return;

      const lngLat: [number, number] = [lon, lat];
      bounds.extend(lngLat);
      markerCount++;

      // Elemento marker personalizzato
      const el = document.createElement('span');
      el.className = 'material-icons';
      el.textContent = 'place';
      el.style.fontSize = '36px';
      el.style.color = '#e53935';
      el.style.cursor = 'pointer';

     const fotoHTML = fotografie.map((foto, i) => `
  <img src="${foto.url}" class="${i === 0 ? 'active' : ''}" />
`).join('');
      const popupContent = `
  <div class="maplibregl-popup-content">
    <div class="popup-wrapper">
      <div class="popup-images">
        ${fotoHTML || '<p class="no-images">Nessuna immagine</p>'}
      </div>
      <div class="popup-details">
        <p><svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 12h6m2 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg> <strong>ID:</strong> ${codicePerizia}</p>
        <p><svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 7V3m8 4V3M4 11h16M4 19h16M4 15h16"/></svg> <strong>Data/Ora:</strong> ${new Date(dataOra).toLocaleString()}</p>
        <p><svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/></svg> <strong>Descrizione:</strong> ${descrizione}</p>
        <button class="popup-btn" onclick="document.getElementById('dettaglio')?.scrollIntoView({ behavior: 'smooth' })">
          🔍 Dettaglio
        </button>
      </div>
    </div>
  </div>
`;


      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);
      setTimeout(() => {
        const imgs = document.querySelectorAll('.popup-images img');
        let current = 0;

        setInterval(() => {
          imgs.forEach((img, i) => img.classList.remove('active'));
          current = (current + 1) % imgs.length;
          imgs[current].classList.add('active');
        }, 2000);
      }, 500);

      new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(this.map);

      el.addEventListener('click', () => {
        this.map.flyTo({
          center: lngLat,
          zoom: 16,
          speed: 1.2,
          curve: 1
        });
      });
    });

    if (markerCount > 0) {
      this.map.fitBounds(bounds, { padding: 60, duration: 1000 });
    } else {
      console.warn('Nessun marker valido da visualizzare.');
    }
  }
  hideImage(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}
