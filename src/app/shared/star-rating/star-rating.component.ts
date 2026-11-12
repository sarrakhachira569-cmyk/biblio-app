import { Component, computed, input } from '@angular/core';

/**
 * Affiche une note sous forme d'étoiles (pleines, demi, vides) + la note moyenne.
 * Ex : 4.2 → ★★★★☆ 4.2 (35 avis)
 * Composant réutilisé dans le catalogue, l'accueil et l'admin.
 */
@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <span class="stars" role="img" [attr.aria-label]="label()">
      @for (s of stars(); track $index) {
        <i class="bi" [class]="s"></i>
      }
    </span>
    @if (count() > 0) {
      <span class="rating-value">{{ rating().toFixed(1) }}</span>
      @if (showCount()) {
        <span class="rating-count">({{ count() }} avis)</span>
      }
    } @else {
      <span class="rating-count">Pas encore d'avis</span>
    }
  `,
  styles: [
    `
      :host { display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap; }
      .stars { color: #e0a82e; letter-spacing: 1px; font-size: 0.95rem; }
      .rating-value { font-weight: 700; font-size: 0.9rem; }
      .rating-count { color: #6b7686; font-size: 0.8rem; }
    `
  ]
})
export class StarRatingComponent {
  rating = input.required<number>();
  count = input<number>(0);
  showCount = input<boolean>(true);

  /** 5 classes d'icônes : étoile pleine / demi / vide selon la note */
  stars = computed(() => {
    const r = this.rating();
    return [1, 2, 3, 4, 5].map((i) => {
      if (r >= i - 0.25) return 'bi-star-fill';
      if (r >= i - 0.75) return 'bi-star-half';
      return 'bi-star';
    });
  });

  label = computed(() => (this.count() ? `Note moyenne ${this.rating().toFixed(1)} sur 5` : 'Aucun avis'));
}
