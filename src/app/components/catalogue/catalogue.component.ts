import { Component, computed, inject, signal } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { BookCardComponent } from '../../shared/book-card/book-card.component';
import { matchesSearch, SearchField } from '../../utils/search.util';

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
  searchField = signal<SearchField>('all');
  category = signal(this.ALL);
  onlyAvailable = signal(false);

  placeholder = computed(() => {
    const f = this.searchField();
    return f === 'title' ? 'Rechercher par titre…' : f === 'author' ? 'Rechercher par auteur…' : 'Rechercher par titre ou par auteur…';
  });

  /** La liste affichée : recalculée automatiquement quand query / champ / category / books changent */
  results = computed(() => {
    const q = this.query();
    const field = this.searchField();
    const cat = this.category();
    return this.library.books().filter((b) => {
      const matchText = matchesSearch(b, q, field);
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

  onField(event: Event): void {
    this.searchField.set((event.target as HTMLSelectElement).value as SearchField);
  }

  onToggleAvailable(event: Event): void {
    this.onlyAvailable.set((event.target as HTMLInputElement).checked);
  }

  reset(): void {
    this.query.set('');
    this.searchField.set('all');
    this.category.set(this.ALL);
    this.onlyAvailable.set(false);
  }
}