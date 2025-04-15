  import { HttpClient } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root',
  })
  export class DataStorageService {
    private REST_API_SERVER = 'http://localhost:3000/api';

    constructor(private httpClient: HttpClient) { }

    public inviaRichiesta(
      method: string,
      resource: string,
      params: any = {}
    ): Observable<Object> | undefined {
      const url = `${this.REST_API_SERVER}${resource}`;

      switch (method.toLowerCase()) {
        case 'get':
          return this.httpClient.get(url, {
            params,
            withCredentials: true,
          });

        case 'delete':
          return this.httpClient.delete(url, {
            body: params,
            withCredentials: true,
          });

        case 'post':
          return this.httpClient.post(url, params, {
            withCredentials: true,
          });

        case 'patch':
          return this.httpClient.patch(url, params, {
            withCredentials: true,
          });

        case 'put':
          return this.httpClient.put(url, params, {
            withCredentials: true,
          });

        default:
          return undefined;
      }
    }
  }
  