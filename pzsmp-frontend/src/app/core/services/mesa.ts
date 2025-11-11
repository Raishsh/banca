import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mesa } from '../models/mesa.model';

@Injectable({
  providedIn: 'root'
})
export class MesaService {
  private apiUrl = '/api/mesas';

  constructor(private http: HttpClient) { }

  getMesas(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(this.apiUrl);
  }

  getMesaPorNumero(numero: number): Observable<Mesa> {
    return this.http.get<Mesa>(`${this.apiUrl}/${numero}`);
  }
}
