import { Injectable, computed, effect, signal } from '@angular/core';
import { Book, Loan, LoanStatus, Member, Result } from '../models/models';
import { SEED_BOOKS, SEED_MEMBERS, buildSeedLoans } from '../data/seed';
import { MONTHS_FR, addDays, todayIso } from '../utils/date.util';

interface Snapshot {
  books: Book[];
  members: Member[];
  loans: Loan[];
}

const STORAGE_KEY = 'biblio-app.data.v3'; // changer ce numéro recharge les données de seed.ts
const LOAN_DAYS = 14; // durée d'un emprunt
const MAX_ACTIVE = 5; // nombre maximum d'emprunts simultanés

export type BookInput = Omit<Book, 'id' | 'ratings' | 'addedAt'>;

/**
 * Service central : UNE SEULE source de vérité pour les livres, les adhérents
 * et les emprunts. Le catalogue, l'accueil, l'espace adhérent et l'espace admin
 * lisent tous les mêmes données → tout reste cohérent.
 * Les données sont gardées dans le navigateur (localStorage) pour survivre au rechargement.
 */
@Injectable({ providedIn: 'root' })
export class LibraryService {
  readonly books = signal<Book[]>([]);
  readonly members = signal<Member[]>([]);
  readonly loans = signal<Loan[]>([]);

  constructor() {
    const snap = this.read() ?? { books: SEED_BOOKS, members: SEED_MEMBERS, loans: buildSeedLoans() };
    this.books.set(snap.books);
    this.members.set(snap.members);
    this.loans.set(snap.loans);

    // à chaque modification, on sauvegarde
    effect(() => {
      this.write({ books: this.books(), members: this.members(), loans: this.loans() });
    });
  }

  // ───────────────────────── Lecture / calculs ─────────────────────────

  readonly categories = computed(() => [...new Set(this.books().map((b) => b.category))].sort((a, b) => a.localeCompare(b, 'fr')));

  /** nombre d'exemplaires actuellement sortis, par livre */
  private readonly activeByBook = computed(() => {
    const map = new Map<number, number>();
    for (const l of this.loans()) {
      if (l.requestStatus === 'Acceptée' && !l.returnedDate) map.set(l.bookId, (map.get(l.bookId) ?? 0) + 1);
    }
    return map;
  });

  availableCopies(book: Book): number {
    return Math.max(0, book.copies - (this.activeByBook().get(book.id) ?? 0));
  }

  isAvailable(book: Book): boolean {
    return this.availableCopies(book) > 0;
  }

  /** notes données par les adhérents après un retour, par livre */
  private readonly loanRatings = computed(() => {
    const map = new Map<number, number[]>();
    for (const l of this.loans()) {
      if (l.rating) map.set(l.bookId, [...(map.get(l.bookId) ?? []), l.rating]);
    }
    return map;
  });

  /** toutes les notes d'un livre : notes de départ + notes données dans l'application */
  private ratingsOf(book: Book): number[] {
    return [...book.ratings, ...(this.loanRatings().get(book.id) ?? [])];
  }

  average(book: Book): number {
    const r = this.ratingsOf(book);
    return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0;
  }

  ratingCount(book: Book): number {
    return this.ratingsOf(book).length;
  }

  bookById(id: number): Book | undefined {
    return this.books().find((b) => b.id === id);
  }

  memberById(id: number): Member | undefined {
    return this.members().find((m) => m.id === id);
  }

  bookTitle(loan: Loan): string {
    return this.bookById(loan.bookId)?.title ?? 'Livre supprimé';
  }

  memberName(loan: Loan): string {
    const m = this.memberById(loan.memberId);
    return m ? `${m.firstName} ${m.lastName}` : 'Adhérent inconnu';
  }

