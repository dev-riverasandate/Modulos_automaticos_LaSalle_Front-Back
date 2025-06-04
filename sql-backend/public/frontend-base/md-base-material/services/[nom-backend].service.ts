import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { [Modulocamel]Item } from '../interfaces/[nom-backend].interface';

@Injectable({ providedIn: 'root' })
export class [Modulocamel]Service {
  private apiUrl = '[BACKEND_URL]';

  constructor(private http: HttpClient) {}

  getAll(): Observable<[Modulocamel]Item[]> {
    return this.http.get<[Modulocamel]Item[]>(this.apiUrl);
  }

  create(item: Omit<[Modulocamel]Item, '[PRIMARY_KEY]'>): Observable<[Modulocamel]Item> {
    return this.http.post<[Modulocamel]Item>(this.apiUrl, item);
  }

  update(id: number, item: Omit<[Modulocamel]Item, '[PRIMARY_KEY]'>): Observable<[Modulocamel]Item> {
    return this.http.put<[Modulocamel]Item>(`${this.apiUrl}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}