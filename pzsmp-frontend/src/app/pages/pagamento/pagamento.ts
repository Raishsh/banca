import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../core/services/pedido';
import { Pedido } from '../../core/models/pedido.model';
import { PagamentoStateService } from '../../core/services/pagamento-state';

@Component({
  selector: 'app-pagamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagamento.html',
  styleUrls: ['./pagamento.css']
})
export class PagamentoComponent implements OnInit {
  pedido: Pedido | null = null;
  metodoPagamento: string = '';
  valorRecebido: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private pagamentoState: PagamentoStateService
  ) {}

  ngOnInit(): void {
    const pedidoIdParam = this.route.snapshot.paramMap.get('id');
    if (pedidoIdParam) {
      const id = +pedidoIdParam;
      // marca como "em pagamento" localmente para manter visível na lista até confirmar
      this.pagamentoState.add(id);
      this.pedidoService.getPedidoById(id).subscribe(data => {
        this.pedido = data;
        if (this.pedido) {
          this.valorRecebido = this.pedido.total; 
        }
      });
    }
  }

  confirmarPagamento(): void {
    if (!this.pedido || !this.metodoPagamento) {
      alert('Por favor, selecione um método de pagamento.');
      return;
    }

    if (this.valorRecebido < this.pedido.total) {
      alert('O valor pago não pode ser menor que o total do pedido.');
      return;
    }

    const dadosPagamento = {
      idPedido: this.pedido.idPedido,
      metodo: this.metodoPagamento,
      valorPago: this.valorRecebido
    };

    this.pedidoService.registrarPagamento(dadosPagamento).subscribe({
      next: () => {
        // pagamento concluído, remover da fila local e voltar à lista
        this.pagamentoState.remove(this.pedido!.idPedido);
        
        this.router.navigate(['/app/pedidos']);
      },
      error: (err) => {
        alert('Erro ao registar o pagamento.');
        console.error(err);
      }
    });
  }
}
