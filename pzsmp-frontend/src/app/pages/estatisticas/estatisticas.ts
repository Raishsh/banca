import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstatisticaService, EstatisticaProduto } from '../../core/services/estatistica.service';

@Component({
  selector: 'app-estatisticas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estatisticas.html',
  styleUrls: ['./estatisticas.css']
})
export class Estatisticas implements OnInit {
  
  dados: EstatisticaProduto[] = [];
  dataInicio: string = '';
  dataFim: string = '';
  
  // Para calcular a barra de progresso (o maior valor será 100%)
  maiorQuantidade: number = 0;

  constructor(private estatisticaService: EstatisticaService) {}

  ngOnInit(): void {
    // Define datas padrão (últimos 30 dias)
    const hoje = new Date();
    const passado = new Date();
    passado.setDate(hoje.getDate() - 30);

    this.dataFim = hoje.toISOString().split('T')[0];
    this.dataInicio = passado.toISOString().split('T')[0];

    this.buscarDados();
  }

  buscarDados(): void {
    this.estatisticaService.getMaisVendidos(this.dataInicio, this.dataFim).subscribe({
      next: (res) => {
        this.dados = res;
        // Encontra o item mais vendido para usar como base (100%) da barra
        this.maiorQuantidade = Math.max(...this.dados.map(d => d.quantidadeTotal), 1);
      },
      error: (err) => console.error('Erro ao buscar estatísticas', err)
    });
  }

  getLarguraBarra(qtd: number): string {
    if (this.maiorQuantidade === 0) return '0%';
    const porcentagem = (qtd / this.maiorQuantidade) * 100;
    return `${porcentagem}%`;
  }
}