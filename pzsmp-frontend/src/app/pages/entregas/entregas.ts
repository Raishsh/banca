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
  novoPedidoItens: { produto: Produto, quantidade: number }[] = [];
  totalNovoPedido: number = 0;
  taxaEntrega: number = 7;

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
    const itemExistente = this.novoPedidoItens.find(item => item.produto.id_produto === produto.id_produto);
    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.novoPedidoItens.push({ produto: produto, quantidade: 1 });
    }
    this.calcularTotalNovoPedido();
  }


  calcularTotalNovoPedido(): void {
    const subtotalItens = this.novoPedidoItens.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0);
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
      itens: this.novoPedidoItens.map(item => ({
        idProduto: item.produto.id_produto,
        quantidade: item.quantidade
      }))
    };

    this.pedidoService.realizarPedido(pedidoParaApi).subscribe({
      next: () => {
       
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
    // Filtra a lista de itens, criando uma nova lista que contém todos os itens, EXCETO o que foi clicado.
    this.novoPedidoItens = this.novoPedidoItens.filter(item => item.produto.id_produto !== itemParaRemover.produto.id_produto);
    
    // Após remover, é crucial recalcular o valor total do pedido.
    this.calcularTotalNovoPedido();
  }
}
