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

// Definição da nova estrutura do item do carrinho
interface ItemPedidoCarrinho {
  sabores: Produto[];
  quantidade: number;
  nomeDisplay: string;
  precoCalculado: number;
}

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesas.html',
  styleUrls: ['./mesas.css']
})
export class Mesas implements OnInit {
  listaMesas: Mesa[] = [];
  
  // Variáveis do Modal da MESA
  mesaSelecionada: Mesa | null = null;
  modalView: 'novoPedido' | 'pedidos' | 'reserva' = 'novoPedido';

  // Lógica de Cardápio
  pedidosDaMesa: Pedido[] = [];
  cardapioCompleto: Produto[] = [];
  cardapioFiltrado: Produto[] = [];
  filtroCardapioAtual: string = 'PIZZA_ESPECIAL';
  tiposDeProduto: string[] = [
    'PIZZA_ESPECIAL', 'PIZZA_TRADICIONAL', 'PIZZA_DOCE', 'PASTEL_DOCE',
    'LANCHES', 'PASTEL', 'SUCOS', 'DRINKS', 'SOBREMESA', 'BEBIDA'
  ];

  // Lógica do Pedido/Carrinho (NOVA ESTRUTURA)
  novoPedidoItens: ItemPedidoCarrinho[] = [];
  totalNovoPedido: number = 0;
  novaReserva = { nomeReserva: '', numPessoas: null, observacoes: '' };

  // Lógica do Modal de Sabores (NOVO)
  showSaborModal = false;
  saboresDisponiveis: Produto[] = [];
  saboresSelecionados: Produto[] = [];
  readonly maxSabores = 2;

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

  // --- Lógica do Modal MESA ---
  abrirModal(mesa: Mesa): void {
    this.mesaSelecionada = mesa;
    this.modalView = 'novoPedido';
    
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
    // Garante que o modal de sabores feche junto
    this.fecharModalSabores(); 
  }
  
  // --- Lógica do Novo Pedido (Atualizada) ---
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
    this.totalNovoPedido = this.novoPedidoItens.reduce((total, item) =>
      total + (item.precoCalculado * item.quantidade)
    , 0);
  }

  removerDoPedido(index: number): void {
    this.novoPedidoItens.splice(index, 1);
    this.calcularTotalNovoPedido();
  }

  // --- Finalizar Pedido (Atualizado com novo DTO) ---
  finalizarPedido(): void {
    if (this.novoPedidoItens.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }

    // Converte o carrinho para o DTO que o backend espera
    const itensParaApi = this.novoPedidoItens.map(item => ({
      idsSabores: item.sabores.map(sabor => sabor.id_produto),
      quantidade: item.quantidade
    }));

    if (this.pedidosDaMesa.length > 0) {
      // Adiciona itens a um pedido existente
      const pedidoId = this.pedidosDaMesa[0].idPedido;
      
      // Assumindo que o DTO 'AdicionarItensRequest' espera { itens: [...] }
     this.pedidoService.adicionarItensAoPedido(pedidoId, itensParaApi).subscribe({
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
      // Cria um novo pedido para a mesa
      const pedidoParaApi = {
        idMesa: this.mesaSelecionada!.numero,
        idCliente: null,
        nomeClienteTemporario: null,
        taxaEntrega: 0, // Mesas não têm taxa
        itens: itensParaApi
      };
      this.pedidoService.realizarPedido(pedidoParaApi).subscribe({
        next: () => {
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

  // --- Lógica da Reserva (Sem mudanças) ---
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
}