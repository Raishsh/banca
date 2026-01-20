import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../core/services/produto';
import { Produto } from '../../core/models/produto.model';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective],
  templateUrl: './cardapio.html',
  styleUrls: ['./cardapio.css']
})
export class Cardapio implements OnInit {

  todosOsProdutos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  filtroAtual: string = 'PIZZA_ESPECIAL';
  tiposDeProduto: string[] = [
    'PIZZA_ESPECIAL', 'PIZZA_TRADICIONAL', 'PIZZA_DOCE', 'PASTEL_DOCE',
    'LANCHES', 'PASTEL', 'SUCOS', 'DRINKS', 'SOBREMESA', 'BEBIDA'
  ];
  
  produtoEmEdicao: Produto | null = null;
  arquivoSelecionado: File | null = null;

  constructor(private produtoService: ProdutoService) {}

  ngOnInit(): void {
    this.carregarTodosOsProdutos();
  }

  carregarTodosOsProdutos(): void {
    this.produtoService.getProdutos().subscribe({
      next: (data) => {
        this.todosOsProdutos = data;
        this.filtrarProdutos(this.filtroAtual);
      },
      error: (err) => console.error('Erro ao carregar produtos', err)
    });
  }

  filtrarProdutos(tipo: string): void {
    this.filtroAtual = tipo;
    this.produtosFiltrados = this.todosOsProdutos.filter(produto => produto.tipo === tipo);
  }

  formatarNomeFiltro(tipo: string): string {
    return tipo.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  
  // --- MÉTODOS DE GERENCIAMENTO ---

  // CORREÇÃO: Aceitar undefined e validar antes de usar
  excluirProduto(id_produto?: number): void {
    if (!id_produto) {
        alert('Erro: Produto sem ID identificado.');
        return;
    }

    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.produtoService.excluirProduto(id_produto).subscribe({
        next: () => {
          this.todosOsProdutos = this.todosOsProdutos.filter(p => p.id_produto !== id_produto);
          this.filtrarProdutos(this.filtroAtual);
        },
        error: (err) => {
          alert('Erro ao excluir produto.');
          console.error(err);
        }
      });
    }
  }

  abrirModalEdicao(produto: Produto): void {
    this.produtoEmEdicao = { ...produto };
    this.arquivoSelecionado = null;
  }

  fecharModalEdicao(): void {
    this.produtoEmEdicao = null;
  }
  
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.arquivoSelecionado = file;
    }
  }

  salvarEdicao(): void {
    if (!this.produtoEmEdicao) return;

    const formData = new FormData();
    formData.append('nome', this.produtoEmEdicao.nome);
    formData.append('preco', this.produtoEmEdicao.preco.toString());
    formData.append('tipo', this.produtoEmEdicao.tipo);
    if (this.produtoEmEdicao.descricao) {
      formData.append('descricao', this.produtoEmEdicao.descricao);
    }

    if (this.produtoEmEdicao.precoPequeno) formData.append('precoPequeno', this.produtoEmEdicao.precoPequeno.toString());
    if (this.produtoEmEdicao.precoMedio) formData.append('precoMedio', this.produtoEmEdicao.precoMedio.toString());
    if (this.produtoEmEdicao.precoGrande) formData.append('precoGrande', this.produtoEmEdicao.precoGrande.toString());
    if (this.produtoEmEdicao.precoFamilia) formData.append('precoFamilia', this.produtoEmEdicao.precoFamilia.toString());

    if (this.arquivoSelecionado) {
      formData.append('imagem', this.arquivoSelecionado, this.arquivoSelecionado.name);
    }

    // CORREÇÃO: Verificar se ID existe antes de atualizar
    if (this.produtoEmEdicao.id_produto) {
        this.produtoService.atualizarProduto(this.produtoEmEdicao.id_produto, formData).subscribe({
            next: (produtoAtualizado) => {
                const index = this.todosOsProdutos.findIndex(p => p.id_produto === this.produtoEmEdicao!.id_produto);
                if (index !== -1) {
                this.todosOsProdutos[index] = produtoAtualizado;
                }
                this.filtrarProdutos(this.filtroAtual);
                this.fecharModalEdicao();
            },
            error: (err) => {
                alert('Erro ao atualizar produto.');
                console.error(err);
            }
        });
    } else {
        console.error("Tentativa de atualizar produto sem ID");
    }
  }
}