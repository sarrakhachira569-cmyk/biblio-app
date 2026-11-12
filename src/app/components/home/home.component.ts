import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LibraryService } from '../../services/library.service';
import { BookCardComponent } from '../../shared/book-card/book-card.component';

/**
 * Page d'accueil : 3 blocs demandés par le sujet
 *  1) top des livres les plus empruntés  2) nouveautés  3) invitation + bouton vers le catalogue
 * Les deux listes utilisent LA MÊME fiche livre que le catalogue (<app-book-card>).
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, BookCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private library = inject(LibraryService);
  private auth = inject(AuthService);

  user = this.auth.currentUser;
  isAdmin = this.auth.isAdmin;

  stats = this.library.stats;
  /** les 4 livres avec le plus d'emprunts */
  topBooks = computed(() => this.library.topBorrowed().slice(0, 4));
  /** les 4 derniers livres ajoutés */
  newBooks = computed(() => this.library.newest().slice(0, 4));
}