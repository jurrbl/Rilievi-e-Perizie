import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: any = null;

  constructor() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      console.log(savedUser)
      console.log('qifsha fisin', JSON.parse(savedUser))
      this.user = JSON.parse(savedUser);
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

  public getUsername(): string {
    return this.user?.username || this.user?.googleUsername || '';
  }

  public logout(): void {
    this.user = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // se vuoi rimuovere anche il token
  }

  public isLoggedIn(): boolean {
    return !!this.user;
  }
}
