import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // Variáveis do Modal
  mesaSelecionada: Mesa | null = null;
  modalView: 'novoPedido' | 'pedidos' | 'reserva' = 'novoPedido';

  // Dados para os diferentes views do modal
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

  // Modal de Seleção de Tamanho
  mostrarModalTamanho: boolean = false;
  produtoSelecionadoParaTamanho: Produto | null = null;
  tamanhosSelecionaveis: string[] = ['P', 'M', 'G'];

  // Propriedades do modal de tamanho
  produtoParaSelecionarTamanho: Produto | null = null;
  showSizeModal: boolean = false;

  // Propriedades do modal de sabores
  showFlavorModal: boolean = false;
  tamanhoSelecionado: string = '';
  produtoParaSelecionarSabores: Produto | null = null;

  constructor(
    private mesaService: MesaService,
    private pedidoService: PedidoService,
    private reservaService: ReservaService,
    private produtoService: ProdutoService,
    private pagamentoState: PagamentoStateService
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
    // Refresh da mesa para obter o status mais recente do servidor
    // Isso garante que após um pagamento, a mesa tenha status LIVRE atualizado
    this.mesaService.getMesaPorNumero(mesa.numero).subscribe((mesaAtualizada) => {
      this.mesaSelecionada = mesaAtualizada;
      // O padrão é sempre abrir na tela de "Novo Pedido" para consistência.
      this.modalView = 'novoPedido';

      // Busca os pedidos ativos em segundo plano, para o caso de o usuário navegar para essa aba.
      this.pedidoService.getPedidosPorMesa(mesaAtualizada.numero).subscribe((pedidos) => {
        this.pedidosDaMesa = pedidos;
      });

      // Busca as reservas ativas para a mesa (agora apenas retorna reservas PENDENTE ou CONFIRMADA)
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

  // --- Lógica do Novo Pedido ---
  filtrarCardapio(tipo: string): void {
    this.filtroCardapioAtual = tipo;
    this.cardapioFiltrado = this.cardapioCompleto.filter(
      (p) => p.tipo === tipo
    );
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
      return total + preco * item.quantidade;
    }, 0);
  }

  finalizarPedido(): void {
    if (this.novoPedidoItens.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }

    const itensParaApi = this.novoPedidoItens.map((item) => ({
      idProduto: item.produto.id_produto,
      quantidade: item.quantidade,
      tamanho: item.tamanho,
      sabores: item.sabores?.map(s => s.nome) ?? null
    }));

    if (this.pedidosDaMesa.length > 0) {
      // --- LÓGICA ANTIGA: ADICIONAR ITENS ---
      const pedidoId = this.pedidosDaMesa[0].idPedido;

      // (O seu 'adicionarItensAoPedido' no service espera o formato { itens: [...] } )
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
      // --- LÓGICA NOVA: CRIAR PEDIDO (COM IMPRESSÃO) ---
      const pedidoParaApi = {
        idMesa: this.mesaSelecionada!.numero,
        idCliente: null,
        nomeClienteTemporario: null,
        taxaEntrega: 0,
        itens: itensParaApi, // <<< Usa o formato antigo
      };

      this.pedidoService.realizarPedido(pedidoParaApi).subscribe({
        next: (pedidoSalvo) => {
          // <-- 1. Recebe o pedido salvo

          // ===============================================
          // == 2. CHAMA O POPUP DE IMPRESSÃO (Mantido) ==
          // ===============================================
          const url = `/app/cozinha/${pedidoSalvo.idPedido}?autoprint=true`;
          window.open(
            url,
            'CupomCozinha',
            'width=350,height=500,left=100,top=100'
          );

          // 3. Limpa e fecha
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

  // --- Lógica da Reserva ---
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
      const mesmosSabores = JSON.stringify(item.sabores?.map(s => s.id) ?? []) ===
                            JSON.stringify(itemParaRemover.sabores?.map(s => s.id) ?? []);
      return !(mesmoId && mesmoTamanho && mesmosSabores);
    });

    this.calcularTotalNovoPedido();
  }
}
// CORREÇÃO: Chave "}" extra removida daqui.
