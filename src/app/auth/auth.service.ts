declare var gapi: any;

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: any = null;
  private perizie: any = null;
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    const savedUser = localStorage.getItem('user');
    if (savedUser) this.user = JSON.parse(savedUser);

    const savedPerizie = localStorage.getItem('perizie');
    if (savedPerizie) this.perizie = JSON.parse(savedPerizie);
  }

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

  public getUsername(): string {
    return this.user?.username || this.user?.googleUsername || '';
  }

  public setPerizie(perizie: any): void {
    this.perizie = perizie;
    localStorage.setItem('perizie', JSON.stringify(perizie));
  }

  public getPerizie(): any[] {
    if (!this.perizie) {
      const savedPerizie = localStorage.getItem('perizie');
      this.perizie = savedPerizie ? JSON.parse(savedPerizie) : [];
    }
    return this.perizie;
  }

  public isLoggedIn(): boolean {
    return !!this.user;
  }

  public register(user: { username: string; email: string; password: string }) {
    return this.http.post('http://localhost:3000/api/auth/register', user, {
      withCredentials: true,
    });
  }

  public forgotPassword(email: string) {
    return this.http.post(
      'http://localhost:3000/api/auth/forgot-password',
      { email },
      { withCredentials: true }
    );
  }

  public logout(): void {
    this.http
      .post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.user = null;
          this.perizie = null;
          localStorage.removeItem('user');
          localStorage.removeItem('perizie');
          console.log('✅ Logout eseguito');
        },
        error: (err) => {
          console.error('❌ Errore durante il logout:', err);
        },
      });

    if (this.isBrowser && typeof gapi !== 'undefined') {
      const auth2 = gapi.auth2.getAuthInstance();
      if (auth2 != null) {
        auth2.signOut().then(() => {
          console.log('Google User signed out.');
          this.cleanLocalData();
        });
      } else {
        this.cleanLocalData();
      }
    } else {
      this.cleanLocalData();
    }
  }

  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('perizie');
    window.location.href = '/login';
  }

  private cleanLocalData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('perizie');
    window.location.href = '/login';
  }
}
