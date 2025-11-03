import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importe CommonModule para usar *ngIf no template
import { AuthService } from '../../core/services/auth';
import { PedidoService } from '../../core/services/pedido';
import { SangriaModalComponent } from '../../shared/components/sangria-modal/sangria-modal';
import { HelperPanelComponent } from '../../shared/components/helper-panel/helper-panel';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  // Adicione CommonModule, SangriaModalComponent, HelperPanelComponent e TooltipDirective aos imports
  imports: [RouterModule, CommonModule, HelperPanelComponent, TooltipDirective],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayoutComponent implements OnInit {

  // Propriedades para dados do usuário
  nomeUsuarioLogado: string | null = null;
  cargoUsuario: string | null = null;
  dataAtual: Date = new Date();
  private intervalId: any;


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
}
