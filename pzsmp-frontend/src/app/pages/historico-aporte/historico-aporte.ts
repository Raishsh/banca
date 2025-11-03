import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private caixaService: CaixaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargoUsuario = this.authService.getCargoUsuarioLogado();
    this.carregarHistorico();
  }

  carregarHistorico(): void {
    this.caixaService.getAportes().subscribe({
      next: (data) => { this.historico = data; },
      error: (err) => { console.error('Erro ao carregar histórico', err); }
    });
  }

  abrirModalAporte(): void {
    this.mostrarModalAporte = true;
  }

  fecharModalAporte(): void {
    this.mostrarModalAporte = false;
    this.carregarHistorico();
  }
}
