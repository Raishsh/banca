import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input('appTooltip') tooltipText: string = '';
  
  private tooltipElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.createTooltip();
  }

  ngOnDestroy(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
    }
  }

  private createTooltip(): void {
    if (!this.tooltipText) return;

    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'app-tooltip');
    this.renderer.setProperty(this.tooltipElement, 'textContent', this.tooltipText);
    this.renderer.appendChild(document.body, this.tooltipElement);

    // Inicialmente oculto
    this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'hidden');
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideTooltip();
  }

  @HostListener('focus')
  onFocus(): void {
    this.showTooltip();
  }

  @HostListener('blur')
  onBlur(): void {
    this.hideTooltip();
  }

  private showTooltip(): void {
    if (!this.tooltipElement) return;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const tooltipHeight = 40;
    const tooltipWidth = 250;

    // Posiciona acima do elemento
    let top = rect.top - tooltipHeight - 10;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    // Ajusta se sair da tela
    if (top < 0) {
      top = rect.bottom + 10;
    }
    if (left < 0) {
      left = 10;
    }
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
    this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'visible');
  }

  private hideTooltip(): void {
    if (!this.tooltipElement) return;

    this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'hidden');
  }
}
