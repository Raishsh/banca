import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FuncionarioService } from '../../core/services/funcionario';
import { Funcionario } from '../../core/models/funcionario.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './funcionarios.html',
  styleUrls: ['./funcionarios.css']
})
export class Funcionarios implements OnInit {

  modo: 'lista' | 'cadastro' = 'lista';

  allFuncionarios: Funcionario[] = [];
  filteredFuncionarios: Funcionario[] = [];
  paginatedFuncionarios: Funcionario[] = [];

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  sortOrder: 'asc' | 'desc' = 'asc';
  searchQuery: string = '';

  novoFuncionario = {
    nome: '',
    telefone: '',
    cargo: '',
    login: '',
    senha: ''
  };

  funcionarioEmEdicao: any | null = null;

  constructor(private funcionarioService: FuncionarioService) { }

  ngOnInit(): void {
    this.carregarFuncionarios();
  }

  carregarFuncionarios(): void {
    this.funcionarioService.getFuncionarios().subscribe(data => {
      this.allFuncionarios = data;
      this.sortFuncionarios();
      this.filteredFuncionarios = [...this.allFuncionarios];
      this.searchQuery = '';
      this.updatePagination();
    });
  }

  sortFuncionarios(): void {
    this.allFuncionarios.sort((a, b) => {
      const nameA = a.nome.toLowerCase();
      const nameB = b.nome.toLowerCase();

      if (this.sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.allFuncionarios.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedFuncionarios = this.allFuncionarios.slice(startIndex, endIndex);
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cadastrarFuncionario(): void {
    this.funcionarioService.cadastrarFuncionario(this.novoFuncionario).subscribe({
      next: (novoFuncionarioCadastrado) => {
        alert(`Funcionário "${novoFuncionarioCadastrado.nome}" cadastrado com sucesso!`);
        this.currentPage = 1;
        this.carregarFuncionarios();
        this.voltarParaLista();
      },
      error: (err) => {
        alert('Erro ao cadastrar funcionário.');
        console.error(err);
      }
    });
  }

  // Método para mudar para a tela de cadastro
  irParaModoCadastro(): void {
    this.modo = 'cadastro';
  }

  // Método para voltar para a tela de listagem
  voltarParaLista(): void {
    // Limpa o formulário antes de voltar
    this.novoFuncionario = { nome: '', telefone: '', cargo: '', login: '', senha: '' };
    this.modo = 'lista';
  }

  abrirModalEdicao(funcionario: any): void {
    // Cria uma cópia do funcionário para edição para não alterar a lista diretamente
    this.funcionarioEmEdicao = { ...funcionario };
    // A senha não vem do backend, então deixamos em branco para o admin digitar uma nova se quiser
    this.funcionarioEmEdicao.senha = ''; 
  }

  fecharModalEdicao(): void {
    this.funcionarioEmEdicao = null;
  }

  salvarEdicao(): void {
    if (!this.funcionarioEmEdicao) return;

    this.funcionarioService.atualizarFuncionario(this.funcionarioEmEdicao.id, this.funcionarioEmEdicao).subscribe({
      next: () => {
        alert('Funcionário atualizado com sucesso!');
        this.carregarFuncionarios();
        this.fecharModalEdicao();
      },
      error: (err) => {
        alert('Erro ao atualizar funcionário.');
        console.error(err);
      }
    });
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      this.funcionarioService.excluirFuncionario(id).subscribe({
        next: () => {
          alert('Funcionário excluído com sucesso.');
          this.currentPage = 1;
          this.carregarFuncionarios();
        },
        error: (err) => {
          alert('Erro ao excluir funcionário.');
          console.error(err);
        }
      });
    }
  }
}
