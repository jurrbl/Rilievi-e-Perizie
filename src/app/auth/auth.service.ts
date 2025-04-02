import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: any = null;
  private perizie : any = null;

  constructor() {
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

  public logout(): void {
    this.user = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // se vuoi rimuovere anche il token
  }

  public isLoggedIn(): boolean {
    return !!this.user;
  }
}
