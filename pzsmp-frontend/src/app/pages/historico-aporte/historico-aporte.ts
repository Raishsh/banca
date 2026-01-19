import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaixaService } from '../../core/services/caixa';
import { AuthService } from '../../core/services/auth';
import { AporteModalComponent } from '../../shared/components/aporte-modal/aporte-modal';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';

@Component({
  selector: 'app-historico-aporte',
  standalone: true,
  imports: [CommonModule, FormsModule, AporteModalComponent, TooltipDirective],
  templateUrl: './historico-aporte.html',
  styleUrls: ['./historico-aporte.css']
})
export class HistoricoAporteComponent implements OnInit {
  historico: any[] = [];
  mostrarModalAporte = false;
  cargoUsuario: string | null = null;
  dataInicio: string = '';
  dataFim: string = '';

  constructor(
    private caixaService: CaixaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargoUsuario = this.authService.getCargoUsuarioLogado();
    this.definirPeriodoPadraoEBuscar();
  }

  definirPeriodoPadraoEBuscar(): void {
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 7);

    this.dataFim = formatDate(hoje, 'dd/MM/yyyy', 'pt-BR');
    this.dataInicio = formatDate(seteDiasAtras, 'dd/MM/yyyy', 'pt-BR');

    this.carregarHistorico();
  }

  carregarHistorico(): void {
    this.caixaService.getAportesByDateRange(this.dataInicio, this.dataFim).subscribe({
      next: (data) => { this.historico = data; },
      error: (err) => { console.error('Erro ao carregar histórico', err); }
    });
  }

  limparFiltro(): void {
    this.definirPeriodoPadraoEBuscar();
  }

  abrirModalAporte(): void {
    this.mostrarModalAporte = true;
  }

  fecharModalAporte(): void {
    this.mostrarModalAporte = false;
    this.carregarHistorico();
  }
}
