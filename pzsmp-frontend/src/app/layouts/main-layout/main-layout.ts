import { Component, OnInit, OnDestroy } from '@angular/core'; // Adicionei OnDestroy
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../core/services/auth';
import { PedidoService } from '../../core/services/pedido';
// Removi a importação do SangriaModalComponent, pois não está sendo usado aqui
import { HelperPanelComponent } from '../../shared/components/helper-panel/helper-panel';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, HelperPanelComponent, TooltipDirective],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy { // Implementei OnDestroy

  // Propriedades para dados do usuário
  nomeUsuarioLogado: string | null = null;
  cargoUsuario: string | null = null;
  dataAtual: Date = new Date();
  private intervalId: any;

  // ===============================================
  // == NOVO ESTADO PARA O MENU HAMBÚRGUER ==
  // ===============================================
  public isMenuAberto = false;


  constructor(
    private authService: AuthService, 
    private router: Router,
    private pedidoService: PedidoService
  ) {}

  /**
   * Este método é executado quando o componente é iniciado.
   * Usamos para buscar os dados do usuário que estão salvos.
   */
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

  /**
   * Realiza o logout do usuário e o redireciona para a página de login.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Inicia o processo de fechamento de caixa, com uma confirmação.
   */
  fecharCaixa(): void {
    // IMPORTANTE: 'confirm' não funciona bem em todos os ambientes.
    // Seria melhor criar um modal customizado para isso.
    const confirmacao = confirm(
      'Fechar caixa irá liberar todas as mesas e encerrar o expediente. Todos os pedidos realizados permanecerão salvos no Relatório Detalhado.\n\nDeseja continuar?'
    );

    if (confirmacao) {
      this.pedidoService.fecharCaixa().subscribe({
        next: () => {
          alert('Caixa fechado com sucesso! A lista de pedidos foi limpa e todos os pedidos realizados ficam no Relatório Detalhado.');
          window.location.reload(); // Recarrega a aplicação
        },
        error: (err) => {
          alert('Erro ao fechar o caixa. Verifique se você tem permissão de Administrador.');
          console.error(err);
        }
      });
    }
  }

  // ===============================================
  // == NOVAS FUNÇÕES PARA O MENU HAMBÚRGUER ==
  // ===============================================

  /**
   * Alterna a visibilidade do menu (abre/fecha).
   */
  toggleMenu(): void {
    this.isMenuAberto = !this.isMenuAberto;
  }

  /**
   * Fecha o menu (usado pelo overlay ou ao clicar num link).
   */
  fecharMenu(): void {
    this.isMenuAberto = false;
  }
}