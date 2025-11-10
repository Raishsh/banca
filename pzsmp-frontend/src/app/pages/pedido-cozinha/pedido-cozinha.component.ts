import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // <-- 'ActivatedRoute' é necessário
import { PedidoService } from '../../core/services/pedido';
import { Pedido } from '../../core/models/pedido.model';

@Component({
  selector: 'app-pedido-cozinha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido-cozinha.component.html',
  styleUrls: ['./pedido-cozinha.component.css']
})
export class PedidoCozinhaComponent implements OnInit {

  pedido: Pedido | null = null;

  constructor(
    private route: ActivatedRoute, // <-- Injetado para ler a URL
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    const pedidoIdParam = this.route.snapshot.paramMap.get('id');
    
    if (pedidoIdParam) {
      const id = +pedidoIdParam;
      
      this.pedidoService.getPedidoById(id).subscribe({
        next: (data) => {
          this.pedido = data;
          
          // ===============================================
          // == INÍCIO DA LÓGICA DE AUTO-IMPRESSÃO ==
          // ===============================================
          // 1. Verifica se a URL tem o parâmetro ?autoprint=true
          const autoprint = this.route.snapshot.queryParamMap.get('autoprint');
          if (autoprint === 'true') {
            
            // 2. Espera 100ms para o HTML ser renderizado antes de imprimir
            setTimeout(() => {
              this.imprimir();
            }, 100);
          }
          // ===============================================
          // == FIM DA LÓGICA DE AUTO-IMPRESSÃO ==
          // ===============================================
        },
        error: (err) => {
          console.error('Erro ao carregar pedido para cozinha', err);
        }
      });
    }
  }

  getTipoPedido(pedido: Pedido): string {
    if (pedido.numeroMesa) {
      return `MESA ${pedido.numeroMesa}`;
    }
    if (pedido.cliente) {
      return `ENTREGA (Cliente: ${pedido.cliente.nome})`;
    }
    if (pedido.nomeClienteTemporario) {
      return `BALCÃO (Cliente: ${pedido.nomeClienteTemporario})`;
    }
    return 'PEDIDO';
  }

  imprimir(): void {
    window.print(); // Chama a impressão do navegador
    
    // Opcional: Descomente a linha abaixo para fechar o popup
    // automaticamente após o usuário confirmar ou cancelar a impressão.
    // window.close();
  }
}