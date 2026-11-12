import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Loan } from '../../../models/models';
import { LibraryService } from '../../../services/library.service';
import { ToastService } from '../../../services/toast.service';

type Tab = 'demandes' | 'cours' | 'historique';

/**
 * Emprunts & retours :
 *  - Demandes : accepter ou refuser
 *  - En cours : suivre les emprunts (retards en rouge) et enregistrer le retour du livre
 *  - Historique : livres rendus et demandes refusées
 */
@Component({
  selector: 'app-admin-loans',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-loans.component.html',
  styleUrl: './admin-loans.component.css'
})
export class AdminLoansComponent {
  private library = inject(LibraryService);
  private toast = inject(ToastService);

  tab = signal<Tab>('demandes');

  private sorted = computed(() => [...this.library.loans()].sort((a, b) => b.requestDate.localeCompare(a.requestDate) || b.id - a.id));

  pending = computed(() => this.sorted().filter((l) => l.requestStatus === 'En attente'));
  active = computed(() =>
    this.sorted()
      .filter((l) => l.requestStatus === 'Acceptée' && !l.returnedDate)
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
  );
  history = computed(() => this.sorted().filter((l) => l.requestStatus === 'Refusée' || !!l.returnedDate));
  lateCount = computed(() => this.active().filter((l) => this.isLate(l)).length);

  book(l: Loan): string {
    return this.library.bookTitle(l);
  }
  member(l: Loan): string {
    return this.library.memberName(l);
  }
  isLate(l: Loan): boolean {
    return this.library.loanStatus(l) === 'En retard';
  }
  hasStock(l: Loan): boolean {
    const b = this.library.bookById(l.bookId);
    return !!b && this.library.isAvailable(b);
  }

  accept(l: Loan): void {
    const res = this.library.acceptRequest(l.id);
    this.toast.show(res.message, res.ok ? 'success' : 'error');
  }

  refuse(l: Loan): void {
    this.library.refuseRequest(l.id);
    this.toast.show(`Demande refusée : « ${this.book(l)} ».`, 'info');
  }

  giveBack(l: Loan): void {
    this.library.registerReturn(l.id);
    this.toast.show(`Retour enregistré : « ${this.book(l)} ».`, 'success');
  }
}
