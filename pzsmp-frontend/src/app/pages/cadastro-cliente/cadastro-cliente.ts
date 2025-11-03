import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente';
import { Cliente } from '../../core/models/cliente.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';

@Component({
  selector: 'app-cadastro-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, TooltipDirective],
  templateUrl: './cadastro-cliente.html',
  styleUrls: ['./cadastro-cliente.css']
})
export class CadastroClienteComponent implements OnInit {

  modo: 'lista' | 'cadastro' = 'lista';

  allClientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  paginatedClientes: Cliente[] = [];

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  sortOrder: 'asc' | 'desc' = 'asc';
  searchQuery: string = '';

  novoCliente = {
    nome: '', telefone: '', email: '',
    rua: '', bairro: '', numero: null, cidade: 'Rio Azul-PR', cep: '84560-000'
  };

  clienteEmEdicao: any | null = null;

  constructor(private clienteService: ClienteService) { }

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.clienteService.getClientes().subscribe(data => {
      this.allClientes = data;
      this.sortClientes();
      this.updatePagination();
    });
  }

  sortClientes(): void {
    this.allClientes.sort((a, b) => {
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
    this.totalPages = Math.ceil(this.allClientes.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedClientes = this.allClientes.slice(startIndex, endIndex);
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cadastrarCliente(): void {
    this.clienteService.cadastrarCliente(this.novoCliente).subscribe({
      next: (novoClienteCadastrado) => {
        alert(`Cliente "${novoClienteCadastrado.nome}" cadastrado com sucesso!`);
        this.currentPage = 1;
        this.carregarClientes();
        this.voltarParaLista();
      },
      error: (err) => {
        alert('Erro ao cadastrar cliente. Verifique se o e-mail já está em uso.');
        console.error(err);
      }
    });
  }

  // --- MÉTODOS DE CONTROLO DE VISUALIZAÇÃO ---

  irParaModoCadastro(): void {
    this.modo = 'cadastro';
  }

  voltarParaLista(): void {
    this.limparFormulario();
    this.modo = 'lista';
  }

  limparFormulario(): void {
    this.novoCliente = {
      nome: '', telefone: '', email: '',
      rua: '', bairro: '', numero: null, 
      cidade: 'Rio Azul-PR', cep: '84560-000'
    };
  }

  // --- MÉTODOS DE EDIÇÃO E EXCLUSÃO (continuam os mesmos) ---

  abrirModalEdicao(cliente: Cliente): void {
    this.clienteEmEdicao = {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      rua: cliente.endereco?.rua || '',
      bairro: cliente.endereco?.bairro || '',
      numero: cliente.endereco?.numero || null,
      cidade: cliente.endereco?.cidade || 'Rio Azul-PR',
      cep: cliente.endereco?.cep || '84560-000'
    };
  }

  fecharModalEdicao(): void {
    this.clienteEmEdicao = null;
  }

  salvarEdicao(): void {
    if (!this.clienteEmEdicao) return;
    this.clienteService.atualizarCliente(this.clienteEmEdicao.id, this.clienteEmEdicao).subscribe({
      next: () => {
        alert('Cliente atualizado com sucesso!');
        this.carregarClientes();
        this.fecharModalEdicao();
      },
      error: (err) => {
        alert('Erro ao atualizar cliente.');
        console.error(err);
      }
    });
  }

  excluirCliente(id: number): void {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      this.clienteService.excluirCliente(id).subscribe({
        next: () => {
          alert('Cliente excluído com sucesso.');
          this.currentPage = 1;
          this.carregarClientes();
        },
        error: (err) => {
          alert('Erro ao excluir cliente.');
          console.error(err);
        }
      });
    }
  }
}
