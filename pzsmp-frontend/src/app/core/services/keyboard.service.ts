import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  private f1PressedSubject = new Subject<void>();
  public f1Pressed$ = this.f1PressedSubject.asObservable();

  constructor() {
    this.initializeKeyboardListeners();
  }

  private initializeKeyboardListeners(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      // F1 é a tecla com código 'F1' ou keyCode 112
      if (event.key === 'F1' || event.keyCode === 112) {
        event.preventDefault();
        this.f1PressedSubject.next();
      }
    });
  }
}
