import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private apiUrl = 'http://localhost:3000/api/databases';

  constructor(private http: HttpClient) {}

  getDatabases(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
//Inicio para mostrar tablas
  getTables(databaseName: string) {
  return this.http.get<any[]>(`${this.apiUrl}/${databaseName}/tables`);
}
//Fin para mostrar tablas

}