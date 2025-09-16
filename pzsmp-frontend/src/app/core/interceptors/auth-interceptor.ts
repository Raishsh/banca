import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  // Se um token existir, clona a requisição e adiciona o cabeçalho de autorização
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    // Envia a requisição clonada com o novo cabeçalho
    return next(authReq);
  }

  // Se não houver token, envia a requisição original sem modificação
  return next(req);
};