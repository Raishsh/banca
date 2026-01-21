import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produto } from '../../../core/models/produto.model';

export interface Sabor {
  id: number;
  nome: string;
  preco: number;
}

@Component({
  selector: 'app-flavor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flavor-modal.html',
  styleUrls: ['./flavor-modal.css']
})
export class FlavorModalComponent implements OnInit {
  
  @Input() todosProdutosPizza: Produto[] = []; 
  @Input() tamanhoInicial: string | null = null; 

  @Output() saboreSelecionado = new EventEmitter<{ sabores: Sabor[], borda: string | null, tamanho: string, precoFinal: number }>();
  @Output() cancelado = new EventEmitter<void>();

  step: number = 1; 

  tamanhoSelecionado: string = '';
  saboresSelecionados: Sabor[] = [];
  saboresDisponiveisNoTamanho: Sabor[] = [];
  
  bordaSelecionada: string = 'Sem Borda';
  opcoesBorda: string[] = ['Sem Borda', 'Catupiry', 'Cheddar', 'Chocolate', 'Nutella'];
  
  termoBuscaSabor: string = '';

  ngOnInit(): void {
    this.resetar();
    
    if (this.tamanhoInicial) {
      this.selecionarTamanho(this.tamanhoInicial);
    }
  }

  resetar(): void {
    this.step = 1;
    this.tamanhoSelecionado = '';
    this.saboresSelecionados = [];
    this.bordaSelecionada = 'Sem Borda';
    this.termoBuscaSabor = '';
  }

  // --- PASSO 1: TAMANHO ---
  selecionarTamanho(tam: string): void {
    this.tamanhoSelecionado = tam;
    this.prepararListaDeSabores();
    this.step = 2; 
  }

  private prepararListaDeSabores(): void {
    this.saboresDisponiveisNoTamanho = this.todosProdutosPizza.map(p => ({
      id: p.id_produto || 0,
      nome: p.nome,
      preco: this.obterPrecoPorTamanho(p)
    }));
  }

  private obterPrecoPorTamanho(p: Produto): number {
    switch (this.tamanhoSelecionado) {
      case 'P': return p.precoPequeno || p.preco;
      case 'M': return p.precoMedio || p.preco;
      case 'G': return p.precoGrande || p.preco;
      case 'F': return p.precoFamilia || p.preco;
      default: return p.preco;
    }
  }

  // --- PASSO 2: SABORES ---
  get saboresFiltrados(): Sabor[] {
    if (!this.termoBuscaSabor) return this.saboresDisponiveisNoTamanho;
    return this.saboresDisponiveisNoTamanho.filter(s => 
      s.nome.toLowerCase().includes(this.termoBuscaSabor.toLowerCase())
    );
  }

  get maxSabores(): number {
    switch (this.tamanhoSelecionado) {
      case 'P': return 2;
      case 'M': return 3;
      case 'G': return 4;
      case 'F': return 4;
      default: return 1;
    }
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

  isSaborSelected(sabor: Sabor): boolean {
    return this.saboresSelecionados.some(s => s.id === sabor.id);
  }

  avancarParaBorda(): void {
    this.step = 3;
  }

  // --- PASSO 3: BORDA E CÁLCULO FINAL ---
  get precoBorda(): number {
    if (this.bordaSelecionada === 'Sem Borda') return 0;
    switch (this.tamanhoSelecionado) {
      case 'P': return 6.00;
      case 'M': return 8.00;
      case 'G': return 10.00;
      case 'F': return 12.00;
      default: return 0;
    }
  }

  get precoFinalCalculado(): number {
    if (this.saboresSelecionados.length === 0) return 0;
    const soma = this.saboresSelecionados.reduce((total, s) => total + s.preco, 0);
    const media = soma / this.saboresSelecionados.length;
    return media + this.precoBorda;
  }

  confirmar(): void {
    this.saboreSelecionado.emit({
      sabores: this.saboresSelecionados,
      borda: this.bordaSelecionada !== 'Sem Borda' ? `Borda ${this.bordaSelecionada}` : null,
      tamanho: this.tamanhoSelecionado,
      precoFinal: this.precoFinalCalculado
    });
  }

  // --- MÉTODOS CORRIGIDOS PARA O HTML ---

  // O HTML chama (click)="cancelar()"
  cancelar(): void {
    this.cancelado.emit();
  }

  // O HTML chama (click)="voltarStep()"
  voltarStep(): void {
    // Se veio pelo atalho (já começou no passo 2), voltar fecha o modal
    if (this.step === 2 && this.tamanhoInicial) {
      this.cancelar();
      return;
    }

    if (this.step > 1) {
      this.step--;
    } else {
      this.cancelar();
    }
  }
}