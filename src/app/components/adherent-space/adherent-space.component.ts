import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Loan } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { LibraryService } from '../../services/library.service';
import { ToastService } from '../../services/toast.service';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';

/**
 * Espace adhérent (protégé par le guard) :
 *  - 3 cartes de chiffres  - nouvelle demande d'emprunt
 *  - tableau « Mes demandes » (En attente / Acceptée / Refusée)
 *  - tableau « Historique des emprunts » (livre, date d'emprunt, date de retour, statut)
 */
@Component({
  selector: 'app-adherent-space',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink, StarRatingComponent],
  templateUrl: './adherent-space.component.html',
  styleUrl: './adherent-space.component.css'
})
export class AdherentSpaceComponent {
  private auth = inject(AuthService);
  private library = inject(LibraryService);
  private toast = inject(ToastService);

  user = this.auth.currentUser;

  /** toutes les lignes de CET adhérent, les plus récentes d'abord */
  private mine = computed(() => {
    const u = this.user();
    return this.library
      .loans()
      .filter((l) => l.memberId === u?.id)
      .sort((a, b) => b.requestDate.localeCompare(a.requestDate) || b.id - a.id);
  });

  requests = this.mine; // toutes les demandes (avec leur état)
  history = computed(() => this.mine().filter((l) => l.requestStatus === 'Acceptée'));

  counts = computed(() => {
    const u = this.user();
    return u ? this.library.memberStats(u.id) : { total: 0, active: 0, late: 0, pending: 0 };
  });

  // ── fenêtre « Nouvelle demande d'emprunt »
  modalOpen = signal(false);
  bookChoice = new FormControl<number | null>(null, [Validators.required]);
  submitted = signal(false);
  availableBooks = computed(() => this.library.books().filter((b) => this.library.isAvailable(b)).sort((a, b) => a.title.localeCompare(b.title, 'fr')));

  title(l: Loan): string {
    return this.library.bookTitle(l);
  }

  loanStatus(l: Loan) {
    return this.library.loanStatus(l);
  }

  openModal(): void {
    this.bookChoice.reset(null);
    this.submitted.set(false);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  sendRequest(): void {
    this.submitted.set(true);
    const id = this.bookChoice.value;
    const u = this.user();
    if (id === null || !u) return;
    const res = this.library.requestLoan(u.id, Number(id));
    this.toast.show(res.message, res.ok ? 'success' : 'error');
    if (res.ok) this.closeModal();
  }

 readonly stars = [1, 2, 3, 4, 5];
draft = signal<Record<number, number>>({});
hover = signal<{ id: number; n: number } | null>(null);

pick(l: Loan, n: number): void {
  this.draft.update((d) => ({ ...d, [l.id]: n }));
}

filled(l: Loan, n: number): boolean {
  const h = this.hover();
  const value = h && h.id === l.id ? h.n : this.draft()[l.id] ?? 0;
  return n <= value;
}

sendRating(l: Loan): void {
  const note = this.draft()[l.id];
  if (!note) return;
  this.rate(l, note);
}

  /** L'adhérent donne une note de 1 à 5 à un livre qu'il a rendu */
  rate(l: Loan, note: number): void {
    const res = this.library.rateLoan(l.id, note);
    this.toast.show(res.message, res.ok ? 'success' : 'error');
  }

  cancel(l: Loan): void {
    this.library.cancelRequest(l.id);
    this.toast.show('Demande annulée.', 'info');
  }
}
