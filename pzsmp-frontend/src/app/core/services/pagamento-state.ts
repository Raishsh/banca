import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PagamentoStateService {
  private storageKey = 'pedidosEmPagamentoIds';

  private readIds(): number[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
    } catch {
      return [];
    }
  }

  private writeIds(ids: number[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(Array.from(new Set(ids))));
  }

  add(id: number): void {
    const ids = this.readIds();
    if (!ids.includes(id)) {
      ids.push(id);
      this.writeIds(ids);
    }
  }

  remove(id: number): void {
    const ids = this.readIds().filter((x) => x !== id);
    this.writeIds(ids);
  }

  has(id: number): boolean {
    return this.readIds().includes(id);
  }

  all(): number[] {
    return this.readIds();
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
