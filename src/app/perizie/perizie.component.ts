import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PerizieService } from '../shared/perizie.service';

@Component({
  selector: 'app-perizie-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perizie.component.html',
})
export class PerizieComponent implements OnInit {
  search = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);
  perPage = 5;
  Math = Math;
  notificaSuccesso = false;
  messaggioAlert: string = '';
  alertSuccesso: boolean = true;
  perizie: any[] = [];
  selectedPerizia: any = null;
  immaginiSelezionate: { file: File, commento: string }[] = [];

  modificaInCorso: string | null = null;
  periziaModificata: any = {};
  periziaModifica: any = null;
  lightboxUrl: string | null = null;

  nuovaPerizia: any = {
    indirizzo: '',
    dataOra: '',
    descrizione: '',
    stato: ''
  };

  constructor(
    private authService: AuthService,
    private perizieService: PerizieService,
    private dataStorage: DataStorageService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      localStorage.setItem('token', token);
      const urlWithoutToken = this.route.snapshot.pathFromRoot
        .map(route => route.url.map(segment => segment.toString()).join('/'))
        .join('/');
      this.location.replaceState(urlWithoutToken);
    }

    const perizieRaw = this.authService.getPerizie();
    if (perizieRaw && Array.isArray(perizieRaw)) {
      this.perizie = perizieRaw.map((p: any) => ({
        ...p,
        dataOra: new Date(p.dataOra)
      }));
    }
  }

  avviaModifica(perizia: any) {
    this.periziaModifica = { ...perizia };
  }

  annullaModifica() {
    this.periziaModifica = null;
  }

  async salvaModifica() {
    try {
      const aggiornata = await this.dataStorage.inviaRichiesta('put', `/auth/perizie/${this.periziaModifica._id}`, {
        descrizione: this.periziaModifica.descrizione,
        indirizzo: this.periziaModifica.indirizzo
      })?.toPromise();
  
      const index = this.perizie.findIndex(p => p._id === this.periziaModifica._id);
      if (index !== -1) {
        this.perizie[index] = {
          ...this.perizie[index],
          ...this.periziaModifica
        };
      }
      this.authService.setPerizie(this.perizie);
      this.messaggioAlert = 'Perizia modificata con successo!';
      this.alertSuccesso = true;
      this.periziaModifica = null;
      setTimeout(() => this.messaggioAlert = '', 4000);
    } catch (err) {
      console.error('❌ Errore durante la modifica:', err);
      this.messaggioAlert = 'Errore durante la modifica.';
      this.alertSuccesso = false;
      setTimeout(() => this.messaggioAlert = '', 4000);
    }
  }

  async eliminaPerizia(id: string) {
    try {
      await this.dataStorage.inviaRichiesta('delete', `/auth/perizie/${id}`)?.toPromise();
      this.perizie = this.perizie.filter(p => p._id !== id);
      // forza il refresh
      this.perizie = [...this.perizie];
      this.authService.setPerizie(this.perizie);
  
      this.messaggioAlert = 'Perizia eliminata con successo!';
      this.alertSuccesso = true;
      setTimeout(() => this.messaggioAlert = '', 4000);
    } catch (err) {
      console.error('❌ Errore durante l’eliminazione:', err);
      this.messaggioAlert = 'Errore durante l’eliminazione.';
      this.alertSuccesso = false;
      setTimeout(() => this.messaggioAlert = '', 4000);
    }
  }
  

  async aggiungiPerizia() {
    try {
      const { indirizzo, dataOra, descrizione, stato } = this.nuovaPerizia;
      const currentUser = this.authService.getUser();
      const coords = await this.getCoordinateDaIndirizzo(indirizzo);

      const immaginiUploadate = await Promise.all(
        this.immaginiSelezionate.map(async (img) => {
          const url = await this.uploadToCloudinary(img.file);
          return { url, commento: img.commento };
        })
      );

      const nuova = {
        coordinate: coords,
        dataOra,
        descrizione,
        stato,
        indirizzo,
        codiceOperatore: currentUser._id,
        fotografie: []
      };

      const nuovaSalvata: any = await this.perizieService.salvaPerizia(nuova);
      const periziaId = nuovaSalvata._id;

      this.perizie.unshift({
        ...nuovaSalvata,
        dataOra: new Date(nuovaSalvata.dataOra)
      });
      this.authService.setPerizie(this.perizie);

      for (const img of immaginiUploadate) {
        await this.dataStorage.inviaRichiesta('post', `/auth/perizie/${periziaId}/foto`, {
          url: img.url,
          commento: img.commento
        })?.toPromise();
      }

      this.messaggioAlert = 'Perizia aggiunta con successo!';
      this.alertSuccesso = true;
      this.immaginiSelezionate = [];
      this.nuovaPerizia = { indirizzo: '', dataOra: '', descrizione: '', stato: '' };
      this.currentPage.set(1);
      setTimeout(() => (this.messaggioAlert = ''), 5000);

    } catch (error: any) {
      console.error('❌ Errore nel salvataggio:', error);
      this.messaggioAlert = error.message || 'Errore durante il salvataggio';
      this.alertSuccesso = false;
      setTimeout(() => (this.messaggioAlert = ''), 5000);
    }
  }

  async uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'rilievi_preset');
    const response = await fetch('https://api.cloudinary.com/v1_1/dvkczvtfs/image/upload', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!data.secure_url) throw new Error('Upload immagine fallito');
    return data.secure_url;
  }

  async onFotoChange(event: Event, periziaId: string) {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement?.files?.length) return;

    for (let i = 0; i < inputElement.files.length; i++) {
      const file = inputElement.files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'rilievi_preset');

      try {
        const uploadRes = await fetch('https://api.cloudinary.com/v1_1/dvkczvtfs/image/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        const url = uploadData.secure_url;
        const commento = prompt(`Commento per l'immagine ${file.name}:`) || '';

        this.dataStorage.inviaRichiesta('post', `/auth/perizie/${periziaId}/foto`, {
          url,
          commento
        })?.subscribe({
          next: () => console.log('✅ Foto salvata nel backend'),
          error: (err) => console.error('❌ Errore salvataggio foto:', err)
        });

      } catch (err) {
        console.error('❌ Errore durante upload su Cloudinary:', err);
      }
    }
  }

  async getCoordinateDaIndirizzo(indirizzo: string): Promise<{ latitudine: number, longitudine: number }> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(indirizzo)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.length) throw new Error('Indirizzo non trovato');
    return {
      latitudine: parseFloat(data[0].lat),
      longitudine: parseFloat(data[0].lon)
    };
  }

  apriLightbox(url: string) {
    this.lightboxUrl = url;
  }

  chiudiLightbox() {
    this.lightboxUrl = null;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      this.immaginiSelezionate = Array.from(input.files).map(file => ({
        file,
        commento: ''
      }));
    }
  }

  vaiAllaMappa() {
    this.router.navigate(['/mappa']);
  }

  filtered = computed(() => {
    const searchTerm = this.search().toLowerCase().trim();
    const statusFilter = this.selectedStatus();
    return this.perizie.filter(p =>
      (p.codicePerizia?.toLowerCase().includes(searchTerm) ||
        p.descrizione?.toLowerCase().includes(searchTerm)) &&
      (statusFilter === '' || p.stato === statusFilter)
    );
  });

  paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.perPage;
    return this.filtered().slice(start, start + this.perPage);
  });

  totalPages = computed(() =>
    Math.ceil(this.filtered().length / this.perPage)
  );

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  updateSearch(value: string) {
    this.search.set(value);
  }

  updateStatus(value: string) {
    this.selectedStatus.set(value);
  }

  mostraDettagli(perizia: any) {
    this.selectedPerizia = perizia;
  }

  chiudiDettagli() {
    this.selectedPerizia = null;
  }
}
