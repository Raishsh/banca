import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MesaService } from '../../core/services/mesa';
import { PedidoService } from '../../core/services/pedido';
import { ReservaService } from '../../core/services/reserva';
import { ProdutoService } from '../../core/services/produto';
import { PagamentoStateService } from '../../core/services/pagamento-state';
import { Mesa } from '../../core/models/mesa.model';
import { Pedido } from '../../core/models/pedido.model';
import { Produto } from '../../core/models/produto.model';
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
  
  tiposDeProduto: string[] = [
    'PIZZA_ESPECIAL',
    'PIZZA_TRADICIONAL',
    'PIZZA_DOCE',
    'PASTEL_DOCE',
    'LANCHES',
    'PASTEL',
    'SUCOS',
    'DRINKS',
    'SOBREMESA',
    'BEBIDA',
  ];

  novoPedidoItens: ItemPedidoInterno[] = [];
  totalNovoPedido: number = 0;

  mostrarModalTamanho: boolean = false;
  produtoSelecionadoParaTamanho: Produto | null = null;
  tamanhosSelecionaveis: string[] = ['P', 'M', 'G', 'F']; // Adicionado F

  produtoParaSelecionarTamanho: Produto | null = null;
  showSizeModal: boolean = false;

  showFlavorModal: boolean = false;
  tamanhoSelecionado: string = '';
  produtoParaSelecionarSabores: Produto | null = null;

  constructor(
    private mesaService: MesaService,
    private pedidoService: PedidoService,
    private reservaService: ReservaService,
    private produtoService: ProdutoService,
    private pagamentoState: PagamentoStateService,
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
    this.pedidosDaMesa = [];
    this.reservasDaMesa = [];
    this.novoPedidoItens = [];
    this.totalNovoPedido = 0;
  }

  filtrarCardapio(tipo: string): void {
    this.filtroCardapioAtual = tipo;
    this.cardapioFiltrado = this.cardapioCompleto.filter(
      (p) => p.tipo === tipo
    );
  }

  adicionarAoPedido(produto: Produto): void {
    if (produto.precoPequeno || produto.precoMedio || produto.precoGrande || produto.precoFamilia) {
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
      } else if (tamanho === 'F' && produto.precoFamilia) {
        preco = produto.precoFamilia;
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

  obterProdutosPizzaParaFlavors(): Produto[] {
    return this.cardapioCompleto.filter(p => p.tipo.includes('PIZZA'));
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
      return total + preco * item.quantidade;
    }, 0);
  }

  finalizarPedido(): void {
    if (this.novoPedidoItens.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }

    // CORREÇÃO: idProduto com fallback para 0 e tipagem correta
    const itensParaApi = this.novoPedidoItens.map((item) => ({
      idProduto: item.produto.id_produto || 0, // Fallback importante
      quantidade: item.quantidade,
      tamanho: item.tamanho,
      sabores: item.sabores?.map(s => s.nome) ?? null
    }));

    if (this.pedidosDaMesa.length > 0) {
      const pedidoId = this.pedidosDaMesa[0].idPedido;
      const requestBody = { itens: itensParaApi };

      this.pedidoService
        .adicionarItensAoPedido(pedidoId, requestBody)
        .subscribe({
          next: () => {
            this.carregarMesas();
            this.fecharModal();
          },
          error: (err) => {
            alert('Erro ao adicionar itens.');
            console.error(err);
          },
        });
    } else {
      const pedidoParaApi = {
        idMesa: this.mesaSelecionada!.numero,
        idCliente: null,
        nomeClienteTemporario: null,
        taxaEntrega: 0,
        itens: itensParaApi,
      };

      this.pedidoService.realizarPedido(pedidoParaApi).subscribe({
        next: (pedidoSalvo) => {
          const url = `/app/cozinha/${pedidoSalvo.idPedido}?autoprint=true`;
          window.open(
            url,
            'CupomCozinha',
            'width=350,height=500,left=100,top=100'
          );

          this.carregarMesas();
          this.pedidoService.getPedidosPorMesa(this.mesaSelecionada!.numero).subscribe((pedidos) => {
            this.pedidosDaMesa = pedidos;
          });
          this.novoPedidoItens = [];
          this.totalNovoPedido = 0;
        },
        error: (err) => {
          alert('Erro ao criar o pedido.');
          console.error(err);
        },
      });
    }
  }

  alternarReserva(): void {
    if (!this.mesaSelecionada) {
      return;
    }

    if (this.mesaSelecionada.status === 'LIVRE') {
      this.fazerReservaSimplificada();
    } else if (this.mesaSelecionada.status === 'RESERVADA') {
      this.cancelarReservaAtiva();
    }
  }

  private fazerReservaSimplificada(): void {
    if (!this.mesaSelecionada) {
      return;
    }

    const dataReservaPadrao = this.obterDataReservaPadrao();

    const dadosReserva = {
      idMesa: this.mesaSelecionada.numero,
      nomeReserva: 'Reserva',
      numPessoas: 1,
      observacoes: '',
      dataReserva: dataReservaPadrao,
    };

    this.reservaService.fazerReserva(dadosReserva).subscribe({
      next: () => {
        this.carregarMesas();
        if (this.mesaSelecionada) {
          this.reservaService.getReservasPorMesa(this.mesaSelecionada.numero).subscribe((reservas) => {
            this.reservasDaMesa = reservas;
          });
        }
      },
      error: (err) => {
        alert('Erro ao fazer a reserva.');
        console.error(err);
      },
    });
  }

  private cancelarReservaAtiva(): void {
    if (this.reservasDaMesa.length === 0) {
      alert('Nenhuma reserva encontrada para esta mesa.');
      return;
    }

    const reserva = this.reservasDaMesa[0];

    this.reservaService.cancelarReserva(reserva.id).subscribe({
      next: () => {
        this.carregarMesas();
        if (this.mesaSelecionada) {
          this.reservaService.getReservasPorMesa(this.mesaSelecionada.numero).subscribe((reservas) => {
            this.reservasDaMesa = reservas;
          });
        }
      },
      error: (err) => {
        alert('Erro ao cancelar a reserva.');
        console.error(err);
      },
    });
  }

  private obterDataReservaPadrao(): string {
    const agora = new Date();
    const hora = agora.getHours();
    const minuto = agora.getMinutes();

    let dataReserva: Date;

    if (hora < 19 || (hora === 19 && minuto === 0)) {
      dataReserva = new Date(agora);
      dataReserva.setHours(19, 0, 0, 0);
    } else {
      dataReserva = new Date(agora);
      dataReserva.setDate(dataReserva.getDate() + 1);
      dataReserva.setHours(19, 0, 0, 0);
    }

    const ano = dataReserva.getFullYear();
    const mes = String(dataReserva.getMonth() + 1).padStart(2, '0');
    const dia = String(dataReserva.getDate()).padStart(2, '0');
    const horas = String(dataReserva.getHours()).padStart(2, '0');
    const minutos = String(dataReserva.getMinutes()).padStart(2, '0');
    const segundos = String(dataReserva.getSeconds()).padStart(2, '0');

    return `${ano}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
  }

  formatarNomeFiltro(tipo: string): string {
    return tipo
      .replace(/_/g, ' ')
      .replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
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

  irParaPagamento(pedido: Pedido): void {
    if (pedido && pedido.idPedido) {
      this.fecharModal();
      this.router.navigate(['/app/pagamento', pedido.idPedido]);
    }
  }
}