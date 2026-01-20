import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../core/services/auth';
import { PedidoService } from '../../core/services/pedido';
import { HelperPanelComponent } from '../../shared/components/helper-panel/helper-panel';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';

// Interface para tipar nosso menu
interface MenuItem {
  label: string;
  icon: string;
  link: string;
  adminOnly?: boolean; // Se true, só aparece para ADMIN
}

interface MenuGrupo {
  titulo: string;
  id: string; // Identificador único para abrir/fechar
  itens: MenuItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, HelperPanelComponent, TooltipDirective],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  nomeUsuarioLogado: string | null = null;
  cargoUsuario: string | null = null;
  dataAtual: Date = new Date();
  private intervalId: any;
  public isMenuAberto = false;

  // Controle de qual grupo está expandido (padrão: 'vendas' aberto)
  grupoExpandido: string | null = 'vendas'; 

  // Definição da Estrutura do Menu
  menuGrupos: MenuGrupo[] = [
    {
      titulo: 'VENDAS / OPERAÇÃO',
      id: 'vendas',
      itens: [
        { label: 'Pedidos', icon: 'fas fa-box', link: '/app/pedidos' },
        { label: 'Mesas', icon: 'fas fa-chair', link: '/app/mesas' },
        { label: 'Entregas', icon: 'fas fa-motorcycle', link: '/app/entregas' },
        { label: 'Balcão', icon: 'fas fa-cash-register', link: '/app/balcao' }
      ]
    },
    {
      titulo: 'ADMINISTRATIVO',
      id: 'admin',
      itens: [
        { label: 'Cardápio', icon: 'fas fa-utensils', link: '/app/cardapio' },
        { label: 'Novo Produto', icon: 'fas fa-plus-square', link: '/app/cadastro-produto' },
        { label: 'Clientes', icon: 'fas fa-users', link: '/app/cadastro-cliente' },
        { label: 'Funcionários', icon: 'fas fa-user-tie', link: '/app/funcionarios' }
      ]
    },
    {
      titulo: 'FINANCEIRO & GESTÃO',
      id: 'financeiro',
      itens: [
        { label: 'Relatórios', icon: 'fas fa-file-invoice-dollar', link: '/app/relatorios' },
        { label: 'Estatísticas', icon: 'fas fa-chart-line', link: '/app/estatisticas' },
        { label: 'Sangrias', icon: 'fas fa-hand-holding-usd', link: '/app/historico-sangria', adminOnly: true },
        { label: 'Aportes', icon: 'fas fa-piggy-bank', link: '/app/historico-aporte', adminOnly: true }
      ]
    }
  ];

  constructor(
    private authService: AuthService, 
    private router: Router,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.nomeUsuarioLogado = this.authService.getNomeUsuarioLogado();
    this.cargoUsuario = this.authService.getCargoUsuarioLogado();
    this.intervalId = setInterval(() => {
      this.dataAtual = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Lógica para abrir/fechar os grupos do menu (Sanfona)
  toggleGrupo(idGrupo: string): void {
    if (this.grupoExpandido === idGrupo) {
      this.grupoExpandido = null; // Se clicar no aberto, fecha
    } else {
      this.grupoExpandido = idGrupo; // Abre o novo e fecha o anterior
    }
  }

  // Verifica se o item deve ser exibido baseado no cargo
  podeVerItem(item: MenuItem): boolean {
    if (item.adminOnly && this.cargoUsuario !== 'ADMIN') {
      return false;
    }
    return true;
  }

  fecharCaixa(): void {
    const confirmacao = confirm(
      'Fechar caixa irá liberar todas as mesas e encerrar o expediente.\nDeseja continuar?'
    );
    if (confirmacao) {
      this.pedidoService.fecharCaixa().subscribe({
        next: () => {
          alert('Caixa fechado com sucesso!');
          window.location.reload();
        },
        error: (err) => alert('Erro ao fechar o caixa.')
      });
    }
  }

  toggleMenu(): void {
    this.isMenuAberto = !this.isMenuAberto;
  }

  fecharMenu(): void {
    this.isMenuAberto = false;
  }
}