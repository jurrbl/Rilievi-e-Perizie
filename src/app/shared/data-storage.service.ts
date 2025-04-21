  import { HttpClient } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root',
  })
  export class DataStorageService {
    private REST_API_SERVER = 'https://backend-rilievi.onrender.com/api';

    constructor(private httpClient: HttpClient) { }

  public inviaRichiesta(
    method: string,
    resource: string,
    params: any = {}
  ): Observable<Object> | undefined {
    resource = this.REST_API_SERVER + resource;

    const options = {
      withCredentials: true 
    };
  
    switch (method.toLowerCase()) {
      case 'get':
        return this.httpClient.get(resource, { params, ...options });
      case 'delete':
        return this.httpClient.delete(resource, { body: params, ...options });
      case 'post':
        return this.httpClient.post(resource, params, { ...options });
      case 'patch':
        return this.httpClient.patch(resource, params, { ...options });
      case 'put':
        return this.httpClient.put(resource, params, { ...options });
      default:
        return undefined;
    }
  }
}
