import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaixaService } from '../../../core/services/caixa';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';

@Component({
  selector: 'app-aporte-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective],
  templateUrl: './aporte-modal.html',
  styleUrls: ['./aporte-modal.css']
})
export class AporteModalComponent {
  @Output() close = new EventEmitter<void>();

  valor: number | null = null;
  descricao: string = '';

  constructor(private caixaService: CaixaService) {}

  realizarAporte(): void {
    if (!this.valor || this.valor <= 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    this.caixaService.realizarAporte(this.valor, this.descricao).subscribe({
      next: () => {
        alert('Aporte registrado com sucesso!');
        this.close.emit();
      },
      error: (err) => {
        alert('Erro ao registrar o aporte. Verifique suas permissões.');
        console.error(err);
      }
    });
  }

  cancelar(): void {
    this.close.emit();
  }
}
