import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rating-badge',
  imports: [],
  templateUrl: './rating-badge.html',
  styleUrl: './rating-badge.css'
})
export class RatingBadge {
  @Input() rating: number | null = null;
  @Input() label = 'Rating';

  get displayRating(): string {
    return this.rating ? this.rating.toFixed(1) : 'N/A';
  }

  get tone(): string {
    if (!this.rating) {
      return 'neutral';
    }

    if (this.rating >= 4.2) {
      return 'excellent';
    }

    if (this.rating >= 3.4) {
      return 'good';
    }

    return 'mixed';
  }
}
