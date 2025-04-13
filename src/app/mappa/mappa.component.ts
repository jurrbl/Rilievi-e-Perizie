import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { AuthService } from '../auth/auth.service';
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
  
      const fotoHTML = (fotografie || []).map(f => `
        <img src="${f.url}" class="popup-img" alt="Foto" />
      `).join('');
  
      const popupContent = `
        <div class="popup-container">
          <div class="popup-img-carousel">${fotoHTML || '<p>Nessuna immagine</p>'}</div>
          <div class="popup-info">
            <h4>${codicePerizia}</h4>
            <p class="popup-date">${new Date(dataOra).toLocaleString()}</p>
            <p class="popup-desc">${descrizione}</p>
            <button class="popup-btn" onclick="document.getElementById('dettaglio')?.scrollIntoView({ behavior: 'smooth' })">Dettaglio</button>
          </div>
        </div>
      `;
  
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);
  
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
  
}
