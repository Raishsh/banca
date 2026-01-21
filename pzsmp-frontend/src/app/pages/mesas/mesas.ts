import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MesaService } from '../../core/services/mesa';
import { PedidoService } from '../../core/services/pedido';
import { ReservaService } from '../../core/services/reserva';
import { ProdutoService } from '../../core/services/produto';
import { Mesa } from '../../core/models/mesa.model';
import { Pedido } from '../../core/models/pedido.model';
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
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule, FlavorModalComponent],
  templateUrl: './mesas.html',
  styleUrls: ['./mesas.css'],
})
export class Mesas implements OnInit {
  listaMesas: Mesa[] = [];
  mesaSelecionada: Mesa | null = null;
  modalView: 'novoPedido' | 'pedidos' | 'reserva' = 'novoPedido';

  pedidosDaMesa: Pedido[] = [];
  reservasDaMesa: any[] = [];
  cardapioCompleto: Produto[] = [];
  cardapioFiltrado: Produto[] = [];
  filtroCardapioAtual: string = 'PIZZA_ESPECIAL';
  
  // Controle do Modal Wizard
  produtosPizzaParaModal: Produto[] = [];
  showFlavorModal: boolean = false;
  tamanhoSelecionadoNoAtalho: string | null = null; // <--- Controle do atalho

  tiposDeProduto: string[] = [
    'PIZZA_ESPECIAL', 'PIZZA_TRADICIONAL', 'PIZZA_DOCE', 'PASTEL_DOCE',
    'LANCHES', 'PASTEL', 'SUCOS', 'DRINKS', 'SOBREMESA', 'BEBIDA',
  ];

  novoPedidoItens: ItemPedidoInterno[] = [];
  totalNovoPedido: number = 0;

  constructor(
    private mesaService: MesaService,
    private pedidoService: PedidoService,
    private reservaService: ReservaService,
    private produtoService: ProdutoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarMesas();
    this.carregarCardapio();
  }

  carregarMesas(): void {
    this.mesaService.getMesas().subscribe((data) => {
      this.listaMesas = data.sort((a, b) => a.numero - b.numero);
    });
  }

  carregarCardapio(): void {
    this.produtoService.getProdutos().subscribe((data) => {
      this.cardapioCompleto = data;
      this.filtrarCardapio(this.filtroCardapioAtual);
    });
  }

  filtrarCardapio(tipo: string): void {
    this.filtroCardapioAtual = tipo;
    this.cardapioFiltrado = this.cardapioCompleto.filter((p) => p.tipo === tipo);
  }

  abrirModal(mesa: Mesa): void {
    this.mesaService.getMesaPorNumero(mesa.numero).subscribe((mesaAtualizada) => {
      this.mesaSelecionada = mesaAtualizada;
      this.modalView = 'novoPedido';
      this.pedidoService.getPedidosPorMesa(mesaAtualizada.numero).subscribe((pedidos) => {
        this.pedidosDaMesa = pedidos;
      });
      this.reservaService.getReservasPorMesa(mesaAtualizada.numero).subscribe((reservas) => {
        this.reservasDaMesa = reservas;
      });
    });
  }

  fecharModal(): void {
    this.mesaSelecionada = null;
    this.novoPedidoItens = [];
    this.totalNovoPedido = 0;
  }

  // --- Lógica de Pedidos Comuns ---
  adicionarAoPedido(produto: Produto): void {
    this.adicionarProdutoInterno(produto, undefined, undefined, produto.preco);
  }

  // --- Lógica Nova do Wizard de Pizza (Via Atalho) ---
  abrirMontadorPizza(tamanho: string): void {
    // Filtra todas as pizzas do cardápio para enviar ao modal
    this.produtosPizzaParaModal = this.cardapioCompleto.filter(p => p.tipo.includes('PIZZA'));
    
    // Define o tamanho para pular a etapa 1
    this.tamanhoSelecionadoNoAtalho = tamanho;
    this.showFlavorModal = true;
  }

  onPizzaFinalizada(data: { sabores: Sabor[], borda: string | null, tamanho: string, precoFinal: number }): void {
    // Usa o primeiro sabor como referência
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

  private adicionarProdutoInterno(produto: Produto, tamanho?: string, sabores?: Sabor[], precoOverride?: number): void {
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
      this.novoPedidoItens.push({
        produto: produto,
        quantidade: 1,
        tamanho: tamanho,
        sabores: sabores,
        precoFinal: precoOverride
      });
    }
    this.calcularTotalNovoPedido();
  }

  calcularTotalNovoPedido(): void {
    this.totalNovoPedido = this.novoPedidoItens.reduce((total, item) => {
      const preco = item.precoFinal ?? item.produto.preco;
      return total + preco * item.quantidade;
    }, 0);
  }

  removerDoPedido(itemParaRemover: ItemPedidoInterno): void {
    this.novoPedidoItens = this.novoPedidoItens.filter(item => item !== itemParaRemover);
    this.calcularTotalNovoPedido();
  }

  finalizarPedido(): void {
    if (this.novoPedidoItens.length === 0) {
      alert('Adicione pelo menos um item.');
      return;
    }

    const itensParaApi = this.novoPedidoItens.map((item) => ({
      idProduto: item.produto.id_produto || 0,
      quantidade: item.quantidade,
      tamanho: item.tamanho,
      sabores: item.sabores?.map(s => s.nome) ?? null
    }));

    if (this.pedidosDaMesa.length > 0) {
      const pedidoId = this.pedidosDaMesa[0].idPedido;
      this.pedidoService.adicionarItensAoPedido(pedidoId, { itens: itensParaApi }).subscribe({
        next: () => { this.fecharModal(); this.carregarMesas(); },
        error: (err) => alert('Erro ao adicionar itens.')
      });
    } else {
      const pedidoParaApi = {
        idMesa: this.mesaSelecionada!.numero,
        idCliente: null, nomeClienteTemporario: null, taxaEntrega: 0,
        itens: itensParaApi
      };
      this.pedidoService.realizarPedido(pedidoParaApi).subscribe({
        next: (pedidoSalvo) => {
          window.open(`/app/cozinha/${pedidoSalvo.idPedido}?autoprint=true`, 'Cupom', 'width=350,height=500');
          this.fecharModal(); this.carregarMesas();
        },
        error: (err) => alert('Erro ao criar pedido.')
      });
    }
  }

  formatarNomeFiltro(tipo: string): string {
    return tipo.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  formatarSabores(sabores?: Sabor[]): string {
    return sabores ? sabores.map(s => s.nome).join(', ') : '';
  }
  
  alternarReserva(): void { /* ... logica reserva ... */ }
  fazerReservaSimplificada(): void { /* ... logica reserva ... */ }
  cancelarReservaAtiva(): void { /* ... logica reserva ... */ }
  obterDataReservaPadrao(): string { return new Date().toISOString(); }
  irParaPagamento(pedido: Pedido): void { this.fecharModal(); this.router.navigate(['/app/pagamento', pedido.idPedido]); }
}