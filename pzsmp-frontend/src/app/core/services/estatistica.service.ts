import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstatisticaProduto {
  nomeProduto: string;
  quantidadeTotal: number;
  valorTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstatisticaService {
  // REMOVIDO: environment.apiUrl
  // ADICIONADO: Caminho relativo direto, igual ao ClienteService
  private apiUrl = '/api/estatisticas';

  constructor(private http: HttpClient) {}

  getMaisVendidos(inicio?: string, fim?: string): Observable<EstatisticaProduto[]> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fim) params = params.set('fim', fim);

    return this.http.get<EstatisticaProduto[]>(`${this.apiUrl}/mais-vendidos`, { params });
  }
}