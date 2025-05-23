import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private apiUrl = 'http://localhost:3000/api/databases';
  foreignKeys: any[] = [];

  constructor(private http: HttpClient) {}

  getDatabases(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
//Inicio para mostrar tablas
  getTables(databaseName: string) {
  return this.http.get<any[]>(`${this.apiUrl}/${databaseName}/tables`);
}
//Fin para mostrar tablas

//Inicio de metodo para mostrar columnas
getColumns(databaseName: string, tableName: string) {
  return this.http.get<any[]>(`${this.apiUrl}/${databaseName}/tables/${tableName}/columns`);
}
//Fin de metodo para mostrar columnas

//Inicio del metodod para mostrar las llaves foraneas
getForeignKeys(database: string) {
  return this.http.get<any[]>(`${this.apiUrl}/databases/${database}/foreign-keys`);
}
//Fin del metodod para mostrar las llaves foraneas

}