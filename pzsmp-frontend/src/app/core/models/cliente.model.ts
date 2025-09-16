export interface Endereco {
  rua: string;
  bairro: string;
  numero: number;
  cidade: string;
  cep: string;
}


export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  endereco?: Endereco;
}