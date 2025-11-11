export interface Sabor {
  id: number;
  nome: string;
  preco: number;
}

export interface Produto {
  id_produto: number;
  nome: string;
  preco: number;
  tipo: string;
  imagemUrl?: string;
  descricao?: string;
  precoPequeno?: number;
  precoMedio?: number;
  precoGrande?: number;
  sabores?: Sabor[];
}
