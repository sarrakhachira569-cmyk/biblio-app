import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../../../models/models';
import { LibraryService } from '../../../services/library.service';
import { ToastService } from '../../../services/toast.service';
import { StarRatingComponent } from '../../../shared/star-rating/star-rating.component';
import { generateCover } from '../../../utils/cover.util';
import { matchesSearch, SearchField } from '../../../utils/search.util';

/**
 * Gestion des livres : CRUD complet
 *  C = Create (Ajouter)   R = Read (Consulter / rechercher)
 *  U = Update (Modifier)  D = Delete (Supprimer, avec confirmation)
 * Utilise le MÊME service que le catalogue → les deux pages affichent exactement les mêmes livres.
 * Couverture : l'administrateur choisit une image sur son ordinateur (ou colle un lien internet).
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
  searchField = signal<SearchField>('all');
  categoryFilter = signal('Toutes');

  placeholder = computed(() => {
    const f = this.searchField();
    return f === 'title' ? 'Rechercher par titre…' : f === 'author' ? 'Rechercher par auteur…' : 'Rechercher un titre ou un auteur…';
  });

  rows = computed(() => {
    const q = this.query();
    const field = this.searchField();
    const cat = this.categoryFilter();
    return this.library
      .books()
      .filter((b) => (cat === 'Toutes' || b.category === cat) && matchesSearch(b, q, field))
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
    // vide, lien http(s), chemin images/… (livres d'origine) ou image choisie sur l'ordinateur (data:image/…)
    cover: ['', [Validators.pattern(/^((https?:\/\/|images\/|data:image\/)\S+)?$/)]]
  });

  // ── image de couverture
  coverMode = signal<'file' | 'url'>('file');
  coverPreview = signal('');
  urlText = signal('');
  coverMsg = signal('');

  // ── confirmation de suppression
  toDelete = signal<Book | null>(null);

  constructor() {
    // l'aperçu suit toujours la valeur du champ « cover »
    this.form.controls.cover.valueChanges.subscribe((v) => this.coverPreview.set(v));
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
    this.coverMode.set('file');
    this.urlText.set('');
    this.coverMsg.set('');
    this.formOpen.set(true);
  }

  openEdit(b: Book): void {
    this.editing.set(b);
    this.submitted.set(false);
    this.form.reset({ title: b.title, author: b.author, year: b.year, publisher: b.publisher, category: b.category, copies: b.copies, cover: b.cover });
    const isLink = /^https?:\/\//.test(b.cover);
    this.coverMode.set(isLink ? 'url' : 'file');
    this.urlText.set(isLink ? b.cover : '');
    this.coverMsg.set('');
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  // ───────── choix de l'image ─────────

  /** image choisie sur l'ordinateur → réduite (480 px max) pour tenir dans la mémoire du navigateur */
  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permet de re-choisir le même fichier
    if (!file) return;
    this.coverMsg.set('');
    if (!file.type.startsWith('image/')) {
      this.coverMsg.set('Ce fichier n’est pas une image. Choisissez une photo (JPG, PNG…).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      this.coverMsg.set('Image trop lourde (8 Mo maximum).');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => this.coverMsg.set('Impossible de lire ce fichier.');
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => this.coverMsg.set('Impossible de lire cette image.');
      img.onload = () => {
        const scale = Math.min(1, 480 / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          this.coverMsg.set('Impossible de traiter cette image.');
          return;
        }
        ctx.fillStyle = '#fff'; // fond blanc pour les PNG transparents
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        this.urlText.set('');
        this.form.controls.cover.setValue(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onCoverUrl(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.urlText.set(value);
    this.coverMsg.set('');
    this.form.controls.cover.setValue(value);
  }

  clearCover(): void {
    this.urlText.set('');
    this.coverMsg.set('');
    this.form.controls.cover.setValue('');
  }

  setMode(mode: 'file' | 'url'): void {
    this.coverMode.set(mode);
    this.coverMsg.set('');
  }

  onPreviewLoad(): void {
    this.coverMsg.set('');
  }

  onPreviewError(): void {
    if (this.coverPreview()) this.coverMsg.set('Impossible d’afficher cette image : vérifiez le fichier ou le lien.');
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

  onField(e: Event): void {
    this.searchField.set((e.target as HTMLSelectElement).value as SearchField);
  }

  onCategory(e: Event): void {
    this.categoryFilter.set((e.target as HTMLSelectElement).value);
  }
}