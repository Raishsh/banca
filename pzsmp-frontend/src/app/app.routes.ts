import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';
import { Pedidos } from './pages/pedidos/pedidos';
import { Cardapio } from './pages/cardapio/cardapio';
import { Entregas } from './pages/entregas/entregas';
import { Funcionarios } from './pages/funcionarios/funcionarios';
import { Mesas } from './pages/mesas/mesas';
import { Balcao } from './pages/balcao/balcao';
import { CadastroProdutoComponent } from './pages/cadastro-produto/cadastro-produto';
import { CadastroClienteComponent } from './pages/cadastro-cliente/cadastro-cliente';
import { PagamentoComponent } from './pages/pagamento/pagamento';
import { RelatoriosComponent } from './pages/relatorios/relatorios';
import { HistoricoSangriaComponent } from './pages/historico-sangria/historico-sangria';
import { HistoricoAporteComponent } from './pages/historico-aporte/historico-aporte';
import { RelatorioDetalhadoComponent } from './pages/relatorio-detalhado/relatorio-detalhado';

export const routes: Routes = [
  // Rotas de autenticação (públicas)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },

  // Rotas da aplicação principal (protegidas pelo authGuard)
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard], // Nosso guarda protege todo este grupo de rotas
    children: [
      { path: 'pedidos', component: Pedidos },
      { path: 'cardapio', component: Cardapio },
      { path: 'entregas', component: Entregas },
      { path: 'funcionarios', component: Funcionarios },
      { path: 'mesas', component: Mesas },
      { path: 'balcao', component: Balcao },
      { path: 'cadastro-produto', component: CadastroProdutoComponent },
      { path: 'cadastro-cliente', component: CadastroClienteComponent },
      { path: 'pagamento/:id', component: PagamentoComponent },
      { path: 'relatorios', component: RelatoriosComponent },
      { path: 'historico-sangria', component: HistoricoSangriaComponent },
      { path: 'relatorios/:data', component: RelatorioDetalhadoComponent },
      
      // Rota padrão dentro da área logada, redireciona para a tela de pedidos
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' }
    ]
  },

  // Rota padrão geral, redireciona para a página de login se não houver outra correspondência
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  
  // Rota "coringa" para qualquer URL não encontrada, redireciona para o login
  { path: '**', redirectTo: 'auth/login' }
];
