import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../../../models/models';
import { LibraryService } from '../../../services/library.service';
import { ToastService } from '../../../services/toast.service';
import { StarRatingComponent } from '../../../shared/star-rating/star-rating.component';
import { generateCover } from '../../../utils/cover.util';

/**
 * Gestion des livres : CRUD complet
 *  C = Create (Ajouter)   R = Read (Consulter / rechercher)
 *  U = Update (Modifier)  D = Delete (Supprimer, avec confirmation)
 * Utilise le MÊME service que le catalogue → les deux pages affichent exactement les mêmes livres.
 */
@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [ReactiveFormsModule, StarRatingComponent],
  templateUrl: './admin-books.component.html',
  styleUrl: './admin-books.component.css'
})
export class AdminBooksComponent {
  private library = inject(LibraryService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  categories = this.library.categories;
  readonly maxYear = new Date().getFullYear() + 1;

  query = signal('');
  categoryFilter = signal('Toutes');

  rows = computed(() => {
    const q = this.query().toLowerCase().trim();
    const cat = this.categoryFilter();
    return this.library
      .books()
      .filter((b) => (cat === 'Toutes' || b.category === cat) && (!q || `${b.title} ${b.author}`.toLowerCase().includes(q)))
      .map((b) => ({ book: b, left: this.library.availableCopies(b), avg: this.library.average(b), count: this.library.ratingCount(b) }));
  });

  // ── formulaire ajout / modification
  formOpen = signal(false);
  editing = signal<Book | null>(null);
  submitted = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    author: ['', [Validators.required, Validators.minLength(2)]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1400), Validators.max(this.maxYear)]],
    publisher: ['', [Validators.required]],
    category: ['', [Validators.required]],
    copies: [1, [Validators.required, Validators.min(0), Validators.max(99)]],
    cover: ['', [Validators.pattern(/^((https?:\/\/|images\/)\S+)?$/)]]
  });

  // ── confirmation de suppression
  toDelete = signal<Book | null>(null);

  constructor() {
    // le bouton « Ajouter un livre » du tableau de bord arrive ici avec ?action=add
    if (this.route.snapshot.queryParamMap.get('action') === 'add') this.openAdd();
  }

  coverOf(b: Book): string {
    return b.cover.trim() ? b.cover : generateCover(b.title, b.author, b.category);
  }

  onImgError(event: Event, b: Book): void {
    (event.target as HTMLImageElement).src = generateCover(b.title, b.author, b.category);
  }

  showError(c: AbstractControl): boolean {
    return c.invalid && (c.touched || this.submitted());
  }

  openAdd(): void {
    this.editing.set(null);
    this.submitted.set(false);
    this.form.reset({ title: '', author: '', year: new Date().getFullYear(), publisher: '', category: '', copies: 1, cover: '' });
    this.formOpen.set(true);
  }

  openEdit(b: Book): void {
    this.editing.set(b);
    this.submitted.set(false);
    this.form.reset({ title: b.title, author: b.author, year: b.year, publisher: b.publisher, category: b.category, copies: b.copies, cover: b.cover });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const data = {
      title: v.title.trim(),
      author: v.author.trim(),
      year: Number(v.year),
      publisher: v.publisher.trim(),
      category: v.category.trim(),
      copies: Math.floor(Number(v.copies)),
      cover: v.cover.trim()
    };
    const current = this.editing();
    if (current) {
      this.library.updateBook(current.id, data);
      this.toast.show(`« ${data.title} » a été modifié.`);
    } else {
      this.library.addBook(data);
      this.toast.show(`« ${data.title} » a été ajouté au catalogue.`);
    }
    this.closeForm();
  }

  askDelete(b: Book): void {
    this.toDelete.set(b);
  }

  confirmDelete(): void {
    const b = this.toDelete();
    if (!b) return;
    const res = this.library.deleteBook(b.id);
    this.toast.show(res.ok ? `« ${b.title} » a été supprimé.` : res.message, res.ok ? 'success' : 'error');
    this.toDelete.set(null);
  }

  onSearch(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }

  onCategory(e: Event): void {
    this.categoryFilter.set((e.target as HTMLSelectElement).value);
  }
}
