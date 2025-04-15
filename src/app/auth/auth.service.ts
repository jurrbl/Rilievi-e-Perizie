  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Router } from '@angular/router';

  @Injectable({
    providedIn: 'root',
  })
  export class AuthService {
    private user: any = null;
    private perizie: any = null;

    constructor(private http: HttpClient, private router: Router) {}

    public setUser(user: any): void {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    }

    public getUser(): any {
      if (!this.user) {
        const savedUser = localStorage.getItem('user');
        this.user = savedUser ? JSON.parse(savedUser) : null;
      }
      return this.user;
    }


    public register(user: { username: string; email: string; password: string }) {
      return this.http.post('http://localhost:3000/api/auth/register', user, {
        withCredentials: true,
      });
    }


    public getUsername(): string {
      return this.user?.username || this.user?.googleUsername || '';
    }

    public setPerizie(perizie: any): void {
      this.perizie = perizie;
      localStorage.setItem('perizie', JSON.stringify(perizie));
    }

    public getPerizie(): any {
      if (!this.perizie) {
        const savedPerizie = localStorage.getItem('perizie');
        this.perizie = savedPerizie ? JSON.parse(savedPerizie) : null;
      }
      return this.perizie;
    }

    public login(credentials: { email: string; password: string }) {
      return this.http.post('http://localhost:3000/api/auth/login', credentials, {
        withCredentials: true,
      });
    }

    public isLoggedIn(): boolean {
      return !!this.user;
    }

    public forgotPassword(email: string) {
      return this.http.post('http://localhost:3000/api/auth/forgot-password', { email }, { withCredentials: true });
    }

    public logout(): void {
      this.http.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true }).subscribe({
        next: () => {
          this.user = null;
          this.perizie = null;
          localStorage.removeItem('user');
          localStorage.removeItem('perizie');
          console.log('✅ Logout eseguito');
        },
        error: (err) => {
          console.error('❌ Errore durante il logout:', err);
        }
      });
    }

  }
