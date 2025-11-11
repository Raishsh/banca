import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MesaService } from '../../core/services/mesa';
import { PedidoService } from '../../core/services/pedido';
import { ReservaService } from '../../core/services/reserva';
import { ProdutoService } from '../../core/services/produto';
import { Mesa } from '../../core/models/mesa.model';
import { Pedido } from '../../core/models/pedido.model';
import { Produto } from '../../core/models/produto.model';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesas.html',
  styleUrls: ['./mesas.css']
})
export class Mesas implements OnInit {
  listaMesas: Mesa[] = [];
  
  // Variáveis do Modal
  mesaSelecionada: Mesa | null = null;
  modalView: 'novoPedido' | 'pedidos' | 'reserva' = 'novoPedido';

  // Dados para os diferentes views do modal
  pedidosDaMesa: Pedido[] = [];
  cardapioCompleto: Produto[] = [];
  cardapioFiltrado: Produto[] = [];
  filtroCardapioAtual: string = 'PIZZA_ESPECIAL';
  tiposDeProduto: string[] = [
    'PIZZA_ESPECIAL', 'PIZZA_TRADICIONAL', 'PIZZA_DOCE', 'PASTEL_DOCE',
    'LANCHES', 'PASTEL', 'SUCOS', 'DRINKS', 'SOBREMESA', 'BEBIDA'
  ];

  novoPedidoItens: { produto: Produto, quantidade: number, tamanho?: string }[] = [];
  totalNovoPedido: number = 0;
  novaReserva = { nomeReserva: '', numPessoas: null, observacoes: '' };

  // Modal de Seleção de Tamanho
  mostrarModalTamanho: boolean = false;
  produtoSelecionadoParaTamanho: Produto | null = null;
  tamanhosSelecionaveis: string[] = ['P', 'M', 'G'];
  produtoParaSelecionarTamanho: Produto | null = null;
  showSizeModal: boolean = false;

  constructor(
    private mesaService: MesaService,
    private pedidoService: PedidoService,
    private reservaService: ReservaService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    this.carregarMesas();
    this.carregarCardapio();
  }

  carregarMesas(): void {
    this.mesaService.getMesas().subscribe(data => {
      this.listaMesas = data.sort((a, b) => a.numero - b.numero);
    });
  }

  carregarCardapio(): void {
    this.produtoService.getProdutos().subscribe(data => {
      this.cardapioCompleto = data;
      this.filtrarCardapio(this.filtroCardapioAtual);
    });
  }

  abrirModal(mesa: Mesa): void {
    this.mesaSelecionada = mesa;
    // O padrão é sempre abrir na tela de "Novo Pedido" para consistência.
    this.modalView = 'novoPedido';
    
    // Busca os pedidos ativos em segundo plano, para o caso de o usuário navegar para essa aba.
    this.pedidoService.getPedidosPorMesa(mesa.numero).subscribe(pedidos => {
      this.pedidosDaMesa = pedidos;
    });
  }

  fecharModal(): void {
    this.mesaSelecionada = null;
    this.pedidosDaMesa = [];
    this.novoPedidoItens = [];
    this.totalNovoPedido = 0;
    this.novaReserva = { nomeReserva: '', numPessoas: null, observacoes: '' };
  }
  
  // --- Lógica do Novo Pedido ---
  filtrarCardapio(tipo: string): void {
    this.filtroCardapioAtual = tipo;
    this.cardapioFiltrado = this.cardapioCompleto.filter(p => p.tipo === tipo);
  }

  abrirModalTamanho(produto: Produto): void {
    this.produtoSelecionadoParaTamanho = produto;
    this.mostrarModalTamanho = true;
  }

  fecharModalTamanho(): void {
    this.mostrarModalTamanho = false;
    this.produtoSelecionadoParaTamanho = null;
  }

  selecionarTamanhoEAdicionar(tamanho: string): void {
    if (!this.produtoSelecionadoParaTamanho) return;

    const itemExistente = this.novoPedidoItens.find(
      item => item.produto.id_produto === this.produtoSelecionadoParaTamanho!.id_produto && item.tamanho === tamanho
    );

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.novoPedidoItens.push({
        produto: this.produtoSelecionadoParaTamanho,
        quantidade: 1,
        tamanho: tamanho
      });
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
    this.fecharModalTamanho();
  }

  adicionarAoPedido(produto: Produto): void {
    this.abrirModalTamanho(produto);
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
    this.totalNovoPedido = this.novoPedidoItens.reduce((total, item) => {
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
  }

finalizarPedido(): void {
    if (this.novoPedidoItens.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }

    // <<< ESTA É A LINHA CORRETA (voltando ao formato antigo) >>>
    const itensParaApi = this.novoPedidoItens.map(item => ({
      idProduto: item.produto.id_produto,
      quantidade: item.quantidade,
      tamanho: item.tamanho
    }));

    if (this.pedidosDaMesa.length > 0) {
      // --- LÓGICA ANTIGA: ADICIONAR ITENS ---
      const pedidoId = this.pedidosDaMesa[0].idPedido;
      
      // (O seu 'adicionarItensAoPedido' no service espera o formato { itens: [...] } )
      const requestBody = { itens: itensParaApi }; 
      
      this.pedidoService.adicionarItensAoPedido(pedidoId, requestBody).subscribe({
        next: () => {
          this.carregarMesas();
          this.fecharModal();
        },
        error: (err) => {
          alert('Erro ao adicionar itens.');
          console.error(err);
        }
      });
    } else {
      // --- LÓGICA NOVA: CRIAR PEDIDO (COM IMPRESSÃO) ---
      const pedidoParaApi = {
        idMesa: this.mesaSelecionada!.numero,
        idCliente: null,
        nomeClienteTemporario: null,
        taxaEntrega: 0,
        itens: itensParaApi // <<< Usa o formato antigo
      };
      
      this.pedidoService.realizarPedido(pedidoParaApi).subscribe({
        next: (pedidoSalvo) => { // <-- 1. Recebe o pedido salvo
          
          // ===============================================
          // == 2. CHAMA O POPUP DE IMPRESSÃO (Mantido) ==
          // ===============================================
          const url = `/app/cozinha/${pedidoSalvo.idPedido}?autoprint=true`;
          window.open(url, 'CupomCozinha', 'width=350,height=500,left=100,top=100');

          // 3. Limpa e fecha
          this.carregarMesas();
          this.fecharModal();
        },
        error: (err) => {
          alert('Erro ao criar o pedido.');
          console.error(err);
        }
      });
    }
  }

  // --- Lógica da Reserva ---
  reservarMesa(): void {
    if (!this.mesaSelecionada || !this.novaReserva.nomeReserva || !this.novaReserva.numPessoas) {
      alert('Por favor, preencha o nome para a reserva e o número de pessoas.');
      return;
    }

    const dadosReserva = {
      idMesa: this.mesaSelecionada.numero,
      nomeReserva: this.novaReserva.nomeReserva,
      numPessoas: this.novaReserva.numPessoas,
      observacoes: this.novaReserva.observacoes,
      dataReserva: new Date().toISOString()
    };

    this.reservaService.fazerReserva(dadosReserva).subscribe({
      next: () => {
       
        this.carregarMesas();
        this.fecharModal();
      },
      error: (err) => {
        alert('Erro ao fazer a reserva.');
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
