import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

/**
 * Menu principal. Le visiteur voit les 4 liens (Accueil, Catalogue, Espace adhérent, Espace administrateur) ;
 * une fois connecté, on ne montre que SON espace (adhérent ou administrateur).
 * À droite : bouton « Connexion » si personne n'est connecté,
 * sinon le VRAI nom de la personne connectée + bouton de déconnexion.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  user = this.auth.currentUser;
  isAdmin = this.auth.isAdmin;
  menuOpen = signal(false);

  fullName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}`.trim() : '';
  });
  /** première lettre du vrai prénom (et non plus un « S » écrit en dur) */
  initial = computed(() => this.user()?.firstName.charAt(0).toUpperCase() ?? '');
  roleLabel = computed(() => (this.user()?.role === 'admin' ? 'Administrateur' : 'Adhérent'));

  toggle(): void {
    this.menuOpen.update((v) => !v);
  }

  close(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.close();
    this.toast.show('Vous êtes déconnecté(e).', 'info');
    this.router.navigate(['/']);
  }
}
