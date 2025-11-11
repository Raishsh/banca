import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../core/services/produto';
import { InputMaskDirective } from '../../shared/directives/input-mask.directive';

@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  imports: [CommonModule, FormsModule, InputMaskDirective],
  templateUrl: './cadastro-produto.html',
  styleUrls: ['./cadastro-produto.css']
})
export class CadastroProdutoComponent {
  produto = {
    nome: '',
    preco: null as number | null,
    tipo: '',
    descricao: '',
    precoPequeno: null as number | null,
    precoMedio: null as number | null,
    precoGrande: null as number | null
  };
  arquivoSelecionado: File | null = null;
  mensagemSucesso: string | null = null;

  constructor(private produtoService: ProdutoService) {}

  // Este método é chamado quando um arquivo é selecionado
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.arquivoSelecionado = file;
    }
  }

  cadastrar(): void {
    this.mensagemSucesso = null;

    const precoNumerico = this.parsePrice(this.produto.preco as any);

    // Usamos FormData para enviar dados de formulário e arquivos
    const formData = new FormData();
    formData.append('nome', this.produto.nome);
    if (precoNumerico !== null) {
        formData.append('preco', precoNumerico as any);
    }
    formData.append('tipo', this.produto.tipo);
    if (this.produto.descricao) {
      formData.append('descricao', this.produto.descricao);
    }
    if (this.arquivoSelecionado) {
      formData.append('imagem', this.arquivoSelecionado, this.arquivoSelecionado.name);
    }

    this.produtoService.cadastrarProduto(formData).subscribe({
      next: (response) => {
        
        this.mensagemSucesso = `Produto "${response.nome}" cadastrado com sucesso!`;
        this.limparFormulario();
      },
      error: (err) => {
        console.error('Erro ao cadastrar produto', err);
        this.mensagemSucesso = 'Erro ao cadastrar produto. Tente novamente.';
      }
    });
  }

  private parsePrice(value: any): number | null {
    if (!value) return null;
    const cleanValue = String(value).replace(/[^0-9,]/g, '').replace(',', '.');
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? null : numericValue;
  }

  limparFormulario(): void {
    this.produto = { nome: '', preco: null, tipo: '', descricao: '' };
    this.arquivoSelecionado = null;
    // Opcional: resetar o input de arquivo (um pouco mais complexo)
    const fileInput = document.getElementById('imagem') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
