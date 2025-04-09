import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Loader, LoaderOptions } from 'google-maps';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './mappa.component.html',
  styleUrls: ['./mappa.component.scss'],
})
export class MappaComponent implements OnInit, OnDestroy {
  loaderOptions: LoaderOptions = {};
  loader = new Loader(environment.googleMapsApiKey, this.loaderOptions);
  map!: google.maps.Map;
  markers: google.maps.Marker[] = [];

  @ViewChild('map', { static: true }) mapElement!: ElementRef;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const perizie = this.authService.getPerizie() || [];

    this.loader.load().then(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.initMap(
            position.coords.latitude,
            position.coords.longitude,
            perizie
          );
        },
        () => {
          // Fallback position
          this.initMap(44.5567, 7.7280, perizie);
        }
      );
    });
  }

  ngOnDestroy(): void {
    for (const marker of this.markers) {
      marker.setMap(null);
    }
    this.markers = [];
  }

  private initMap(
    latitude: number,
    longitude: number,
    perizie: any[]
  ): void {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: latitude, lng: longitude },
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    this.loadMarkers(perizie);

    // ⬇️ Adatta il viewport a tutti i marker
    const bounds = new google.maps.LatLngBounds();

    for (const perizia of perizie) {
      const coord = perizia.coordinate;
      const lat = parseFloat(coord?.latitudine);
      const lng = parseFloat(coord?.longitudine);

      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.extend({ lat, lng });
      }
    }

    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds);
    }
  }


  private loadMarkers(perizie: any[]): void {
    // Rimuovi marker vecchi
    for (const marker of this.markers) {
      marker.setMap(null);
    }
    this.markers = [];

    for (const perizia of perizie) {
      const coord = perizia.coordinate;
      const lat = parseFloat(coord?.latitudine);
      const lng = parseFloat(coord?.longitudine);

      // Salta se le coordinate non sono numeriche valide
      if (isNaN(lat) || isNaN(lng)) continue;

      const marker = new google.maps.Marker({
        map: this.map,
        position: { lat, lng },
        title: perizia.codicePerizia || 'Perizia',
        animation: google.maps.Animation.DROP,
        icon: {
          url:
            perizia?.profilePicture ||
            'https://res.cloudinary.com/dpb6deosa/image/upload/v1741047211/users/zoi1cqhrkuwy6pgwgfgk.png',
          scaledSize: new google.maps.Size(50, 50),
        },
        zIndex: 1000,
        clickable: true,
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <strong>${perizia.codicePerizia}</strong><br>
          ${perizia.descrizione || ''}
        `,
      });

      marker.addListener('click', () => {
        infowindow.open(this.map, marker);
      });
      console.log('Marker:', { lat, lng, codice: perizia.codicePerizia });

      this.markers.push(marker);
    }
  }

}
