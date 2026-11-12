import { Component, computed, inject, signal } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { BookCardComponent } from '../../shared/book-card/book-card.component';

/**
 * Catalogue : grille de fiches livres + recherche (titre / auteur) + filtre par catégorie.
 * Les résultats se mettent à jour à chaque lettre tapée ou clic de catégorie (signals + computed).
 */
@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [BookCardComponent],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.css'
})
export class CatalogueComponent {
  private library = inject(LibraryService);

  readonly ALL = 'Toutes';
  categories = this.library.categories;

  query = signal('');
  category = signal(this.ALL);
  onlyAvailable = signal(false);

  /** La liste affichée : recalculée automatiquement quand query / category / books changent */
  results = computed(() => {
    const q = this.normalize(this.query());
    const cat = this.category();
    return this.library.books().filter((b) => {
      const matchText = !q || this.normalize(b.title).includes(q) || this.normalize(b.author).includes(q);
      const matchCat = cat === this.ALL || b.category === cat;
      const matchAvail = !this.onlyAvailable() || this.library.isAvailable(b);
      return matchText && matchCat && matchAvail;
    });
  });

  hasFilter = computed(() => !!this.query().trim() || this.category() !== this.ALL || this.onlyAvailable());

  countIn(category: string): number {
    return this.library.books().filter((b) => b.category === category).length;
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onToggleAvailable(event: Event): void {
    this.onlyAvailable.set((event.target as HTMLInputElement).checked);
  }

  reset(): void {
    this.query.set('');
    this.category.set(this.ALL);
    this.onlyAvailable.set(false);
  }

  /** ignore les majuscules et les accents : « etranger » trouve « L'Étranger » */
  private normalize(text: string): string {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
}
