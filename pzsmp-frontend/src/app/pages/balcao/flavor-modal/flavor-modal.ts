import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Sabor {
  id: number;
  nome: string;
  preco: number;
}

@Component({
  selector: 'app-flavor-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flavor-modal.html',
  styleUrls: ['./flavor-modal.css']
})
export class FlavorModalComponent {
  @Input() tamanho: string = '';
  @Input() saboresDisponiveis: Sabor[] = [
    { id: 1, nome: 'Calabresa', preco: 25.00 },
    { id: 2, nome: 'Margherita', preco: 28.00 },
    { id: 3, nome: 'Frango com Catupiry', preco: 30.00 },
    { id: 4, nome: 'Portuguesa', preco: 32.00 },
    { id: 5, nome: 'Quatro Queijos', preco: 35.00 },
    { id: 6, nome: 'Brigadeiro', preco: 20.00 },
    { id: 7, nome: 'Brócolis', preco: 24.00 },
    { id: 8, nome: 'Bacon e Ovos', preco: 31.00 }
  ];

  @Output() saboreSelecionado = new EventEmitter<{ sabores: Sabor[], precoMedio: number }>();
  @Output() cancelado = new EventEmitter<void>();

  saboresSelecionados: Sabor[] = [];

  get maxSabores(): number {
    switch (this.tamanho) {
      case 'P':
        return 2;
      case 'M':
        return 3;
      case 'G':
        return 4;
      default:
        return 1;
    }
  }

  get textoMaximo(): string {
    return `Selecione até ${this.maxSabores} sabor(es) para o tamanho ${this.tamanho}`;
  }

  toggleSabor(sabor: Sabor): void {
    const index = this.saboresSelecionados.findIndex(s => s.id === sabor.id);
    if (index === -1) {
      if (this.saboresSelecionados.length < this.maxSabores) {
        this.saboresSelecionados.push(sabor);
      }
    } else {
      this.saboresSelecionados.splice(index, 1);
    }
  }

  isSabor(sabor: Sabor): boolean {
    return this.saboresSelecionados.some(s => s.id === sabor.id);
  }

  get precoMedio(): number {
    if (this.saboresSelecionados.length === 0) {
      return 0;
    }
    const soma = this.saboresSelecionados.reduce((total, sabor) => total + sabor.preco, 0);
    return soma / this.saboresSelecionados.length;
  }

  confirmar(): void {
    if (this.saboresSelecionados.length > 0) {
      this.saboreSelecionado.emit({
        sabores: this.saboresSelecionados,
        precoMedio: this.precoMedio
      });
    }
  }

  cancelar(): void {
    this.cancelado.emit();
  }
}
