import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SangriaRequest {
  valor: number;
  observacao: string;
}

interface AporteRequest {
  valor: number;
  descricao: string;
}

@Injectable({
  providedIn: 'root'
})
export class CaixaService {
  private apiUrl = '/api/caixa';

  constructor(private http: HttpClient) { }

  /**
   * Envia uma requisição para registrar uma sangria no caixa.
   * @param valor O valor a ser retirado.
   * @param observacao O motivo da retirada.
   * @returns Um Observable com a resposta da API.
   */
  realizarSangria(valor: number, observacao: string): Observable<any> {
    const requestBody: SangriaRequest = { valor, observacao };
    return this.http.post<any>(`${this.apiUrl}/sangria`, requestBody);
  }

  getSangrias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sangrias`);
  }

  getSangriasByDateRange(dataInicio: string, dataFim: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sangrias`, {
      params: { dataInicio, dataFim }
    });
  }

  /**
   * Envia uma requisição para registrar um aporte no caixa.
   * @param valor O valor a ser adicionado.
   * @param descricao O motivo da adição.
   * @returns Um Observable com a resposta da API.
   */
  realizarAporte(valor: number, descricao: string): Observable<any> {
    const requestBody: AporteRequest = { valor, descricao };
    return this.http.post<any>(`${this.apiUrl}/aporte`, requestBody);
  }

  getAportes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/aportes`);
  }

  getAportesByDateRange(dataInicio: string, dataFim: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/aportes`, {
      params: { dataInicio, dataFim }
    });
  }
}
