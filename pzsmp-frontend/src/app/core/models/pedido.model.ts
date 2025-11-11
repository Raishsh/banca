export interface ItemPedido {
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  tamanho?: string;
  sabores?: string[];
}

export interface Cliente {
  id: number;
  nome: string;
}

export interface Pedido {
  idPedido: number;
  data: string;
  status: string;
  total: number;
  cliente?: Cliente;
  itens: ItemPedido[];
  numeroMesa?: number;
  nomeClienteTemporario?: string;
  numeroDia?: number;
}
