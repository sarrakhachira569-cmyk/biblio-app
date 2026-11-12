import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LibraryService } from '../../services/library.service';

/**
 * Espace administrateur = une « coquille » avec 4 onglets.
 * Chaque onglet est une page enfant affichée dans <router-outlet> :
 *  Tableau de bord · Livres (CRUD) · Adhérents · Emprunts & retours
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  stats = inject(LibraryService).stats;
}
