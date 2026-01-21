// (Imports iguais ao Mesas)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../core/services/produto';
import { PedidoService } from '../../core/services/pedido';
import { Produto } from '../../core/models/produto.model';
import { FlavorModalComponent, Sabor } from './flavor-modal/flavor-modal';

export interface ItemPedidoInterno {
  produto: Produto; quantidade: number; tamanho?: string; sabores?: Sabor[]; precoFinal?: number;
}

@Component({
  selector: 'app-balcao',
  standalone: true,
  imports: [CommonModule, FormsModule, FlavorModalComponent],
  templateUrl: './balcao.html',
  styleUrls: ['./balcao.css']
})
export class Balcao implements OnInit {
  cardapioCompleto: Produto[] = [];
  cardapioFiltrado: Produto[] = [];
  filtroCardapioAtual: string = 'PIZZA_ESPECIAL';
  tiposDeProduto: string[] = ['PIZZA_ESPECIAL', 'PIZZA_TRADICIONAL', 'PIZZA_DOCE', 'LANCHES', 'BEBIDA', 'PASTEL', 'SUCOS'];

  nomeCliente: string = '';
  novoPedidoItens: ItemPedidoInterno[] = [];
  totalNovoPedido: number = 0;

  // Wizard Atalho
  produtosPizzaParaModal: Produto[] = [];
  showFlavorModal: boolean = false;
  tamanhoSelecionadoNoAtalho: string | null = null;

  constructor(private produtoService: ProdutoService, private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.produtoService.getProdutos().subscribe(data => {
      this.cardapioCompleto = data;
      this.filtrarCardapio(this.filtroCardapioAtual);
    });
  }

  filtrarCardapio(tipo: string): void {
    this.filtroCardapioAtual = tipo;
    this.cardapioFiltrado = this.cardapioCompleto.filter(p => p.tipo === tipo);
  }

  formatarNomeFiltro(tipo: string): string { return tipo.replace(/_/g, ' '); }

  // --- WIZARD ATALHO ---
  abrirMontadorPizza(tamanho: string): void {
    this.produtosPizzaParaModal = this.cardapioCompleto.filter(p => p.tipo.includes('PIZZA'));
    this.tamanhoSelecionadoNoAtalho = tamanho;
    this.showFlavorModal = true;
  }

  onPizzaFinalizada(data: { sabores: Sabor[], borda: string | null, tamanho: string, precoFinal: number }): void {
    const produtoBase = this.cardapioCompleto.find(p => p.id_produto === data.sabores[0].id) || this.produtosPizzaParaModal[0];
    const saboresVisuais = [...data.sabores];
    if (data.borda) saboresVisuais.push({ id: 99999, nome: data.borda, preco: 0 });

    this.novoPedidoItens.push({ produto: produtoBase, quantidade: 1, tamanho: data.tamanho, sabores: saboresVisuais, precoFinal: data.precoFinal });
    this.calcularTotal();
    this.resetarModal();
  }

  onSaboresCancelados(): void { this.resetarModal(); }
  resetarModal(): void { this.showFlavorModal = false; this.tamanhoSelecionadoNoAtalho = null; }

  // --- Pedido ---
  adicionarAoPedido(produto: Produto): void {
    this.novoPedidoItens.push({ produto, quantidade: 1, precoFinal: produto.preco });
    this.calcularTotal();
  }

  removerDoPedido(item: ItemPedidoInterno): void {
    this.novoPedidoItens = this.novoPedidoItens.filter(i => i !== item);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalNovoPedido = this.novoPedidoItens.reduce((acc, item) => acc + (item.precoFinal ?? item.produto.preco) * item.quantidade, 0);
  }

  formatarSabores(s?: Sabor[]): string { return s ? s.map(x => x.nome).join(', ') : ''; }

  finalizarPedido(): void {
    if (!this.nomeCliente) return alert('Digite o cliente.');
    const itensApi = this.novoPedidoItens.map(i => ({
      idProduto: i.produto.id_produto || 0, quantidade: i.quantidade, tamanho: i.tamanho, sabores: i.sabores?.map(s => s.nome) ?? null
    }));
    this.pedidoService.realizarPedido({
      idMesa: null, idCliente: null, nomeClienteTemporario: this.nomeCliente, taxaEntrega: 0, itens: itensApi
    }).subscribe({
      next: (p) => {
        window.open(`/app/cozinha/${p.idPedido}?autoprint=true`, 'Cupom', 'width=350,height=500');
        this.novoPedidoItens = []; this.nomeCliente = ''; this.totalNovoPedido = 0;
      }
    });
  }
}