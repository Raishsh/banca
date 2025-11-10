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

  novoPedidoItens: { produto: Produto, quantidade: number }[] = [];
  totalNovoPedido: number = 0;
  nomeCliente: string = ''; // Para o nome temporário

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
    const itemExistente = this.novoPedidoItens.find(item => item.produto.id_produto === produto.id_produto);
    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.novoPedidoItens.push({ produto: produto, quantidade: 1 });
    }
    this.calcularTotalNovoPedido();
  }

  calcularTotalNovoPedido(): void {
    this.totalNovoPedido = this.novoPedidoItens.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0);
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
      
      // <<< ESTA É A LINHA CORRETA (voltando ao formato antigo) >>>
      itens: this.novoPedidoItens.map(item => ({
        idProduto: item.produto.id_produto, 
        quantidade: item.quantidade
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
  removerDoPedido(itemParaRemover: any): void {
    // Filtra a lista de itens, criando uma nova lista que contém todos os itens, EXCETO o que foi clicado.
    this.novoPedidoItens = this.novoPedidoItens.filter(item => item.produto.id_produto !== itemParaRemover.produto.id_produto);
    
    // Após remover, é crucial recalcular o valor total do pedido.
    this.calcularTotalNovoPedido();
  }
}
