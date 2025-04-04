import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-mappa',
  imports: [CommonModule],
  templateUrl: './mappa.component.html',
  styleUrls: ['./mappa.component.css'],
})
export class MappaComponent implements OnInit, AfterViewInit {
  map!: maplibregl.Map;
  allPerizie: any[] = [];
  perizieFiltrate: any[] = [];
  operatori: { id: string; username: string; perizieCount: number; profilePicture: string }[] = [];
  markerRefs: maplibregl.Marker[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const perizie = this.authService.getPerizie() || [];
    const currentUser = this.authService.getUser(); // 👈 unica fonte utenti

    this.allPerizie = perizie;
    this.perizieFiltrate = [...this.allPerizie];

    const operatoriMap = new Map<string, { count: number; username: string; profilePicture: string }>();

    perizie.forEach((p) => {
      const id = p.codiceOperatore;
      const username = currentUser?._id === id
        ? currentUser.username || currentUser.googleUsername
        : 'Operatore';
      const profilePicture = currentUser?._id === id
        ? currentUser.profilePicture
        : 'assets/img/default-avatar.png';

      const existing = operatoriMap.get(id);
      operatoriMap.set(id, {
        count: (existing?.count || 0) + 1,
        username,
        profilePicture
      });
    });

    this.operatori = Array.from(operatoriMap.entries()).map(([id, info]) => ({
      id,
      username: info.username,
      profilePicture: info.profilePicture,
      perizieCount: info.count
    }));
  }

  ngAfterViewInit(): void {
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/dataviz/style.json?key=SGEssAwujZJ0Z6N9ssq7',
      center: [9.1900, 45.4642],
      zoom: 10
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
    this.mostraMarker(this.perizieFiltrate);
  }

  mostraMarker(perizie: any[]) {
    this.markerRefs.forEach((m) => m.remove());
    this.markerRefs = [];
  
    perizie.forEach((p) => {
      const coords = p.coordinate;
      if (!coords?.lat || !coords?.lon) return;
  
      const username = p.operatoreUsername || 'Sconosciuto';
      const foto = p.operatoreFoto || 'assets/img/default-avatar.png';
  
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `<div class="marker-image" style="background-image: url('${foto}')"></div>`;
  
      const marker = new maplibregl.Marker(el)
        .setLngLat([coords.lon, coords.lat])
        .setPopup(
          new maplibregl.Popup().setHTML(`
            <div class="text-white text-sm font-semibold">
              📝 ${p.codicePerizia}<br>
              ${p.descrizione}<br>
              📅 ${new Date(p.dataOra).toLocaleString()}<br>
              🧑 ${username}
            </div>
          `)
        )
        .addTo(this.map);
  
      this.markerRefs.push(marker);
    });
  }
  

  filtraPerUtente(idUtente: string): void {
    this.perizieFiltrate = this.allPerizie.filter(p => p.codiceOperatore === idUtente);
    this.mostraMarker(this.perizieFiltrate);

    if (this.perizieFiltrate.length > 0) {
      const first = this.perizieFiltrate[0].coordinate;
      this.map.flyTo({
        center: [first.lon, first.lat],
        zoom: 13,
        essential: true
      });
    }
  }

  mostraTutti(): void {
    this.perizieFiltrate = [...this.allPerizie];
    this.mostraMarker(this.perizieFiltrate);
    this.map.flyTo({
      center: [9.1900, 45.4642],
      zoom: 10,
      essential: true
    });
  }
}
