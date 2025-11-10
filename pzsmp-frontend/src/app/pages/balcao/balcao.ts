import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../core/services/pedido';
import { ProdutoService } from '../../core/services/produto';
import { Produto } from '../../core/models/produto.model';

@Component({
  selector: 'app-balcao',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // =======================================================
  // == MUDANÇA 1: Nova estrutura do Carrinho/Itens ==
  // =======================================================
  // O item não é mais {produto, qtde}, e sim {lista_de_sabores, qtde, etc}
  novoPedidoItens: { 
    sabores: Produto[], 
    quantidade: number,
    nomeDisplay: string,      // Ex: "Meia Calabresa, Meia 4 Queijos"
    precoCalculado: number  // O preço médio já calculado
  }[] = [];

  totalNovoPedido: number = 0;
  nomeCliente: string = '';

  // =======================================================
  // == MUDANÇA 2: Variáveis de controle do Modal de Sabores ==
  // =======================================================
  showSaborModal = false;
  saboresDisponiveis: Produto[] = [];
  saboresSelecionados: Produto[] = [];
  readonly maxSabores = 2; // Define o limite de sabores

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

  // =======================================================
  // == MUDANÇA 3: Roteador de Adição de Itens ==
  // =======================================================
  /**
   * Esta função agora decide se abre o modal de sabores (para pizzas)
   * ou se adiciona o item diretamente (para bebidas, etc.)
   */
  adicionarAoPedido(produto: Produto): void {
    // Se for Pizza, abre o modal
    if (produto.tipo.startsWith('PIZZA_')) {
      this.abrirModalSabores(produto);
    } else {
      // Se for item simples (bebida, etc), adiciona direto
      this.adicionarItemSimples(produto);
    }
  }

  /**
   * Adiciona um item que não tem múltiplos sabores (ex: Refrigerante)
   */
  adicionarItemSimples(produto: Produto): void {
    // Procura por um item existente que tenha EXATAMENTE este sabor
    const itemExistente = this.novoPedidoItens.find(item => 
      item.sabores.length === 1 && item.sabores[0].id_produto === produto.id_produto
    );

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.novoPedidoItens.push({
        sabores: [produto], // O "sabor" é o próprio produto
        quantidade: 1,
        nomeDisplay: produto.nome, // O nome de exibição é o nome do produto
        precoCalculado: produto.preco // O preço é o preço do produto
      });
    }
    this.calcularTotalNovoPedido();
  }

  // =======================================================
  // == MUDANÇA 4: Funções do Modal de Sabores ==
  // =======================================================

  /**
   * Prepara e abre o modal para o usuário montar a pizza
   */
  abrirModalSabores(saborInicial: Produto): void {
    // Filtra apenas produtos que são sabores de pizza
    this.saboresDisponiveis = this.cardapioCompleto.filter(p => 
      p.tipo === 'PIZZA_ESPECIAL' || 
      p.tipo === 'PIZZA_TRADICIONAL' || 
      p.tipo === 'PIZZA_DOCE'
    );
    this.saboresSelecionados = [saborInicial]; // Já adiciona o primeiro sabor clicado
    this.showSaborModal = true;
  }

  fecharModalSabores(): void {
    this.showSaborModal = false;
    this.saboresSelecionados = [];
  }

  /**
   * Adiciona ou remove um sabor da seleção no modal
   */
  toggleSabor(sabor: Produto): void {
    const index = this.saboresSelecionados.findIndex(s => s.id_produto === sabor.id_produto);

    if (index > -1) {
      // Já está selecionado -> Remove
      this.saboresSelecionados.splice(index, 1);
    } else if (this.saboresSelecionados.length < this.maxSabores) {
      // Não está selecionado e há espaço -> Adiciona
      this.saboresSelecionados.push(sabor);
    } else {
      // Limite atingido
      alert(`Você só pode selecionar até ${this.maxSabores} sabores.`);
    }
  }

  isSaborSelecionado(sabor: Produto): boolean {
    return this.saboresSelecionados.some(s => s.id_produto === sabor.id_produto);
  }

  /**
   * Pega os sabores selecionados no modal, calcula o preço médio
   * e adiciona a pizza ao carrinho (novoPedidoItens)
   */
  confirmarPizzaMeioAMeio(): void {
    if (this.saboresSelecionados.length === 0) {
      alert('Selecione pelo menos 1 sabor.');
      return;
    }

    // 1. Calcular o preço médio (como no backend)
    const somaPrecos = this.saboresSelecionados.reduce((total, sabor) => total + sabor.preco, 0);
    const precoMedio = somaPrecos / this.saboresSelecionados.length;

    // 2. Criar o nome de exibição
    let nomeDisplay: string;
    if (this.saboresSelecionados.length > 1) {
      nomeDisplay = "Meia " + this.saboresSelecionados.map(s => s.nome).join(', Meia ');
    } else {
      nomeDisplay = this.saboresSelecionados[0].nome;
    }

    // 3. Adicionar ao carrinho
    this.novoPedidoItens.push({
      sabores: [...this.saboresSelecionados], // Cria uma cópia da lista de sabores
      quantidade: 1,
      nomeDisplay: nomeDisplay,
      precoCalculado: precoMedio
    });

    this.calcularTotalNovoPedido();
    this.fecharModalSabores();
  }

  // =======================================================
  // == MUDANÇA 5: Cálculo de Total Atualizado ==
  // =======================================================
  calcularTotalNovoPedido(): void {
    // O total agora é só a soma dos preços já calculados
    this.totalNovoPedido = this.novoPedidoItens.reduce((total, item) => 
      total + (item.precoCalculado * item.quantidade)
    , 0);
  }

  // =======================================================
  // == MUDANÇA 6: Finalizar Pedido Atualizado (novo DTO) ==
  // =======================================================
  finalizarPedido(): void {
    if (this.novoPedidoItens.length === 0 || !this.nomeCliente) {
      alert('Adicione itens ao pedido e informe o nome do cliente.');
      return;
    }

    const pedidoParaApi = {
      idMesa: null,
      idCliente: null,
      nomeClienteTemporario: this.nomeCliente,
      taxaEntrega: 0, // Pedido de balcão não tem taxa
      
      // Mapeia o carrinho para o DTO que o backend espera
      itens: this.novoPedidoItens.map(item => ({
        idsSabores: item.sabores.map(sabor => sabor.id_produto), // Envia a LISTA DE IDs
        quantidade: item.quantidade
      }))
    };

    this.pedidoService.realizarPedido(pedidoParaApi).subscribe({
      next: () => {
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

  // =======================================================
  // == MUDANÇA 7: Remover do Pedido por Índice ==
  // =======================================================
  /**
   * Remove um item do carrinho pelo seu índice no array.
   */
  removerDoPedido(index: number): void {
    this.novoPedidoItens.splice(index, 1); // Remove 1 item na posição 'index'
    this.calcularTotalNovoPedido();
  }
}