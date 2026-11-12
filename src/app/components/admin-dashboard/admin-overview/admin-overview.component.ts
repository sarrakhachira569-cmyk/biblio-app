import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../../services/library.service';
import { BarChartComponent } from '../../../shared/bar-chart/bar-chart.component';

interface Operation {
  date: string;
  icon: string;
  label: string;
  member: string;
  book: string;
  pill: string;
}

/** Tableau de bord : 4 cartes de chiffres, graphique, top des livres, accès rapides, dernières opérations. */
@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [RouterLink, DatePipe, BarChartComponent],
  templateUrl: './admin-overview.component.html',
  styleUrl: './admin-overview.component.css'
})
export class AdminOverviewComponent {
  private library = inject(LibraryService);

  stats = this.library.stats;
  monthly = computed(() => this.library.monthlyLoans().map((m) => ({ label: m.label, value: m.value })));

  /** les 5 livres les plus empruntés (avec une barre proportionnelle) */
  top = computed(() => {
    const list = this.library.topBorrowed().slice(0, 5);
    const max = Math.max(1, ...list.map((t) => t.count));
    return list.map((t) => ({ title: t.book.title, author: t.book.author, count: t.count, pct: (t.count / max) * 100 }));
  });

  /** dernières opérations : demandes, emprunts, retours, refus */
  operations = computed<Operation[]>(() => {
    const ops: Operation[] = [];
    for (const l of this.library.loans()) {
      const member = this.library.memberName(l);
      const book = this.library.bookTitle(l);
      if (l.returnedDate) ops.push({ date: l.returnedDate, icon: 'bi-box-arrow-in-down', label: 'Retour', member, book, pill: 'pill-ok' });
      else if (l.borrowDate) ops.push({ date: l.borrowDate, icon: 'bi-box-arrow-up-right', label: 'Emprunt', member, book, pill: 'pill-info' });
      else if (l.requestStatus === 'En attente') ops.push({ date: l.requestDate, icon: 'bi-hourglass-split', label: 'Demande', member, book, pill: 'pill-wait' });
      else ops.push({ date: l.requestDate, icon: 'bi-x-circle', label: 'Refus', member, book, pill: 'pill-ko' });
    }
    return ops.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  });
}
