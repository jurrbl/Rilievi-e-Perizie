declare var gapi: any;

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

    // ✅ Sicuro: JSON.parse protetto
    const savedUser = localStorage.getItem('user');
    try {
      this.user = savedUser ? JSON.parse(savedUser) : null;
    } catch (err) {
      console.warn('⚠️ Errore parsing user:', err);
      localStorage.removeItem('user');
    }

    const savedPerizie = localStorage.getItem('perizie');
    try {
      this.perizie = savedPerizie ? JSON.parse(savedPerizie) : null;
    } catch (err) {
      console.warn('⚠️ Errore parsing perizie:', err);
      localStorage.removeItem('perizie');
    }
  }

  public setUser(user: any): void {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  public checkGoogleSession() {
    return this.http.get<any>('http://localhost:3000/api/auth/me', {
      withCredentials: true,
    });
  }
  public fetchPerizieTotali(): Observable<{ perizie: any[], nPerizie: number }> {
    return this.http.get<{ perizie: any[], nPerizie: number }>(
      'http://localhost:3000/api/operator/perizie',
      { withCredentials: true }
    );
  }

  public fetchUtentiCompleti() {
    return this.http.get<any[]>('http://localhost:3000/api/operator/users', {
      withCredentials: true
    });
  }

  public getUser(): any {
    if (!this.user) {
      const savedUser = localStorage.getItem('user');
      try {
        this.user = savedUser ? JSON.parse(savedUser) : null;
      } catch (err) {
        localStorage.removeItem('user');
        this.user = null;
      }
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
      try {
        this.perizie = savedPerizie ? JSON.parse(savedPerizie) : [];
      } catch (err) {
        localStorage.removeItem('perizie');
        this.perizie = [];
      }
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

  public login(user: { email: string; password: string }) {
    return this.http.post('http://localhost:3000/api/auth/login', user, {
      withCredentials: true,
    });
  }

  public getMe() {
    return this.http.get('http://localhost:3000/api/auth/me', {
      withCredentials: true,
    });
  }

  public fetchPerizie() {
    return this.http.get('http://localhost:3000/api/operator/perizie', {
      withCredentials: true,
    });
  }
  public fetchPerizieAdmin(): Observable<{ perizie: any[], nPerizie: number }> {
    return this.http.get<{ perizie: any[], nPerizie: number }>(
      'http://localhost:3000/api/admin/all-perizie',
      { withCredentials: true }
    );
  }
  
  public updatePerizia(id: string, data: any) {
    return this.http.put(`http://localhost:3000/api/admin/perizie/${id}`, data, {
      withCredentials: true
    });
  }
  
  public forgotPassword(email: string) {
    return this.http.post(
      'http://localhost:3000/api/auth/forgot-password',
      { email },
      { withCredentials: true }
    );
  }

  public resetPassword(data: {
    token: string;
    email: string;
    nuovaPassword: string;
  }) {
    return this.http.post(
      'http://localhost:3000/api/auth/reset-password',
      data,
      { withCredentials: true }
    );
  }

  public logout(): void {
    this.http
      .get('http://localhost:3000/api/auth/logout', { withCredentials: true })
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

    // Google logout
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

  public getAllUsers(): any[] {
    const saved = localStorage.getItem('utenti');
    return saved ? JSON.parse(saved) : [];
  }



  public fetchUtenti(): void {
    this.http.get<any[]>('http://localhost:3000/api/admin/users', {
      withCredentials: true,
    }).subscribe({
      next: (utenti) => {
        localStorage.setItem('utenti', JSON.stringify(utenti));
      },
      error: (err) => {
        console.error('❌ Errore nel caricamento utenti:', err);
      }
    });
  }

  // ✅ Recupera utenti dal localStorage (fallback incluso)
  public getUtenti(): any[] {
    const saved = localStorage.getItem('utenti');
    return saved ? JSON.parse(saved) : [];
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
