import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-mappa',
  standalone: true,
  templateUrl: './mappa.component.html',
  styleUrls: ['./mappa.component.css']
})
export class MappaComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainerRef!: ElementRef;
  map!: maplibregl.Map;
  perizie: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    const tutte = this.authService.getPerizie();
    this.perizie = (tutte || []).filter((p: any) => p.codiceOperatore === currentUser._id);
  }

  ngAfterViewInit(): void {
    const defaultCenter: [number, number] = [7.6869, 45.0703]; // Torino di default

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
      zoom: 5,
      scrollZoom: false
    });

    this.map.addControl(new maplibregl.NavigationControl());

    // Scroll zoom centrato sulla mappa
    this.map.getCanvas().addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoom = this.map.getZoom();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      this.map.zoomTo(zoom + delta, {
        around: this.map.getCenter()
      });
    }, { passive: false });

    const bounds = new maplibregl.LngLatBounds();

    this.perizie.forEach(perizia => {
      const { codicePerizia, descrizione, coordinate, dataOra } = perizia;
      if (!coordinate?.latitudine || !coordinate?.longitudine) return;

      const lat = Number(coordinate.latitudine);
      const lon = Number(coordinate.longitudine);
      const lngLat: [number, number] = [lon, lat]; // [LON, LAT]

      bounds.extend(lngLat);

      // Elemento DOM custom
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(/marker.png)';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <strong>${codicePerizia}</strong><br/>
        <small>${new Date(dataOra).toLocaleString()}</small><br/>
        ${descrizione}
      `);

      new maplibregl.Marker({ element: el, draggable: false })
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

    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds, {
        padding: 60,
        duration: 1000
      });
    }
  }
}
