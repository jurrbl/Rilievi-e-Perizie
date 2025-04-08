import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-mappa',
  standalone: true,
  templateUrl: './mappa.component.html',
  styleUrls: ['./mappa.component.css']
})
export class MappaComponent implements OnInit, AfterViewInit {
  map!: maplibregl.Map;
  markerRefs: maplibregl.Marker[] = [];
  perizie: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    const tutteLePerizie = this.authService.getPerizie() || [];

    this.perizie = tutteLePerizie.filter(
      (p: any) => p.codiceOperatore === currentUser._id
    );
  }

  ngAfterViewInit(): void {
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/dataviz/style.json?key=SGEssAwujZJ0Z6N9ssq7',
      center: [9.1900, 45.4642],
      zoom: 10
    });

    // Disabilitare lo zoom con scroll per non perdere accidentalmente i marker
    this.map.scrollZoom.disable();

    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
    this.mostraMarker();
  }

  mostraMarker(): void {
    this.markerRefs.forEach((marker) => marker.remove());
    this.markerRefs = [];

    this.perizie.forEach((perizia) => {
      const { coordinate, codicePerizia, descrizione, dataOra } = perizia;

      if (!coordinate || !coordinate.latitudine || !coordinate.longitudine) return;

      const markerElement = document.createElement('div');
      markerElement.className = 'marker';
      markerElement.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/684/684908.png)';
      markerElement.style.backgroundSize = 'cover';
      markerElement.style.width = '40px';
      markerElement.style.height = '40px';
      markerElement.style.backgroundPosition = 'center';

      const marker = new maplibregl.Marker({ element: markerElement })
        .setLngLat([coordinate.longitudine, coordinate.latitudine])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div class="text-white text-sm font-semibold">
              📝 <strong>${codicePerizia}</strong><br>
              📅 ${new Date(dataOra).toLocaleString()}<br>
              🗒️ ${descrizione}
            </div>
          `)
        )
        .addTo(this.map);

      this.markerRefs.push(marker);
    });

    if (this.perizie.length > 0) {
      const firstPerizia = this.perizie[0];
      this.map.flyTo({
        center: [firstPerizia.coordinate.longitudine, firstPerizia.coordinate.latitudine],
        zoom: 13,
        essential: true
      });
    }
  }
}
