import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente';
import { PedidoService } from '../../core/services/pedido';
import { ProdutoService } from '../../core/services/produto';
import { Cliente } from '../../core/models/cliente.model';
import { Produto } from '../../core/models/produto.model';
import { AuthRoutingModule } from "../../auth/auth-routing-module";
import { RouterModule } from '@angular/router';
import { FlavorModalComponent } from '../balcao/flavor-modal/flavor-modal';

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
  selector: 'app-entregas',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthRoutingModule, RouterModule, FlavorModalComponent],
  templateUrl: './entregas.html',
  styleUrls: ['./entregas.css']
})
export class Entregas implements OnInit {
  termoBusca: string = '';
  clientesEncontrados: Cliente[] = [];
  clienteSelecionado: Cliente | null = null;

  cardapioCompleto: Produto[] = [];
  cardapioFiltrado: Produto[] = [];
  filtroCardapioAtual: string = 'PIZZA_ESPECIAL';
  tiposDeProduto: string[] = [
    'PIZZA_ESPECIAL', 'PIZZA_TRADICIONAL', 'PIZZA_DOCE', 'PASTEL_DOCE',
    'LANCHES', 'PASTEL', 'SUCOS', 'DRINKS', 'SOBREMESA', 'BEBIDA'
  ];
  novoPedidoItens: ItemPedidoInterno[] = [];
  totalNovoPedido: number = 0;
  taxaEntrega: number = 7;

  produtoParaSelecionarTamanho: Produto | null = null;
  showSizeModal: boolean = false;

  showFlavorModal: boolean = false;
  tamanhoSelecionado: string = '';
  produtoParaSelecionarSabores: Produto | null = null;

  constructor(
    private clienteService: ClienteService,
    private pedidoService: PedidoService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    this.carregarCardapio();
  }

  buscarClientes(): void {
    if (this.termoBusca.length < 2) {
      this.clientesEncontrados = [];
      return;
    }
    this.clienteService.buscarClientes(this.termoBusca).subscribe(data => {
      this.clientesEncontrados = data;
    });
  }

  selecionarCliente(cliente: Cliente): void {
    this.clienteSelecionado = cliente;
    this.clientesEncontrados = [];
  }

  limparCliente(): void {
    this.clienteSelecionado = null;
    this.termoBusca = '';
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
    const subtotalItens = this.novoPedidoItens.reduce((total, item) => {
      const preco = item.precoFinal ?? item.produto.preco;
      return total + (preco * item.quantidade);
    }, 0);
    const taxa = Number(this.taxaEntrega) || 0;
    this.totalNovoPedido = subtotalItens + taxa;
  }

  onTaxaChange(): void {
    this.calcularTotalNovoPedido();
  }

  finalizarPedido(): void {
    if (!this.clienteSelecionado || this.novoPedidoItens.length === 0) {
      alert('Selecione um cliente e adicione itens ao pedido.');
      return;
    }

    const pedidoParaApi = {
      idMesa: null,
      idCliente: this.clienteSelecionado.id,
      nomeClienteTemporario: null,
      taxaEntrega: Number(this.taxaEntrega) || 0,

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
        this.limparTudo();
      },
      error: (err) => {
        alert('Erro ao criar o pedido.');
        console.error(err);
      }
    });
  }
  
  limparTudo(): void {
    this.clienteSelecionado = null;
    this.termoBusca = '';
    this.novoPedidoItens = [];
    this.totalNovoPedido = 0;
    this.taxaEntrega = 0;
  }
  
  formatarNomeFiltro(tipo: string): string {
    return tipo.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  removerDoPedido(itemParaRemover: any): void {
    // Filtra a lista de itens, criando uma nova lista que cont��m todos os itens, EXCETO o que foi clicado.
    // CORREÇÃO: Comparação precisa checar o ID E o tamanho
    this.novoPedidoItens = this.novoPedidoItens.filter(
      (item) =>
        !(
          item.produto.id_produto === itemParaRemover.produto.id_produto &&
          item.tamanho === itemParaRemover.tamanho
        )
    );

    // Após remover, é crucial recalcular o valor total do pedido.
    this.calcularTotalNovoPedido();
  }
}
