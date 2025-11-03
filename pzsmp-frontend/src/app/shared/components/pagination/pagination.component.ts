import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;
  
  @Output() pageChange = new EventEmitter<number>();

  pages: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['totalPages']) {
      this.calculatePages();
    }
  }

  calculatePages(): void {
    this.pages = [];
    
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        this.pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          this.pages.push(i);
        }
        this.pages.push('...');
        this.pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        this.pages.push(1);
        this.pages.push('...');
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          this.pages.push(i);
        }
      } else {
        this.pages.push(1);
        this.pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          this.pages.push(i);
        }
        this.pages.push('...');
        this.pages.push(this.totalPages);
      }
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get canPrevious(): boolean {
    return this.currentPage > 1;
  }

  get canNext(): boolean {
    return this.currentPage < this.totalPages;
  }
}
