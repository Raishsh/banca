import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) { }

  /**
   * Envia as credenciais para a API para tentar fazer o login.
   * Espera uma resposta que contenha token, nome e cargo do usuário.
   */
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Se a resposta da API for bem-sucedida, salva todos os dados do usuário.
        if (response && response.token && response.nome && response.cargo) {
          this.salvarDadosUsuario(response.token, response.nome, response.cargo);
        }
      })
    );
  }

  /**
   * Salva os dados do usuário no localStorage do navegador.
   */
  salvarDadosUsuario(token: string, nome: string, cargo: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userName', nome);
    localStorage.setItem('userRole', cargo);
    
  }

  /**
   * Recupera o nome do usuário logado do localStorage.
   */
  getNomeUsuarioLogado(): string | null {
    return localStorage.getItem('userName');
  }

  /**
   * Recupera o cargo do usuário logado do localStorage.
   */
  getCargoUsuarioLogado(): string | null {
    return localStorage.getItem('userRole');
  }

  /**
   * Recupera o token de autenticação do localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Verifica se o usuário está autenticado (se existe um token).
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
  

  /**
   * Remove todos os dados da sessão do usuário do localStorage.
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  }
}