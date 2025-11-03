import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../core/services/pedido';
import { Pedido } from '../../core/models/pedido.model';
import { PagamentoStateService } from '../../core/services/pagamento-state';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TooltipDirective
  ],
  templateUrl: './pedidos.html',
  styleUrls: ['./pedidos.css']
})
export class Pedidos implements OnInit {

  pedidos: Pedido[] = [];
  showCancelModal = false;
  pedidoParaCancelar: Pedido | null = null;

  constructor(
    private pedidoService: PedidoService,
    private pagamentoState: PagamentoStateService
  ) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  private mergePendentesComLista(): void {
    const pendentes = this.pagamentoState.all();
    const faltantes = pendentes.filter(id => !this.pedidos.some(p => p.idPedido === id));
    if (faltantes.length === 0) return;

    forkJoin(faltantes.map(id => this.pedidoService.getPedidoById(id))).subscribe({
      next: (extraPedidos) => {
        // adiciona ao início para maior visibilidade
        this.pedidos = [...extraPedidos, ...this.pedidos];
      },
      error: (err) => console.error('Erro ao carregar pedidos pendentes de pagamento', err)
    });
  }

  carregarPedidos(): void {
    this.pedidoService.getPedidos().subscribe({
      next: (data: Pedido[]) => {
        this.pedidos = data;
        this.mergePendentesComLista();
      },
      error: (err: any) => {
        console.error('Erro ao carregar pedidos', err);
      }
    });
  }

  mudarStatus(pedidoId: number, novoStatus: string): void {
    this.pedidoService.atualizarStatus(pedidoId, novoStatus).subscribe({
        next: (pedidoAtualizado: Pedido) => {
            const index = this.pedidos.findIndex(p => p.idPedido === pedidoId);
            if (index !== -1) {
                this.pedidos[index] = pedidoAtualizado;
            }
        },
        error: (err: any) => {
            alert('Erro ao mudar o status do pedido.');
            console.error(err);
        }
    });
  }

  fecharPedido(pedidoId: number): void {
    this.pedidoService.fecharPedido(pedidoId).subscribe({
        next: (pedidoAtualizado: Pedido) => {
            const index = this.pedidos.findIndex(p => p.idPedido === pedidoId);
            if (index !== -1) {
                this.pedidos[index] = pedidoAtualizado;
            }
        },
        error: (err: any) => {
            alert('Erro ao mudar o status do pedido.');
            console.error(err);
        }
    });
  }

  abrirModalCancelarPedido(pedido: Pedido): void {
    this.pedidoParaCancelar = pedido;
    this.showCancelModal = true;
  }

  fecharModalCancelar(): void {
    this.showCancelModal = false;
    this.pedidoParaCancelar = null;
  }

  confirmarCancelamento(): void {
    if (!this.pedidoParaCancelar) return;

    this.pedidoService.cancelarPedido(this.pedidoParaCancelar.idPedido).subscribe({
      next: (pedidoAtualizado: Pedido) => {
        const index = this.pedidos.findIndex(p => p.idPedido === this.pedidoParaCancelar!.idPedido);
        if (index !== -1) {
          this.pedidos[index] = pedidoAtualizado;
        }
        this.fecharModalCancelar();
      },
      error: (err: any) => {
        const errorMessage = err?.error?.message || 'Erro ao cancelar o pedido.';
        alert(errorMessage);
        console.error(err);
      }
    });
  }
}
