import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

/**
 * Page de choix : « Se connecter comme adhérent » ou « Se connecter comme administrateur ».
 * On arrive ici en cliquant sur « Connexion », ou en essayant d'ouvrir un espace privé sans être connecté
 * (le guard nous envoie ici avec ?reason=auth&returnUrl=… pour afficher le message).
 */
@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.css'
})
export class ConnexionComponent {
  private route = inject(ActivatedRoute);

  needLogin = this.route.snapshot.queryParamMap.get('reason') === 'auth';
  private returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';

  /** on garde la page demandée, mais seulement pour le bon espace */
  adherentParams = computed(() => (this.returnUrl && !this.returnUrl.startsWith('/admin') ? { returnUrl: this.returnUrl } : {}));
  adminParams = computed(() => (this.returnUrl.startsWith('/admin') ? { returnUrl: this.returnUrl } : {}));
}
