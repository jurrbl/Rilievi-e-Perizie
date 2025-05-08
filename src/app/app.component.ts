import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  sessionErrorCount = 0;

  ngOnInit(): void {
    if (
      this.authService.getSessionErrorCount() >= 2 ||
      this.authService.isSessionCheckDisabled()
    ) {
      console.warn(
        '⛔ Session check disabilitato (tentativi superati o disattivato)'
      );
      return;
    }

    this.authService.checkSession().subscribe({
      next: (user) => {
        console.log('✅ Sessione ancora valida');
        this.authService.setUser(user);
        this.authService.resetSessionErrorCount();

        const role = user.role;
        const isOnLogin =
          this.router.url === '/' || this.router.url === '/login';
        if (isOnLogin) {
          this.router.navigate([
            role === 'admin' ? '/home/dashboard-admin' : '/home/dashboard',
          ]);
        }
      },
      error: (err) => {
        console.log('❌ Sessione scaduta o errore:', err);
        if (err.status === 401) {
          this.authService.incrementSessionErrorCount();
          const count = this.authService.getSessionErrorCount();
          console.warn(`⚠️ Sessione scaduta (tentativo ${count})`);
          if (count >= 2) {
            console.error('❌ Tentativi superati. Interrompo i controlli.');
            this.authService.disableSessionCheck();
          }
        }

        this.authService.clear();
        this.router.navigate(['/login']);
      },
    });
  }
}
