import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PedidoService } from '../../core/services/pedido';
import { Pedido } from '../../core/models/pedido.model';

@Component({
  selector: 'app-pedido-cozinha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido-cozinha.component.html',
  styleUrls: ['./pedido-cozinha.component.css'] // Garanta que o nome do arquivo bate
})
export class PedidoCozinhaComponent implements OnInit {

  pedido: Pedido | null = null;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    const pedidoIdParam = this.route.snapshot.paramMap.get('id');
    
    if (pedidoIdParam) {
      const id = +pedidoIdParam;
      
      this.pedidoService.getPedidoById(id).subscribe({
        next: (data) => {
          this.pedido = data;
          
          // Auto-impressão
          const autoprint = this.route.snapshot.queryParamMap.get('autoprint');
          if (autoprint === 'true') {
            setTimeout(() => {
              this.imprimir();
            }, 500); // Aumentei para 500ms para garantir que carregou estilos e imagens
          }
        },
        error: (err) => {
          console.error('Erro ao carregar pedido para cozinha', err);
        }
      });
    }
  }

  formatarSabor(sabor: any): string {
    if (typeof sabor === 'string') {
      return sabor;
    }
    return sabor?.nome || '';
  }

  getTipoPedido(pedido: Pedido): string {
    if (pedido.numeroMesa) {
      return `MESA ${pedido.numeroMesa}`;
    }
    // Lógica para Delivery vs Balcão
    if (!pedido.numeroMesa && pedido.cliente && !pedido.nomeClienteTemporario) {
        return `DELIVERY - ${pedido.cliente.nome.split(' ')[0]}`; // Pega só o primeiro nome p/ economizar espaço
    }
    return `BALCÃO - ${pedido.nomeClienteTemporario || 'Cliente'}`;
  }

  imprimir(): void {
    window.print();
  }
}