  /** statut d'un emprunt (null si la demande n'a pas été acceptée) */
  loanStatus(loan: Loan): LoanStatus | null {
    if (loan.requestStatus !== 'Acceptée') return null;
    if (loan.returnedDate) return 'Rendu';
    return (loan.dueDate ?? '') < todayIso() ? 'En retard' : 'En cours';
  }

  /** livres triés du plus emprunté au moins emprunté (nombre d'emprunts réels) */
  readonly topBorrowed = computed(() => {
    const count = new Map<number, number>();
    for (const l of this.loans()) if (l.requestStatus === 'Acceptée') count.set(l.bookId, (count.get(l.bookId) ?? 0) + 1);
    return this.books()
      .map((book) => ({ book, count: count.get(book.id) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.book.title.localeCompare(b.book.title));
  });

  /** livres triés du plus récent au plus ancien (date d'ajout) */
  readonly newest = computed(() => [...this.books()].sort((a, b) => b.addedAt.localeCompare(a.addedAt) || b.id - a.id));

  readonly stats = computed(() => {
    const loans = this.loans();
    const active = loans.filter((l) => l.requestStatus === 'Acceptée' && !l.returnedDate);
    return {
      titles: this.books().length,
      copies: this.books().reduce((s, b) => s + b.copies, 0),
      members: this.members().filter((m) => m.role === 'adherent').length,
      active: active.length,
      late: active.filter((l) => (l.dueDate ?? '') < todayIso()).length,
      pending: loans.filter((l) => l.requestStatus === 'En attente').length
    };
  });

  /** nombre d'emprunts par mois sur les 6 derniers mois (pour le graphique) */
  readonly monthlyLoans = computed(() => {
    const now = new Date();
    const slots: { key: string; label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      slots.push({ key, label: MONTHS_FR[d.getMonth()], value: 0 });
    }
    for (const l of this.loans()) {
      const slot = l.borrowDate ? slots.find((s) => s.key === l.borrowDate!.slice(0, 7)) : undefined;
      if (slot) slot.value++;
    }
    return slots;
  });

  memberStats(memberId: number) {
    const mine = this.loans().filter((l) => l.memberId === memberId);
    const accepted = mine.filter((l) => l.requestStatus === 'Acceptée');
    const active = accepted.filter((l) => !l.returnedDate);
    return {
      total: accepted.length,
      active: active.length,
      late: active.filter((l) => (l.dueDate ?? '') < todayIso()).length,
      pending: mine.filter((l) => l.requestStatus === 'En attente').length
    };
  }

  // ───────────────────────── Livres (CRUD) ─────────────────────────

  addBook(data: BookInput): Book {
    const book: Book = { ...data, id: this.nextId(this.books()), ratings: [], addedAt: todayIso() };
    this.books.update((list) => [...list, book]);
    return book;
  }

  updateBook(id: number, data: BookInput): void {
    this.books.update((list) => list.map((b) => (b.id === id ? { ...b, ...data } : b)));
  }

  deleteBook(id: number): Result {
    if ((this.activeByBook().get(id) ?? 0) > 0) {
      return { ok: false, message: 'Impossible : ce livre est actuellement emprunté.' };
    }
    this.books.update((list) => list.filter((b) => b.id !== id));
    // on retire ses demandes en attente (elles n'ont plus de sens)
    this.loans.update((list) => list.filter((l) => !(l.bookId === id && l.requestStatus === 'En attente')));
    return { ok: true, message: 'Livre supprimé.' };
  }

  // ───────────────────────── Adhérents ─────────────────────────

  addMember(data: { firstName: string; lastName: string; email: string; phone: string; password: string }): Result {
    const email = data.email.trim().toLowerCase();
    if (this.members().some((m) => m.email.toLowerCase() === email)) {
      return { ok: false, message: 'Cet e-mail est déjà utilisé.' };
    }
    const member: Member = {
      id: this.nextId(this.members()),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email,
      phone: data.phone.trim(),
      password: data.password,
      role: 'adherent',
      joinedAt: todayIso()
    };
    this.members.update((list) => [...list, member]);
    return { ok: true, message: 'Compte créé avec succès.' };
  }

  // ───────────────────────── Demandes / emprunts / retours ─────────────────────────

  /** L'adhérent demande à emprunter un livre → statut « En attente » */
  requestLoan(memberId: number, bookId: number): Result {
    const book = this.bookById(bookId);
    if (!book) return { ok: false, message: 'Livre introuvable.' };
    if (!this.isAvailable(book)) return { ok: false, message: 'Ce livre n’est pas disponible pour le moment.' };

    const mine = this.loans().filter((l) => l.memberId === memberId);
    const already = mine.some((l) => l.bookId === bookId && (l.requestStatus === 'En attente' || (l.requestStatus === 'Acceptée' && !l.returnedDate)));
    if (already) return { ok: false, message: 'Vous avez déjà une demande ou un emprunt en cours pour ce livre.' };

    const activeCount = mine.filter((l) => (l.requestStatus === 'Acceptée' && !l.returnedDate) || l.requestStatus === 'En attente').length;
    if (activeCount >= MAX_ACTIVE) return { ok: false, message: `Maximum ${MAX_ACTIVE} emprunts/demandes en même temps.` };

    const loan: Loan = { id: this.nextId(this.loans()), bookId, memberId, requestDate: todayIso(), requestStatus: 'En attente' };
    this.loans.update((list) => [...list, loan]);
    return { ok: true, message: `Demande envoyée pour « ${book.title} ». Elle est en attente de validation.` };
  }

  cancelRequest(loanId: number): void {
    this.loans.update((list) => list.filter((l) => !(l.id === loanId && l.requestStatus === 'En attente')));
  }

  acceptRequest(loanId: number): Result {
    const loan = this.loans().find((l) => l.id === loanId);
    const book = loan ? this.bookById(loan.bookId) : undefined;
    if (!loan || !book) return { ok: false, message: 'Demande introuvable.' };
    if (!this.isAvailable(book)) return { ok: false, message: 'Plus aucun exemplaire disponible : impossible d’accepter.' };
    const today = todayIso();
    this.patchLoan(loanId, { requestStatus: 'Acceptée', borrowDate: today, dueDate: addDays(today, LOAN_DAYS) });
    return { ok: true, message: `Demande acceptée : retour prévu le ${addDays(today, LOAN_DAYS).split('-').reverse().join('/')}.` };
  }

  refuseRequest(loanId: number): void {
    this.patchLoan(loanId, { requestStatus: 'Refusée' });
  }

  registerReturn(loanId: number): void {
    this.patchLoan(loanId, { returnedDate: todayIso() });
  }

  /** L'adhérent note un livre qu'il a rendu (une seule fois par emprunt) */
  rateLoan(loanId: number, rating: number): Result {
    const loan = this.loans().find((l) => l.id === loanId);
    if (!loan || !loan.returnedDate) return { ok: false, message: 'Vous pouvez noter un livre seulement après l’avoir rendu.' };
    if (loan.rating) return { ok: false, message: 'Vous avez déjà noté ce livre.' };
    if (rating < 1 || rating > 5) return { ok: false, message: 'Note invalide.' };
    this.patchLoan(loanId, { rating });
    return { ok: true, message: 'Merci pour votre note !' };
  }

  // ───────────────────────── Interne ─────────────────────────

  private patchLoan(id: number, patch: Partial<Loan>): void {
    this.loans.update((list) => list.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  private nextId(list: { id: number }[]): number {
    return list.reduce((max, x) => Math.max(max, x.id), 0) + 1;
  }

  private read(): Snapshot | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const snap = JSON.parse(raw) as Snapshot;
      return snap.books && snap.members && snap.loans ? snap : null;
    } catch {
      return null;
    }
  }

  private write(snap: Snapshot): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    } catch {
      /* stockage indisponible : on continue sans sauvegarde */
    }
  }
}
