import { Injectable, computed, signal } from '@angular/core';
import { Member, Result, Role } from '../models/models';
import { LibraryService } from './library.service';

const SESSION_KEY = 'biblio-app.session';

/**
 * Gère la connexion : qui est connecté ? est-ce un adhérent ou l'administrateur ?
 * (Simulation front-end : en vrai, ce travail serait fait par un serveur.)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionId = signal<number | null>(this.readSession());

  readonly currentUser = computed<Member | null>(() => this.library.members().find((m) => m.id === this.sessionId()) ?? null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private library: LibraryService) {}

  /** `space` = la page de connexion utilisée : un compte admin est refusé sur la page adhérent, et inversement */
  login(email: string, password: string, space: Role): Result & { user?: Member } {
    const user = this.library.members().find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) {
      return { ok: false, message: 'E-mail ou mot de passe incorrect.' };
    }
    if (user.role !== space) {
      return {
        ok: false,
        message: space === 'adherent' ? 'Ce compte est un compte administrateur : utilisez l’espace administrateur.' : 'Accès refusé : ce compte n’est pas un compte administrateur.'
      };
    }
    this.sessionId.set(user.id);
    this.saveSession(user.id);
    return { ok: true, message: `Bienvenue ${user.firstName} !`, user };
  }

  logout(): void {
    this.sessionId.set(null);
    this.saveSession(null);
  }

  register(data: { firstName: string; lastName: string; email: string; phone: string; password: string }): Result {
    return this.library.addMember(data);
  }

  private readSession(): number | null {
    try {
      const v = localStorage.getItem(SESSION_KEY);
      return v ? Number(v) : null;
    } catch {
      return null;
    }
  }

  private saveSession(id: number | null): void {
    try {
      if (id === null) localStorage.removeItem(SESSION_KEY);
      else localStorage.setItem(SESSION_KEY, String(id));
    } catch {
      /* ignoré */
    }
  }
}
