import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  // URL da API de reservas
  private apiUrl = '/api/reservas';

  constructor(private http: HttpClient) { }

  /**
   * Envia os dados de uma nova reserva simplificada para a API.
   * @param reservaData Objeto contendo idMesa, nomeReserva, etc.
   */
  fazerReserva(reservaData: any): Observable<any> {
    return this.http.post(this.apiUrl, reservaData);
  }

  /**
   * Cancela uma reserva existente.
   * @param idReserva ID da reserva a ser cancelada
   */
  cancelarReserva(idReserva: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idReserva}/cancelar`, {});
  }

  /**
   * Busca reservas ativas para uma mesa específica.
   * @param numeroMesa Número da mesa
   */
  getReservasPorMesa(numeroMesa: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mesa/${numeroMesa}`);
  }
}
