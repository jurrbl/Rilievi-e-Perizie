import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  private REST_API_SERVER = 'http://localhost:3000/api';

  constructor(private httpClient: HttpClient) {}

  public inviaRichiesta(
    method: string,
    resource: string,
    params: any = {}
  ): Observable<Object> | undefined {
    resource = this.REST_API_SERVER + resource;
  
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    };
  
    switch (method.toLowerCase()) {
      case 'get':
        return this.httpClient.get(resource, { params: params, headers });
      case 'delete':
        return this.httpClient.delete(resource, { body: params, headers });
      case 'post':
        return this.httpClient.post(resource, params, { headers });
      case 'patch':
        return this.httpClient.patch(resource, params, { headers });
      case 'put':
        return this.httpClient.put(resource, params, { headers });
        
      default:
        return undefined;
    }
  }
}
