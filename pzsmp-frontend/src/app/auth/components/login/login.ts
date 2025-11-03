import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { HelperPanelComponent } from '../../../shared/components/helper-panel/helper-panel';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HelperPanelComponent,
    TooltipDirective
  ]
})
export class LoginComponent {

  credentials = {
    login: '',
    senha: ''
  };

  errorMessage: string | null = null;

  showForgotPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.errorMessage = null;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido!', response);
        this.router.navigate(['/app/pedidos']);
      },
      error: (err) => {
        console.error('Falha no login', err);
        this.errorMessage = 'Login ou senha inválidos. Tente novamente.';
      }
    });
  }

  openForgotPassword(): void {
    this.showForgotPassword = true;
  }

  closeForgotPassword(): void {
    this.showForgotPassword = false;
  }
}
