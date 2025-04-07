import { Component, AfterViewInit, OnInit } from '@angular/core';
import maplibregl from 'maplibre-gl';
import { AuthService } from '../auth/auth.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-mappa',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './mappa.component.html',
  styleUrls: ['./mappa.component.css'],
})
export class MappaComponent implements OnInit, AfterViewInit {
  map: any;
  perizie: any[] = [];
  markerList: any[] = [];
  filtroOperatore: string | null = null;

  operatori: {
    [key: string]: { count: number; profilePicture: string; username: string };
  } = {};
  operatoriUnici: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const perizieRaw = this.authService.getPerizie();
    this.perizie = Array.isArray(perizieRaw) ? perizieRaw : [];
    this.contaOperatori();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  contaOperatori(): void {
    this.operatori = {};
    this.operatoriUnici = [];

    const currentUser = this.authService.getUser();

    this.perizie.forEach(p => {
      const id = p.codiceOperatore?.$oid || p.codiceOperatore;
      const isCurrentUser = currentUser && currentUser._id === id;

      const username = isCurrentUser
        ? currentUser.username || currentUser.googleUsername
        : 'Sconosciuto';

      const profilePicture = isCurrentUser
        ? currentUser.profilePicture
        : 'https://via.placeholder.com/32';

      if (!this.operatori[id]) {
        this.operatori[id] = {
          count: 1,
          profilePicture,
          username,
        };
        this.operatoriUnici.push(id);
      } else {
        this.operatori[id].count++;
      }
    });
  }

  initMap(): void {
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/dataviz/style.json?key=SGEssAwujZJ0Z6N9ssq7',
      center: [9.2415, 45.4642],
      zoom: 6,
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
    this.aggiungiMarker();
  }

  aggiungiMarker(): void {
    if (!this.map) return;
  
    this.markerList.forEach(m => m.remove());
    this.markerList = [];
  
    const bounds = new maplibregl.LngLatBounds();
  
    this.perizie.forEach(perizia => {
      const coord = perizia.coordinate;
      if (!coord?.lat || !coord?.lon) return;
  
      bounds.extend([coord.lon, coord.lat]);
  
      const el = document.createElement('div');
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/684/684908.png)';
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.transform = 'translate(-50%, -100%)';
      el.style.position = 'absolute';
  
      const popup = new maplibregl.Popup({ offset: 30 }).setHTML(`
        <div class="text-sm font-medium">${perizia.descrizione || 'Perizia senza descrizione'}</div>
      `);
  
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([coord.lon, coord.lat])
        .setPopup(popup)
        .addTo(this.map);
  
      this.markerList.push(marker);
    });
  
    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds, { padding: 50 });
    } else {
      console.warn('Bounds vuoti, impossibile adattare la mappa.');
    }
  }

  filtraPerOperatore(op: string): void {
    this.filtroOperatore = op;

    const perizia = this.perizie.find(p => {
      const id = p.codiceOperatore?.$oid || p.codiceOperatore;
      return id === op;
    });

    if (perizia?.coordinate?.lat && perizia.coordinate.lon && this.map) {
      this.map.flyTo({
        center: [perizia.coordinate.lon, perizia.coordinate.lat],
        zoom: 13,
        speed: 1.2,
        curve: 1,
        essential: true,
      });

      this.map.once('moveend', () => {
        this.aggiungiMarker();
        this.markerList[0]?.togglePopup();
      });
    }
  }

  mostraTutte(): void {
    this.filtroOperatore = null;
    this.aggiungiMarker();
  }
}
