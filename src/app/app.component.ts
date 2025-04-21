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

  ngOnInit(): void {
    this.authService.checkGoogleSession().subscribe({
      next: (user) => {
        this.authService.setUser(user);
        const role = user.role;
        const isOnLogin = this.router.url === '/' || this.router.url === '/login';

        if (isOnLogin) {
          this.router.navigate([role === 'admin' ? '/home/dashboard-admin' : '/home/dashboard']);
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
