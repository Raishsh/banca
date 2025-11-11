import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../core/services/pedido';
import { ProdutoService } from '../../core/services/produto';
import { Produto } from '../../core/models/produto.model';
import { FlavorModalComponent } from './flavor-modal/flavor-modal';

export interface Sabor {
  id: number;
  nome: string;
  preco: number;
}

export interface ItemPedidoInterno {
  produto: Produto;
  quantidade: number;
  tamanho?: string;
  sabores?: Sabor[];
  precoFinal?: number;
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
  tiposDeProduto: string[] = [
    'PIZZA_ESPECIAL', 'PIZZA_TRADICIONAL', 'PIZZA_DOCE', 'PASTEL_DOCE',
    'LANCHES', 'PASTEL', 'SUCOS', 'DRINKS', 'SOBREMESA', 'BEBIDA'
  ];

  novoPedidoItens: ItemPedidoInterno[] = [];
  totalNovoPedido: number = 0;
  nomeCliente: string = ''; // Para o nome temporário

  produtoParaSelecionarTamanho: Produto | null = null;
  showSizeModal: boolean = false;

  showFlavorModal: boolean = false;
  tamanhoSelecionado: string = '';
  produtoParaSelecionarSabores: Produto | null = null;

  constructor(
    private pedidoService: PedidoService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    this.carregarCardapio();
  }

  carregarCardapio(): void {
    this.produtoService.getProdutos().subscribe(data => {
      this.cardapioCompleto = data;
      this.filtrarCardapio(this.filtroCardapioAtual);
    });
  }

  filtrarCardapio(tipo: string): void {
    this.filtroCardapioAtual = tipo;
    this.cardapioFiltrado = this.cardapioCompleto.filter(p => p.tipo === tipo);
  }

  adicionarAoPedido(produto: Produto): void {
    if (produto.precoPequeno || produto.precoMedio || produto.precoGrande) {
      this.produtoParaSelecionarTamanho = produto;
      this.showSizeModal = true;
    } else {
      this.adicionarProdutoAoPedido(produto, undefined);
    }
  }

  adicionarProdutoAoPedido(produto: Produto, tamanho?: string, sabores?: Sabor[]): void {
    const chaveItem = JSON.stringify({ id: produto.id_produto, tamanho, sabores: sabores?.map(s => s.id) ?? [] });
    const itemExistente = this.novoPedidoItens.find(item => {
      const chaveExistente = JSON.stringify({
        id: item.produto.id_produto,
        tamanho: item.tamanho,
        sabores: item.sabores?.map(s => s.id) ?? []
      });
      return chaveExistente === chaveItem;
    });

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      const precoFinal = this.calcularPrecoItem(produto, tamanho, sabores);
      this.novoPedidoItens.push({
        produto: produto,
        quantidade: 1,
        tamanho: tamanho,
        sabores: sabores,
        precoFinal: precoFinal
      });
    }
    this.calcularTotalNovoPedido();
  }

  calcularPrecoItem(produto: Produto, tamanho?: string, sabores?: Sabor[]): number {
    let preco = produto.preco;

    if (tamanho) {
      if (tamanho === 'P' && produto.precoPequeno) {
        preco = produto.precoPequeno;
      } else if (tamanho === 'M' && produto.precoMedio) {
        preco = produto.precoMedio;
      } else if (tamanho === 'G' && produto.precoGrande) {
        preco = produto.precoGrande;
      }
    }

    if (sabores && sabores.length > 0) {
      const mediaPrecos = sabores.reduce((total, sabor) => total + sabor.preco, 0) / sabores.length;
      preco = mediaPrecos;
    }

    return preco;
  }

  selecionarTamanho(tamanho: string): void {
    if (this.produtoParaSelecionarTamanho) {
      const isPizza = this.produtoParaSelecionarTamanho.tipo.includes('PIZZA');
      if (isPizza) {
        this.tamanhoSelecionado = tamanho;
        this.produtoParaSelecionarSabores = this.produtoParaSelecionarTamanho;
        this.showFlavorModal = true;
        this.fecharSizeModal();
      } else {
        this.adicionarProdutoAoPedido(this.produtoParaSelecionarTamanho, tamanho);
        this.fecharSizeModal();
      }
    }
  }

  fecharSizeModal(): void {
    this.showSizeModal = false;
    this.produtoParaSelecionarTamanho = null;
  }

  fecharFlavorModal(): void {
    this.showFlavorModal = false;
    this.produtoParaSelecionarSabores = null;
    this.tamanhoSelecionado = '';
  }

  onSaboresSelecionados(data: { sabores: Sabor[], precoMedio: number }): void {
    if (this.produtoParaSelecionarSabores) {
      this.adicionarProdutoAoPedido(this.produtoParaSelecionarSabores, this.tamanhoSelecionado, data.sabores);
    }
    this.fecharFlavorModal();
  }

  onSaboresCancelados(): void {
    this.fecharFlavorModal();
  }

  calcularTotalNovoPedido(): void {
    this.totalNovoPedido = this.novoPedidoItens.reduce((total, item) => {
      const preco = item.precoFinal ?? item.produto.preco;
      return total + (preco * item.quantidade);
    }, 0);
  }

  finalizarPedido(): void {
    if (this.novoPedidoItens.length === 0 || !this.nomeCliente) {
      alert('Adicione itens ao pedido e informe o nome do cliente.');
      return;
    }

    const pedidoParaApi = {
      idMesa: null,
      idCliente: null,
      nomeClienteTemporario: this.nomeCliente,
      // taxaEntrega: 0, // Sua tela de balcão não tem taxa

      itens: this.novoPedidoItens.map(item => ({
        idProduto: item.produto.id_produto,
        quantidade: item.quantidade,
        tamanho: item.tamanho,
        sabores: item.sabores?.map(s => s.nome) ?? null
      }))
    };

    this.pedidoService.realizarPedido(pedidoParaApi).subscribe({
      next: (pedidoSalvo) => { // <-- 1. Recebe o pedido salvo
        
        // ===============================================
        // == 2. CHAMA O POPUP DE IMPRESSÃO (Mantido) ==
        // ===============================================
        const url = `/app/cozinha/${pedidoSalvo.idPedido}?autoprint=true`;
        window.open(url, 'CupomCozinha', 'width=350,height=500,left=100,top=100');
        
        // 3. Limpa o formulário
        this.novoPedidoItens = [];
        this.totalNovoPedido = 0;
        this.nomeCliente = '';
      },
      error: (err) => {
        alert('Erro ao criar o pedido.');
        console.error(err);
      }
    });
  }
  
  
  formatarNomeFiltro(tipo: string): string {
    return tipo.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  removerDoPedido(itemParaRemover: ItemPedidoInterno): void {
    this.novoPedidoItens = this.novoPedidoItens.filter(item => {
      const mesmoId = item.produto.id_produto === itemParaRemover.produto.id_produto;
      const mesmoTamanho = item.tamanho === itemParaRemover.tamanho;
      const saborIds1 = (item.sabores ?? []).map(s => s.id).sort((a, b) => a - b);
      const saborIds2 = (itemParaRemover.sabores ?? []).map(s => s.id).sort((a, b) => a - b);
      const mesmosSabores = JSON.stringify(saborIds1) === JSON.stringify(saborIds2);
      return !(mesmoId && mesmoTamanho && mesmosSabores);
    });

    this.calcularTotalNovoPedido();
  }

  formatarSabores(sabores?: Sabor[]): string {
    if (!sabores || sabores.length === 0) {
      return '';
    }
    return sabores.map(s => s.nome).join(', ');
  }
}
