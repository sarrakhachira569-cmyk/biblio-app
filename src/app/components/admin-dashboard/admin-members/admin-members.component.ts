import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LibraryService } from '../../../services/library.service';

/** Liste des adhérents (abonnés) avec leurs informations principales et leur activité. */
@Component({
  selector: 'app-admin-members',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-members.component.html'
})
export class AdminMembersComponent {
  private library = inject(LibraryService);

  query = signal('');

  rows = computed(() => {
    const q = this.query().toLowerCase().trim();
    return this.library
      .members()
      .filter((m) => m.role === 'adherent')
      .filter((m) => !q || `${m.firstName} ${m.lastName} ${m.email} ${m.phone}`.toLowerCase().includes(q))
      .map((m) => ({ member: m, stats: this.library.memberStats(m.id) }));
  });

  onSearch(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }
}
