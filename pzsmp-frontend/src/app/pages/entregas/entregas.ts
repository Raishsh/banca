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

// Definição da nova estrutura do item do carrinho
interface ItemPedidoCarrinho {
  sabores: Produto[];
  quantidade: number;
  nomeDisplay: string;
  precoCalculado: number;
}

@Component({
  selector: 'app-entregas',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthRoutingModule, RouterModule],
  templateUrl: './entregas.html',
  styleUrls: ['./entregas.css']
})
export class Entregas implements OnInit {
  // Lógica de Cliente
  termoBusca: string = '';
  clientesEncontrados: Cliente[] = [];
  clienteSelecionado: Cliente | null = null;

  // Lógica de Cardápio
  cardapioCompleto: Produto[] = [];
  cardapioFiltrado: Produto[] = [];
  filtroCardapioAtual: string = 'PIZZA_ESPECIAL';
  tiposDeProduto: string[] = [
    'PIZZA_ESPECIAL', 'PIZZA_TRADICIONAL', 'PIZZA_DOCE', 'PASTEL_DOCE',
    'LANCHES', 'PASTEL', 'SUCOS', 'DRINKS', 'SOBREMESA', 'BEBIDA'
  ];

  // Lógica do Pedido/Carrinho (NOVA ESTRUTURA)
  novoPedidoItens: ItemPedidoCarrinho[] = []; // <--- MUDANÇA
  totalNovoPedido: number = 0;
  taxaEntrega: number = 7; // Padrão de 7 reais

  // Lógica do Modal de Sabores (NOVO)
  showSaborModal = false;
  saboresDisponiveis: Produto[] = [];
  saboresSelecionados: Produto[] = [];
  readonly maxSabores = 2;

  constructor(
    private clienteService: ClienteService,
    private pedidoService: PedidoService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    this.carregarCardapio();
    this.calcularTotalNovoPedido(); // Calcula o total inicial (com a taxa de R$7)
  }

  // --- Lógica de Cliente (Sem mudanças) ---
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

  // --- Lógica de Cardápio (Atualizada) ---
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

  // --- Roteador de Adição de Itens (NOVO) ---
  adicionarAoPedido(produto: Produto): void {
    if (produto.tipo.startsWith('PIZZA_')) {
      this.abrirModalSabores(produto);
    } else {
      this.adicionarItemSimples(produto);
    }
  }

  adicionarItemSimples(produto: Produto): void {
    const itemExistente = this.novoPedidoItens.find(item =>
      item.sabores.length === 1 && item.sabores[0].id_produto === produto.id_produto
    );

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.novoPedidoItens.push({
        sabores: [produto],
        quantidade: 1,
        nomeDisplay: produto.nome,
        precoCalculado: produto.preco
      });
    }
    this.calcularTotalNovoPedido();
  }

  // --- Lógica do Modal de Sabores (NOVO) ---
  abrirModalSabores(saborInicial: Produto): void {
    this.saboresDisponiveis = this.cardapioCompleto.filter(p =>
      p.tipo.startsWith('PIZZA_')
    );
    this.saboresSelecionados = [saborInicial];
    this.showSaborModal = true;
  }

  fecharModalSabores(): void {
    this.showSaborModal = false;
    this.saboresSelecionados = [];
  }

  toggleSabor(sabor: Produto): void {
    const index = this.saboresSelecionados.findIndex(s => s.id_produto === sabor.id_produto);
    if (index > -1) {
      this.saboresSelecionados.splice(index, 1);
    } else if (this.saboresSelecionados.length < this.maxSabores) {
      this.saboresSelecionados.push(sabor);
    } else {
      alert(`Você só pode selecionar até ${this.maxSabores} sabores.`);
    }
  }

  isSaborSelecionado(sabor: Produto): boolean {
    return this.saboresSelecionados.some(s => s.id_produto === sabor.id_produto);
  }

  confirmarPizzaMeioAMeio(): void {
    if (this.saboresSelecionados.length === 0) {
      alert('Selecione pelo menos 1 sabor.');
      return;
    }

    const somaPrecos = this.saboresSelecionados.reduce((total, sabor) => total + sabor.preco, 0);
    const precoMedio = somaPrecos / this.saboresSelecionados.length;

    let nomeDisplay: string;
    if (this.saboresSelecionados.length > 1) {
      nomeDisplay = "Meia " + this.saboresSelecionados.map(s => s.nome).join(', Meia ');
    } else {
      nomeDisplay = this.saboresSelecionados[0].nome;
    }

    this.novoPedidoItens.push({
      sabores: [...this.saboresSelecionados],
      quantidade: 1,
      nomeDisplay: nomeDisplay,
      precoCalculado: precoMedio
    });

    this.calcularTotalNovoPedido();
    this.fecharModalSabores();
  }

  // --- Lógica de Pedido (Atualizada) ---
  calcularTotalNovoPedido(): void {
    const subtotalItens = this.novoPedidoItens.reduce((total, item) =>
      total + (item.precoCalculado * item.quantidade)
    , 0);
    const taxa = Number(this.taxaEntrega) || 0;
    this.totalNovoPedido = subtotalItens + taxa;
  }

  onTaxaChange(): void {
    this.calcularTotalNovoPedido();
  }

  finalizarPedido(): void {
    if (!this.clienteSelecionado || (this.novoPedidoItens.length === 0 && this.taxaEntrega === 0)) {
      alert('Selecione um cliente e adicione itens ou uma taxa ao pedido.');
      return;
    }

    const pedidoParaApi = {
      idMesa: null,
      idCliente: this.clienteSelecionado.id,
      nomeClienteTemporario: null,
      taxaEntrega: Number(this.taxaEntrega) || 0,
      itens: this.novoPedidoItens.map(item => ({
        idsSabores: item.sabores.map(sabor => sabor.id_produto), // <--- MUDANÇA
        quantidade: item.quantidade
      }))
    };

    this.pedidoService.realizarPedido(pedidoParaApi).subscribe({
      next: () => {
        alert('Pedido de entrega criado com sucesso!');
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
    this.taxaEntrega = 7; // Volta para o padrão
    this.calcularTotalNovoPedido(); // Recalcula o total (mostra R$ 7,00)
  }
  
  formatarNomeFiltro(tipo: string): string {
    return tipo.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  removerDoPedido(index: number): void { // <--- MUDANÇA
    this.novoPedidoItens.splice(index, 1);
    this.calcularTotalNovoPedido();
  }
}