import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = '/api/pedidos';

  constructor(private http: HttpClient) { }

  /**
   * Busca todos os pedidos na API.
   */
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  /**
   * Busca todos os pedidos ativos de uma mesa específica.
   */
  getPedidosPorMesa(numeroMesa: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/mesa/${numeroMesa}`);
  }

  /**
   * Envia os dados de um novo pedido para a API.
   */
  realizarPedido(pedidoData: any): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedidoData);
  }

  /**
   * Envia uma requisição para atualizar o status de um pedido.
   */
  atualizarStatus(id: number, novoStatus: string): Observable<Pedido> {
    const requestBody = { novoStatus: novoStatus };
    return this.http.put<Pedido>(`${this.apiUrl}/${id}/status`, requestBody);
  }

  /**
   * Envia uma lista de novos itens para serem adicionados a um pedido existente.
   */
  // =======================================================
  // == MUDANÇA AQUI: O TIPO DE 'itens' FOI ATUALIZADO ==
  // =======================================================
  adicionarItensAoPedido(pedidoId: number, itens: { idsSabores: number[], quantidade: number }[]): Observable<Pedido> {
    const requestBody = { itens: itens };
    return this.http.post<Pedido>(`${this.apiUrl}/${pedidoId}/itens`, requestBody);
  }
  // =======================================================


  getRelatorios(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/relatorios`);
}

  /**
   * Envia uma requisição para fechar um pedido de mesa.
   */
  fecharPedido(pedidoId: number): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${pedidoId}/fechar`, {});
  }

  getPedidosPorData(data: string): Observable<any[]> {
    // Usamos a URL do RelatorioController que criamos no backend
    return this.http.get<any[]>(`${this.apiUrl}/data/${data}`);
  }

  /**
   * Envia uma requisição para fechar o caixa (excluir todos os pedidos).
   */
  fecharCaixa(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/fechar-caixa`);
  }
  registrarPagamento(pagamentoData: any): Observable<any> {
  // A API de pagamento está num endpoint diferente
  return this.http.post('http://localhost:8081/api/pagamentos', pagamentoData);
}
getPedidoById(id: number): Observable<Pedido> {
  return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
}

/**
  * Envia uma requisição para cancelar um pedido.
  */
cancelarPedido(pedidoId: number): Observable<Pedido> {
  return this.http.delete<Pedido>(`${this.apiUrl}/${pedidoId}/cancelar`);
}
}