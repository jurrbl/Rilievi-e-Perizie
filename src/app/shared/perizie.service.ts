import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Perizia {
  codicePerizia: string;
  dataOra: Date;
  coordinate: {
    latitudine: number;
    longitudine: number;
  };
  descrizione: string;
  stato: 'in_corso' | 'completata' | 'annullata';
}
@Injectable({
  providedIn: 'root'
})
export class PerizieService {
  private apiUrl = 'http://localhost:3000/api/auth/perizie';

  constructor(private http: HttpClient) {}

  getPerizie(): Observable<{ perizie: Perizia[] }> {
    return this.http.get<{ perizie: Perizia[] }>(this.apiUrl);
  }
  salvaPerizia(perizia: any) {
    return this.http.post<any>('http://localhost:3000/api/auth/addPerizie', perizia).toPromise();


  }
  
}
