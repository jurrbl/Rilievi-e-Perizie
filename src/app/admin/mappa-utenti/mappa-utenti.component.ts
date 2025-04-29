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
  userImage: string | null = null;
  perizieFiltrate: any[] = [];
  periziaSelezionata: any = null;
  utenteAttivo: any = null;
  popupAperti: maplibregl.Popup[] = [];
  immagineIngrandita: string | null = null;
  
  constructor(private authService: AuthService, private ngZone: NgZone, private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    this.userImage = this.authService.getUser().profilePicture;
    console.log('User:', this.userImage);
  
    this.route.queryParams.subscribe(params => {
      this.authService.fetchPerizieAdmin().subscribe({
        next: (response) => {
          const tutteLePerizie = response.perizie || [];
  
          this.authService.fetchUtentiCompleti().subscribe({
            next: (utenti) => {
              this.utenti = utenti.map(u => {
                const perizieUtente = this.perizieTotali.filter(p => 
                  p.codiceOperatore?.toString() === u._id
                );
                
                return {
                  ...u,
                  numeroPerizie: perizieUtente.length
                };
              });
              
  
              // 🔥 Filtra solo perizie degli utenti (no admin)
              const utentiId = utenti.map(u => u._id);
              this.perizieTotali = tutteLePerizie.filter(p => utentiId.includes(p.codiceOperatore?.toString()));
              
              // Ora puoi contare bene
              this.utenti = utenti.map(u => {
                const perizieUtente = this.perizieTotali.filter(p => 
                  p.codiceOperatore?.toString() === u._id
                );
                
                return {
                  ...u,
                  numeroPerizie: perizieUtente.length
                };
              });
              // 🔥 Al primo caricamento mostra tutte
              this.perizieFiltrate = [...this.perizieTotali];
  
              setTimeout(() => this.renderMarkers(), 0);
            }
          });
        }
      });
    });
  }
  
  
  ngAfterViewInit(): void {
    const defaultCenter: [number, number] = [7.7361193837862015, 44.55599213612909]; // Sede
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
      zoom: 10, // 🔥 più zoomato
      attributionControl: false
    });
  
    this.map.addControl(new maplibregl.NavigationControl());
    this.aggiungiMarkerSede();
  }
  
  aggiungiMarkerSede(): void {
    const sedeLat = 44.55599213612909;
    const sedeLon = 7.7361193837862015;

    const sedeEl = document.createElement('div');
    sedeEl.classList.add('marker-sede');
    sedeEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="#27272a" viewBox="0 0 24 24" width="40" height="40">
        <path d="M4 22h16V2L4 8v14zm2-2v-6h4v6H6zm6 0v-6h4v6h-4zm6 0v-8h2v8h-2zM4 20v-9.5l14-5.25V4.5L4 10V20z"/>
      </svg>
    `;
    sedeEl.style.cursor = 'default';

    new maplibregl.Marker({ element: sedeEl })
      .setLngLat([sedeLon, sedeLat])
      .setPopup(
        new maplibregl.Popup({ offset: 25 })
          .setHTML('<div class="text-white">🏢 Sede Ufficio<br>Via San Michele, 68</div>')
      )
      .addTo(this.map);
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
    this.chiudiPopupAperti();
    this.perizieFiltrate = [...this.perizieTotali];
    this.utenteAttivo = null; // 🔥 quando clicchi "Mostra Tutte" DESELEZIONI l'utente!
    this.periziaSelezionata = null;
    setTimeout(() => this.renderMarkers(), 0);
  }

  filtraPerizie(stato: string): void {
    this.chiudiPopupAperti();
    if (this.utenteAttivo) {
      const id = this.utenteAttivo._id.toString();
      this.perizieFiltrate = this.perizieTotali.filter(
        (p) => p.codiceOperatore?.toString() === id && p.stato === stato
      );
    } else {
      this.perizieFiltrate = this.perizieTotali.filter(
        (p) => p.stato === stato
      );
    }
    this.periziaSelezionata = null;
    setTimeout(() => this.renderMarkers(), 0);
  }

  renderMarkers(): void {
    if (!this.map) return;
  
    // 🔵 Pulisce tutti i marker precedenti
    const markerElements = document.querySelectorAll('.maplibregl-marker');
    markerElements.forEach(el => el.remove());
  
    const bounds = new maplibregl.LngLatBounds();
    let markerCount = 0;
  
    this.perizieFiltrate.forEach(perizia => {
      const { codicePerizia, descrizione, coordinate, dataOra, codiceOperatore } = perizia;
      if (!coordinate || !codiceOperatore) return;
  
      const lat = parseFloat(coordinate.latitudine);
      const lon = parseFloat(coordinate.longitudine);
      if (isNaN(lat) || isNaN(lon)) return;
  
      // 🎯 Aggiungiamo un offset casuale molto piccolo per non sovrapporre marker identici
      const offsetLat = (Math.random() - 0.5) * 0.0006;
      const offsetLon = (Math.random() - 0.5) * 0.0006;
      const lngLat: [number, number] = [lon + offsetLon, lat + offsetLat];
  
      const user = this.utenti.find(u => u._id === codiceOperatore.toString());
      const userImage = user?.profilePicture || '/assets/default-profile.jpg';
  
      bounds.extend(lngLat);
      markerCount++;
  
      const markerEl = document.createElement('div');
      markerEl.style.width = '40px';
      markerEl.style.height = '40px';
      markerEl.style.backgroundImage = 'url("https://cdn-icons-png.flaticon.com/512/149/149071.png")';
      markerEl.style.backgroundSize = 'cover';
      markerEl.style.backgroundPosition = 'center';
      markerEl.style.borderRadius = '50%';
      markerEl.style.overflow = 'hidden';
      markerEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      markerEl.style.border = '2px solid white';
      markerEl.style.cursor = 'pointer';

  
      const punta = document.createElement('div');
      punta.style.width = '12px';
      punta.style.height = '12px';
      punta.style.backgroundColor = 'white';
      punta.style.position = 'absolute';
      punta.style.bottom = '-6px';
      punta.style.left = '50%';
      punta.style.transform = 'translateX(-50%) rotate(45deg)';
      punta.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      punta.style.zIndex = '0';
  
      const img = document.createElement('img');
      img.src = userImage;
      img.alt = 'Foto';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.position = 'relative';
      img.style.zIndex = '1';
      img.onerror = () => { img.style.display = 'none'; };
  
      markerEl.appendChild(img);
      markerEl.appendChild(punta);
  
      const distanzaKm = this.calcolaDistanza(44.55599213612909, 7.7361193837862015, lat, lon);
  
      const popupContent = `
        <div style="background-color: #111; color: white; padding: 16px; border-radius: 8px; max-width: 280px; font-family: 'Poppins', sans-serif;">
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
            <p><strong>ID:</strong> ${codicePerizia}</p>
            <p><strong>Data:</strong> ${new Date(dataOra).toLocaleString()}</p>
            <p><strong>Descrizione:</strong> ${descrizione}</p>
            <p><strong>Distanza dalla sede:</strong> ${distanzaKm} km</p>
            <button 
              style="background-color: black; color: white; border: 1px solid white; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;"
              onmouseover="this.style.backgroundColor='white';this.style.color='black';"
              onmouseout="this.style.backgroundColor='black';this.style.color='white';"
              class="popup-btn"
              data-id="${codicePerizia}">
              Dettagli
            </button>
          </div>
        </div>
      `;
  
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);
  
      new maplibregl.Marker({ element: markerEl })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(this.map);
  
      markerEl.addEventListener('click', () => {
        this.map.flyTo({
          center: lngLat,
          zoom: 16,
          speed: 1.2,
          curve: 1
        });
      });
  
      popup.on('open', () => {
        setTimeout(() => {
          const btn = document.querySelector(`.popup-btn[data-id="${codicePerizia}"]`);
          if (btn) {
            btn.addEventListener('click', () => {
              this.vaiAlDettaglio(perizia);
            });
          }
        }, 0);
      });
    });
  
    if (markerCount > 0) {
      this.map.fitBounds(bounds, { padding: 80, duration: 1000 });
    } else {
      console.warn('Nessun marker valido da visualizzare.');
    }
  }
  
  
  
  
  calcolaDistanza(lat1: number, lon1: number, lat2: number, lon2: number): string {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
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
  
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      alert('Utente non autenticato.');
      return;
    }
  
    const { _id, descrizione, coordinate, indirizzo, fotografie, revisioneAdmin, commentoAdmin } = this.periziaSelezionata;
  
    this.authService
      .updatePerizia(_id, {
        descrizione,
        coordinate,
        indirizzo,
        fotografie,
        revisioneAdmin,
        commentoAdmin,
        aggiornatoDa: {
          id: currentUser._id,
          username: currentUser.username,
          profilePicture: currentUser.profilePicture || ''
        }
      })
      .subscribe({
        next: (res: any) => {
          alert('✅ Modifiche salvate con successo');
          const index = this.perizieTotali.findIndex(p => p._id === _id);
          if (index !== -1) {
            this.perizieTotali[index] = { ...this.perizieTotali[index], ...res };
          }
          if (this.periziaSelezionata._id === res._id) {
            this.periziaSelezionata = { ...this.periziaSelezionata, ...res };
          }
        },
        error: () => alert('❌ Errore durante il salvataggio')
      });
  }
  
  aggiornaStato(stato: string): void {
    if (!this.periziaSelezionata) return;
  
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      alert('Utente non autenticato.');
      return;
    }
  
    this.authService
      .updatePerizia(this.periziaSelezionata._id, {
        stato,
        aggiornatoDa: {
          id: currentUser._id,
          username: currentUser.username,
          profilePicture: currentUser.profilePicture || ''
        }
      })
      .subscribe({
        next: () => {
          alert(`✅ Stato aggiornato a ${stato}`);
          this.periziaSelezionata.stato = stato;
        },
        error: () => alert('❌ Errore durante aggiornamento stato')
      });
  }
  
  chiudiPopupAperti(): void { this.popupAperti.forEach(p => p.remove()); this.popupAperti = []; }
  chiudiImmagine(): void { this.immagineIngrandita = null; const modal = document.querySelector('#modalContainer') as HTMLElement; if (modal) modal.style.display = 'none'; }
  hideImage(event: Event) { const target = event.target as HTMLImageElement; if (target) target.style.display = 'none'; }
}
