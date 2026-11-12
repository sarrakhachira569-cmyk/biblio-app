import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/models';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Garde de route : protège les espaces privés.
 *  - pas connecté  → page de choix /connexion (adhérent ou administrateur)
 *  - mauvais rôle  → renvoyé vers SON espace
 * Le rôle attendu est indiqué dans les routes : data: { role: 'admin' }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const expected = (route.data['role'] as Role | undefined) ?? 'adherent';

  const user = auth.currentUser();
  if (!user) {
    return router.createUrlTree([expected === 'admin' ? '/admin/login' : '/login'], { queryParams: { returnUrl: state.url, reason: 'auth' } });
  }
  if (user.role !== expected) {
    if (expected === 'admin') toast.show('Accès réservé à l’administrateur.', 'error');
    return router.createUrlTree([user.role === 'admin' ? '/admin' : '/adherent']);
  }
  return true;
};
