import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Book } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { LibraryService } from '../../services/library.service';
import { ToastService } from '../../services/toast.service';
import { generateCover } from '../../utils/cover.util';
import { StarRatingComponent } from '../star-rating/star-rating.component';

/**
 * UNE fiche livre, réutilisée partout (accueil + catalogue).
 * Elle contient : couverture, titre, auteur, année, éditeur, disponibilité,
 * étoiles + note moyenne, et le bouton « Emprunter » (visible SEULEMENT si disponible).
 */
@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [StarRatingComponent],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css'
})
export class BookCardComponent {
  private library = inject(LibraryService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  book = input.required<Book>();
  badge = input<string>('');

  private brokenCover = signal(false);

  /** image du dossier public/images/covers ; si elle manque, on affiche une couverture générée */
  cover = computed(() => {
    const b = this.book();
    return b.cover.trim() && !this.brokenCover() ? b.cover : generateCover(b.title, b.author, b.category);
  });
  isAdmin = this.auth.isAdmin;
  available = computed(() => this.library.isAvailable(this.book()));
  copiesLeft = computed(() => this.library.availableCopies(this.book()));
  average = computed(() => this.library.average(this.book()));
  ratingCount = computed(() => this.library.ratingCount(this.book()));
  /** le bouton « Emprunter » n'existe que si le livre est disponible ET que la personne n'est pas l'administrateur */
  canBorrow = computed(() => this.available() && !this.isAdmin());
  availText = computed(() => {
    const n = this.copiesLeft();
    return `${n} exemplaire${n > 1 ? 's' : ''} disponible${n > 1 ? 's' : ''}`;
  });

  onCoverError(): void {
    this.brokenCover.set(true);
  }

  borrow(): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.toast.show('Connectez-vous pour emprunter un livre.', 'info');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/catalogue', reason: 'auth' } });
      return;
    }
    if (user.role === 'admin') {
      this.toast.show('Le compte administrateur ne peut pas emprunter.', 'error');
      return;
    }
    const res = this.library.requestLoan(user.id, this.book().id);
    this.toast.show(res.message, res.ok ? 'success' : 'error');
  }
}
