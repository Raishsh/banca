import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appInputMask]',
  standalone: true
})
export class InputMaskDirective {
  @Input() appInputMask: 'phone' | 'cep' | 'currency' | 'date' = 'phone';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    switch (this.appInputMask) {
      case 'phone':
        value = this.formatPhone(value);
        break;
      case 'cep':
        value = this.formatCEP(value);
        break;
      case 'currency':
        value = this.formatCurrency(input.value);
        break;
      case 'date':
        value = this.formatDate(value);
        break;
    }

    input.value = value;
    this.updateModel(input);
  }

  private formatPhone(value: string): string {
    if (value.length <= 0) return '';
    if (value.length <= 2) return `(${value}`;
    if (value.length <= 6) return `(${value.substring(0, 2)}) ${value.substring(2)}`;
    return `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
  }

  private formatCEP(value: string): string {
    if (value.length <= 5) return value;
    return `${value.substring(0, 5)}-${value.substring(5, 8)}`;
  }

  private formatCurrency(value: string): string {
    let numericValue = value.replace(/\D/g, '');
    if (numericValue.length === 0) return '';
    
    const numberValue = parseInt(numericValue, 10) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numberValue);
  }

  private formatDate(value: string): string {
    if (value.length <= 2) return value;
    if (value.length <= 4) return `${value.substring(0, 2)}/${value.substring(2)}`;
    return `${value.substring(0, 2)}/${value.substring(2, 4)}/${value.substring(4, 8)}`;
  }

  private updateModel(input: HTMLInputElement): void {
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  }
}
