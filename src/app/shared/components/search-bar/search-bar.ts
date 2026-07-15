import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  @Output() search = new EventEmitter<string>();

  searchText = '';

  submitSearch(): void {
    if (this.searchText.trim().length === 1) {
      return;
    }

    this.search.emit(this.searchText.trim());
  }

  clearSearch(): void {
    this.searchText = '';
    this.search.emit('');
  }
}
