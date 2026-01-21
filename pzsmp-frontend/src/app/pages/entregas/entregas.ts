import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClienteService } from '../../core/services/cliente';
import { ProdutoService } from '../../core/services/produto';
import { PedidoService } from '../../core/services/pedido';
import { Cliente } from '../../core/models/cliente.model';
import { Produto } from '../../core/models/produto.model';
import { FlavorModalComponent, Sabor } from '../balcao/flavor-modal/flavor-modal';

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
  imports: [CommonModule, FormsModule, RouterModule, FlavorModalComponent],
  templateUrl: './entregas.html',
  styleUrls: ['./entregas.css']
})
export class Entregas implements OnInit {

  // Cliente
  termoBusca: string = '';
  clientesEncontrados: Cliente[] = [];
  clienteSelecionado: Cliente | null = null;

  // Cardápio e Pedido
  cardapioCompleto: Produto[] = [];
  cardapioFiltrado: Produto[] = [];
  filtroCardapioAtual: string = 'PIZZA_ESPECIAL';
  
  tiposDeProduto: string[] = [
    'PIZZA_ESPECIAL', 'PIZZA_TRADICIONAL', 'PIZZA_DOCE', 'PASTEL_DOCE',
    'LANCHES', 'PASTEL', 'SUCOS', 'DRINKS', 'SOBREMESA', 'BEBIDA'
  ];

  novoPedidoItens: ItemPedidoInterno[] = [];
  totalNovoPedido: number = 0;
  taxaEntrega: number = 0;

  // Controle do Modal Wizard (Atalho)
  produtosPizzaParaModal: Produto[] = [];
  showFlavorModal: boolean = false;
  tamanhoSelecionadoNoAtalho: string | null = null;

  constructor(
    private clienteService: ClienteService,
    private produtoService: ProdutoService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.carregarCardapio();
  }

  // --- Busca de Cliente ---
  buscarClientes(): void {
    if (this.termoBusca.length < 3) {
      this.clientesEncontrados = [];
      return;
    }
    this.clienteService.getClientes().subscribe(todos => {
      this.clientesEncontrados = todos.filter(c => 
        c.nome.toLowerCase().includes(this.termoBusca.toLowerCase()) || 
        c.telefone.includes(this.termoBusca)
      );
    });
  }

  selecionarCliente(cliente: Cliente): void {
    this.clienteSelecionado = cliente;
    this.termoBusca = '';
    this.clientesEncontrados = [];
    
    // Sugestão de taxa baseada no bairro (exemplo simples)
    if (cliente.endereco?.bairro) {
       // Lógica opcional de taxa automática
    }
  }

  limparCliente(): void {
    this.clienteSelecionado = null;
    this.novoPedidoItens = [];
    this.totalNovoPedido = 0;
    this.taxaEntrega = 0;
  }

  // --- Cardápio ---
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

  formatarNomeFiltro(tipo: string): string {
    return tipo.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  // --- WIZARD ATALHO (PIZZA) ---
  abrirMontadorPizza(tamanho: string): void {
    this.produtosPizzaParaModal = this.cardapioCompleto.filter(p => p.tipo.includes('PIZZA'));
    this.tamanhoSelecionadoNoAtalho = tamanho;
    this.showFlavorModal = true;
  }

  onPizzaFinalizada(data: { sabores: Sabor[], borda: string | null, tamanho: string, precoFinal: number }): void {
    const produtoBase = this.cardapioCompleto.find(p => p.id_produto === data.sabores[0].id) || this.produtosPizzaParaModal[0];
    
    const saboresVisuais = [...data.sabores];
    if (data.borda) {
      saboresVisuais.push({ id: 99999, nome: data.borda, preco: 0 });
    }

    this.adicionarProdutoInterno(produtoBase, data.tamanho, saboresVisuais, data.precoFinal);
    this.resetarModal();
  }

  onSaboresCancelados(): void {
    this.resetarModal();
  }

  resetarModal(): void {
    this.showFlavorModal = false;
    this.tamanhoSelecionadoNoAtalho = null;
  }

  // --- Adicionar Itens Comuns ---
  adicionarAoPedido(produto: Produto): void {
    this.adicionarProdutoInterno(produto, undefined, undefined, produto.preco);
  }

  private adicionarProdutoInterno(produto: Produto, tamanho?: string, sabores?: Sabor[], precoOverride?: number): void {
    this.novoPedidoItens.push({
      produto,
      quantidade: 1,
      tamanho,
      sabores,
      precoFinal: precoOverride
    });
    this.calcularTotalNovoPedido();
  }

  removerDoPedido(item: ItemPedidoInterno): void {
    this.novoPedidoItens = this.novoPedidoItens.filter(i => i !== item);
    this.calcularTotalNovoPedido();
  }

  onTaxaChange(): void {
    this.calcularTotalNovoPedido();
  }

  calcularTotalNovoPedido(): void {
    const totalItens = this.novoPedidoItens.reduce((total, item) => {
      const preco = item.precoFinal ?? item.produto.preco;
      return total + (preco * item.quantidade);
    }, 0);
    
    this.totalNovoPedido = totalItens + (this.taxaEntrega || 0);
  }

  formatarSabores(sabores?: Sabor[]): string {
    return sabores ? sabores.map(s => s.nome).join(', ') : '';
  }

  // --- Finalizar ---
  finalizarPedido(): void {
    if (!this.clienteSelecionado) {
      alert('Selecione um cliente.');
      return;
    }
    if (this.novoPedidoItens.length === 0) {
      alert('Adicione itens ao pedido.');
      return;
    }

    const itensParaApi = this.novoPedidoItens.map(item => ({
      idProduto: item.produto.id_produto || 0,
      quantidade: item.quantidade,
      tamanho: item.tamanho,
      sabores: item.sabores?.map(s => s.nome) ?? null
    }));

    const pedidoParaApi = {
      idMesa: null,
      idCliente: this.clienteSelecionado.id,
      nomeClienteTemporario: null,
      taxaEntrega: this.taxaEntrega,
      itens: itensParaApi
    };

    this.pedidoService.realizarPedido(pedidoParaApi).subscribe({
      next: (pedidoSalvo) => {
        const url = `/app/cozinha/${pedidoSalvo.idPedido}?autoprint=true`;
        window.open(url, 'CupomCozinha', 'width=350,height=500,left=100,top=100');
        
        this.limparCliente();
        alert('Pedido de entrega realizado!');
      },
      error: (err) => {
        alert('Erro ao realizar pedido.');
        console.error(err);
      }
    });
  }
}