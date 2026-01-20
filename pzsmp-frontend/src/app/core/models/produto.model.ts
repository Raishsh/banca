export interface Sabor {
  id: number;
  nome: string;
  preco: number;
}

export interface Produto {
  id_produto?: number; // O '?' torna opcional, útil para cadastro
  nome: string;
  preco: number;
  tipo: string;
  imagemUrl?: string;
  descricao?: string;
  
  // Variações de Tamanho
  precoPequeno?: number;
  precoMedio?: number;
  precoGrande?: number;
  precoFamilia?: number; // <--- NOVO CAMPO
  
  sabores?: Sabor[];
  disponivel?: boolean;
}