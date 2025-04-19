declare var gapi: any;

import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject,PLATFORM_ID  } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: any = null;
  private perizie : any = null;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      console.log(savedUser)
      console.log('qifsha fisin', JSON.parse(savedUser))
      this.user = JSON.parse(savedUser);
    }
    const savedPerizie = localStorage.getItem('perizie');
    if (savedPerizie) {
      console.log(savedPerizie)
      console.log('ropt te tuj', JSON.parse(savedPerizie))
      this.perizie = JSON.parse(savedPerizie);
    }
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

  public getPerizie() : any{
    if(!this.perizie)
    {
      const savedPerizie = localStorage.getItem('perizie');
      this.perizie = savedPerizie ? JSON.parse(savedPerizie) : null;
    }
    return this.perizie;
  }


  public setPerizie(perizie: any): void {
    this.perizie = perizie;
    localStorage.setItem('perizie', JSON.stringify(perizie));
  }

  public getUsername(): string {
    return this.user?.username || this.user?.googleUsername || '';
  }

  
  logout(): void {
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
    window.location.href = '/login';
  }

  public isLoggedIn(): boolean {
    return !!this.user;
  }
}
