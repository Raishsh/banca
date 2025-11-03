import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { KeyboardService } from '../../../core/services/keyboard.service';
import { getHelperContent } from '../../helpers/helper-content';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-helper-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './helper-panel.html',
  styleUrls: ['./helper-panel.css']
})
export class HelperPanelComponent implements OnInit, OnDestroy {
  isOpen = false;
  helperTitle = '';
  helperContent = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private keyboardService: KeyboardService
  ) {}

  ngOnInit(): void {
    // Escuta a tecla F1 para alternar o painel de ajuda
    this.keyboardService.f1Pressed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toggleHelper();
      });

    // Atualiza o conteúdo quando a rota muda
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateHelperContent();
      });

    // Carrega o conteúdo inicial
    this.updateHelperContent();
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  private updateHelperContent(): void {
    const currentRoute = this.router.url.split('?')[0]; // Remove query params
    const routePath = currentRoute.split('/').pop() || 'home';

    const content = getHelperContent(routePath);
    if (content) {
      this.helperTitle = content.title;
      this.helperContent = content.content;
    } else {
      this.helperTitle = 'Ajuda';
      this.helperContent = 'Bem-vindo ao sistema Sampaiollo! Pressione F1 em qualquer página para obter informações úteis sobre essa tela.';
    }
  }

  toggleHelper(): void {
    this.isOpen = !this.isOpen;
  }

  closeHelper(): void {
    this.isOpen = false;
  }
}
