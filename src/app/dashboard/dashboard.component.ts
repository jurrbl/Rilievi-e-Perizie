import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  name: string = '';
  role: string = '';
  username: string = '';
  email: string = '';
  phone: string = '';
  profilePicture: string = 'assets/img/default-avatar.png';
  token: string | null = null;
  countPerizie: number = 0;
  lastSeen: string = 'Mai';
  sortOrder: 'asc' | 'desc' = 'desc';
  filtroStato: string = 'tutte';

  cronologiaPerizie: Array<{
    dataOra: Date,
    stato: string,
    dataRevisione?: Date
  }> = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService,
    private dataStorageService: DataStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.handleTokenFromUrl();
    this.populateUserData();
    this.populateCronologiaPerizie();
  }

  private handleTokenFromUrl(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (this.token) {
      localStorage.setItem('token', this.token);
      const cleanUrl = this.route.snapshot.pathFromRoot
        .map(route => route.url.map(segment => segment.toString()).join('/'))
        .join('/');
      this.location.replaceState(cleanUrl);
    }
  }

  private populateUserData(): void {
    const user = this.authService.getUser();

    if (user) {
      this.username = user.username || 'Utente';
      this.email = user.email || '–';
      this.phone = user.phone || '–';
      this.profilePicture = user.profilePicture || 'assets/img/default-avatar.png';
      this.role = user.role || 'Utente';
      this.countPerizie = this.authService.getPerizie()?.length || 0;

      this.lastSeen = user.lastSeen
        ? formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true, locale: it })
        : 'Mai';
    } else {
      this.router.navigate(['/login']);
    }
  }

  private populateCronologiaPerizie(): void {
    const currentUser = this.authService.getUser();
    const tutteLePerizie = this.authService.getPerizie() || [];

    let perizieUtente = tutteLePerizie
      .filter(p => p.codiceOperatore === currentUser._id)
      .map(p => ({
        dataOra: new Date(p.dataOra),
        stato: p.stato,
        dataRevisione: p.dataRevisione ? new Date(p.dataRevisione) : undefined
      }));

    // Filtro per stato (se selezionato)
    if (this.filtroStato !== 'tutte') {
      perizieUtente = perizieUtente.filter(p => p.stato === this.filtroStato);
    }

    // Ordinamento
    this.cronologiaPerizie = perizieUtente.sort((a, b) => {
      const diff = a.dataOra.getTime() - b.dataOra.getTime();
      return this.sortOrder === 'asc' ? diff : -diff;
    });
  }
  cambiaOrdine() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.populateCronologiaPerizie();
  }

  filtraPerStato(stato: string) {
    this.filtroStato = stato;
    this.populateCronologiaPerizie();
  }

  redirectToEmail(email: string): void {
    window.location.href = `mailto:${email}`;
  }
}
