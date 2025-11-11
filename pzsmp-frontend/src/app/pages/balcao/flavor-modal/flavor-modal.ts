import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Produto } from '../../../core/models/produto.model';

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
export class FlavorModalComponent implements OnInit {
  @Input() tamanho: string = '';
  @Input() produtosDisponiveisPizza: Produto[] = [];

  @Output() saboreSelecionado = new EventEmitter<{ sabores: Sabor[], precoMedio: number }>();
  @Output() cancelado = new EventEmitter<void>();

  saboresDisponiveis: Sabor[] = [];
  saboresSelecionados: Sabor[] = [];

  ngOnInit(): void {
    this.inicializarSaboresDisponiveisAPizzas();
  }

  private inicializarSaboresDisponiveisAPizzas(): void {
    this.saboresDisponiveis = [];
    this.saboresSelecionados = [];

    if (this.produtosDisponiveisPizza && this.produtosDisponiveisPizza.length > 0) {
      this.saboresDisponiveis = this.produtosDisponiveisPizza.map(produto => ({
        id: produto.id_produto,
        nome: produto.nome,
        preco: this.obterPrecoParaTamanho(produto)
      }));
    }
  }

  private obterPrecoParaTamanho(produto: Produto): number {
    if (this.tamanho === 'P' && produto.precoPequeno) {
      return produto.precoPequeno;
    } else if (this.tamanho === 'M' && produto.precoMedio) {
      return produto.precoMedio;
    } else if (this.tamanho === 'G' && produto.precoGrande) {
      return produto.precoGrande;
    }
    return produto.preco;
  }

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
