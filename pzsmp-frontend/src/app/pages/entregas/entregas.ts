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

@Component({
  selector: 'app-entregas',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthRoutingModule, RouterModule],
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
  novoPedidoItens: { produto: Produto, quantidade: number, tamanho?: string }[] = [];
  totalNovoPedido: number = 0;
  taxaEntrega: number = 7;

  produtoParaSelecionarTamanho: Produto | null = null;
  showSizeModal: boolean = false;

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

  adicionarProdutoAoPedido(produto: Produto, tamanho?: string): void {
    const itemExistente = this.novoPedidoItens.find(item =>
      item.produto.id_produto === produto.id_produto && item.tamanho === tamanho
    );
    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.novoPedidoItens.push({ produto: produto, quantidade: 1, tamanho: tamanho });
    }
    this.calcularTotalNovoPedido();
  }

  selecionarTamanho(tamanho: string): void {
    if (this.produtoParaSelecionarTamanho) {
      this.adicionarProdutoAoPedido(this.produtoParaSelecionarTamanho, tamanho);
    }
    this.fecharSizeModal();
  }

  fecharSizeModal(): void {
    this.showSizeModal = false;
    this.produtoParaSelecionarTamanho = null;
  }


  calcularTotalNovoPedido(): void {
    const subtotalItens = this.novoPedidoItens.reduce((total, item) => {
      let preco = item.produto.preco;
      if (item.tamanho === 'P' && item.produto.precoPequeno) {
        preco = item.produto.precoPequeno;
      } else if (item.tamanho === 'M' && item.produto.precoMedio) {
        preco = item.produto.precoMedio;
      } else if (item.tamanho === 'G' && item.produto.precoGrande) {
        preco = item.produto.precoGrande;
      }
      return total + (preco * item.quantidade);
    }, 0);
    // Garante que a taxa seja um número, mesmo se o campo estiver vazio
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

      // <<< ESTA É A LINHA CORRETA (voltando ao formato antigo) >>>
      itens: this.novoPedidoItens.map(item => ({
        idProduto: item.produto.id_produto,
        quantidade: item.quantidade,
        tamanho: item.tamanho
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
