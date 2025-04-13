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
    setTimeout(() => {
      const el = document.getElementById('dettaglio');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  renderMarkers() {
    if (!this.map) return;

    // Rimuovi marker precedenti (opzionale)
    const markerElements = document.querySelectorAll('.maplibregl-marker');
    markerElements.forEach(el => el.remove());

    const bounds = new maplibregl.LngLatBounds();

    this.perizieFiltrate.forEach(perizia => {
      const { codicePerizia, descrizione, coordinate, dataOra } = perizia;
      if (!coordinate?.latitudine || !coordinate?.longitudine) return;

      const lat = Number(coordinate.latitudine);
      const lon = Number(coordinate.longitudine);
      const lngLat: [number, number] = [lon, lat];

      bounds.extend(lngLat);

      const el = document.createElement('span');
      el.className = 'material-icons';
      el.textContent = 'place';
      el.style.fontSize = '36px';
      el.style.color = '#e53935';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <strong>${codicePerizia}</strong><br/>
        <small>${new Date(dataOra).toLocaleString()}</small><br/>
        ${descrizione}
      `);

      new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(this.map);

      el.addEventListener('click', () => {
        this.map.flyTo({ center: lngLat, zoom: 16, speed: 1.2, curve: 1 });
      });
    });

    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds, { padding: 60, duration: 1000 });
    }
  }
}
