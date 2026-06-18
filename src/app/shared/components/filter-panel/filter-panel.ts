import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { Genre } from '../../../models/genre.model';
import { Platform } from '../../../models/platform.model';

export interface GameFilterValues {
  genreId: string;
  platformId: string;
  ordering: string;
}

@Component({
  selector: 'app-filter-panel',
  imports: [CommonModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css'
})
export class FilterPanel implements OnChanges {
  @Input() genres: Genre[] = [];
  @Input() platforms: Platform[] = [];
  @Input() showGenres = true;
  @Input() showPlatforms = true;
  @Input() title = 'Refine results';
  @Input() resetKey: string | number | null = null;
  @Output() filtersChange = new EventEmitter<GameFilterValues>();

  selectedGenreIds: string[] = [];
  selectedPlatformIds: string[] = [];
  ordering = '-rating';
  isSortOpen = false;

  readonly sortOptions = [
    { value: '-rating', label: 'Highest rated' },
    { value: '-released', label: 'Newest' },
    { value: 'released', label: 'Oldest' },
    { value: 'name', label: 'Name A-Z' },
    { value: '-metacritic', label: 'Metacritic' }
  ];

  get selectedOrderingLabel(): string {
    return this.sortOptions.find((option) => option.value === this.ordering)?.label || 'Highest rated';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetKey'] && !changes['resetKey'].firstChange) {
      this.selectedGenreIds = [];
      this.selectedPlatformIds = [];
      this.ordering = '-rating';
      this.isSortOpen = false;
    }
  }

  isGenreSelected(genreId: number): boolean {
    return this.selectedGenreIds.includes(String(genreId));
  }

  isPlatformSelected(platformId: number): boolean {
    return this.selectedPlatformIds.includes(String(platformId));
  }

  toggleGenre(event: Event, genreId: number): void {
    this.selectedGenreIds = this.toggleSelection(this.selectedGenreIds, genreId, event);
    this.emitFilters();
  }

  togglePlatform(event: Event, platformId: number): void {
    this.selectedPlatformIds = this.toggleSelection(this.selectedPlatformIds, platformId, event);
    this.emitFilters();
  }

  emitFilters(): void {
    this.filtersChange.emit({
      genreId: this.selectedGenreIds.join(','),
      platformId: this.selectedPlatformIds.join(','),
      ordering: this.ordering
    });
  }

  toggleSortDropdown(): void {
    this.isSortOpen = !this.isSortOpen;
  }

  selectOrdering(ordering: string): void {
    this.ordering = ordering;
    this.isSortOpen = false;
    this.emitFilters();
  }

  clearFilters(): void {
    this.selectedGenreIds = [];
    this.selectedPlatformIds = [];
    this.ordering = '-rating';
    this.isSortOpen = false;
    this.emitFilters();
  }

  private toggleSelection(currentValues: string[], id: number, event: Event): string[] {
    const checked = (event.target as HTMLInputElement).checked;
    const value = String(id);

    if (checked) {
      return currentValues.includes(value) ? currentValues : [...currentValues, value];
    }

    return currentValues.filter((currentValue) => currentValue !== value);
  }
}
