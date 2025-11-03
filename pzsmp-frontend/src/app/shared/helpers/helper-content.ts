/**
 * Configuração de conteúdo de ajuda para todas as páginas
 * Cada página tem um ID de rota e uma mensagem de ajuda em português
 */

export interface HelperContent {
  [route: string]: {
    title: string;
    content: string;
  };
}

export const HELPER_CONTENT: HelperContent = {
  'login': {
    title: 'Bem-vindo!',
    content: 'Faça login com suas credenciais de administrador para acessar o sistema de gerenciamento da Sampaiollo LTDA. Use seu email e senha cadastrados para entrar.'
  },
  'register': {
    title: 'Registrar Nova Conta',
    content: 'Crie uma nova conta preenchendo as informações solicitadas. Certifique-se de usar um email válido e uma senha segura.'
  },
  'pedidos': {
    title: 'Gerenciamento de Pedidos',
    content: 'Aqui você gerencia todos os pedidos do restaurante. Visualize, acompanhe e atualize o status dos pedidos em tempo real. Use os botões de ação para modificar o estado de cada pedido.'
  },
  'cardapio': {
    title: 'Cardápio do Restaurante',
    content: 'Visualize e gerencie todos os produtos do seu cardápio. Veja detalhes, preços e disponibilidade dos itens. Clique em um produto para ver mais informações.'
  },
  'entregas': {
    title: 'Gestão de Entregas',
    content: 'Controle e acompanhe as entregas realizadas. Veja o status de cada entrega, endereço de destino e detalhes do pedido associado.'
  },
  'mesas': {
    title: 'Controle de Mesas',
    content: 'Gerencie as mesas do restaurante. Veja quais estão ocupadas, quais estão livres e acompanhe os pedidos por mesa. Clique em uma mesa para ver mais detalhes.'
  },
  'balcao': {
    title: 'Vendas do Balcão',
    content: 'Registre vendas rápidas no balcão. Adicione itens do cardápio, defina quantidades e finalize a venda rapidamente.'
  },
  'cadastro-produto': {
    title: 'Cadastro de Produtos',
    content: 'Adicione e edite produtos do seu cardápio. Preencha informações como nome, descrição, preço e categoria. Você pode fazer upload de imagens para cada produto.'
  },
  'cadastro-cliente': {
    title: 'Cadastro de Clientes',
    content: 'Mantenha um registro de seus clientes. Adicione novas entradas com informações como nome, telefone e endereço. Isso facilita o acompanhamento de pedidos e entregas.'
  },
  'funcionarios': {
    title: 'Gestão de Funcionários',
    content: 'Gerencie sua equipe de funcionários. Veja dados como função, contato e status de cada membro. Apenas administradores podem adicionar ou editar funcionários.'
  },
  'relatorios': {
    title: 'Relatórios e Análises',
    content: 'Visualize relatórios detalhados sobre vendas, receita e desempenho do restaurante. Selecione um período para ver análises específicas.'
  },
  'historico-sangria': {
    title: 'Histórico de Sangrias',
    content: 'Acompanhe o histórico de retiradas de dinheiro do caixa. Visualize data, valor e responsável por cada sangria.'
  },
  'relatorio-detalhado': {
    title: 'Relatório Detalhado',
    content: 'Veja um relatório completo e detalhado sobre as operações de um dia específico. Inclui vendas, recebimentos e outras operações realizadas.'
  }
};

/**
 * Função para obter o conteúdo de ajuda baseado na rota atual
 */
export function getHelperContent(route: string): { title: string; content: string } | null {
  // Tenta encontrar correspondência exata
  if (HELPER_CONTENT[route]) {
    return HELPER_CONTENT[route];
  }

  // Tenta encontrar correspondência parcial (para rotas com parâmetros como /pagamento/:id)
  const routeKey = Object.keys(HELPER_CONTENT).find(key =>
    route.includes(key) || key.includes(route.split('/')[route.split('/').length - 1])
  );

  return routeKey ? HELPER_CONTENT[routeKey] : null;
}
