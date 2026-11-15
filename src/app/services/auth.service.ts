import { Injectable, computed, signal } from '@angular/core';
import { Member, Result, Role } from '../models/models';
import { LibraryService } from './library.service';

const SESSION_KEY = 'biblio-app.session';
const ATTEMPTS_KEY = 'biblio-app.attempts';

/** Sécurité : au bout de 3 erreurs, on bloque la connexion 30 secondes */
export const MAX_ATTEMPTS = 3;
export const LOCK_SECONDS = 30;

interface Attempt {
  count: number; // nombre d'échecs
  lockUntil: number; // heure (en ms) jusqu'à laquelle la connexion est bloquée (0 = pas bloqué)
}

/**
 * Gère la connexion : qui est connecté ? est-ce un adhérent ou l'administrateur ?
 * (Simulation front-end : en vrai, ce travail serait fait par un serveur.)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionId = signal<number | null>(this.readSession());
  private attempts: Record<string, Attempt> = this.readAttempts();

  readonly currentUser = computed<Member | null>(() => this.library.members().find((m) => m.id === this.sessionId()) ?? null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private library: LibraryService) {}

  /**
   * `space` = la page de connexion utilisée (adhérent ou admin).
   * IMPORTANT : le message d'erreur est TOUJOURS le même (mauvais e-mail, mauvais mot de passe
   * ou compte de l'autre espace) → on ne révèle jamais si un compte existe ni de quel type il est.
   */
  login(email: string, password: string, space: Role): Result & { user?: Member; locked?: number } {
    const key = this.keyOf(email);

    const wait = this.lockRemaining(key);
    if (wait > 0) return { ok: false, message: `Trop de tentatives. Réessayez dans ${wait} s.`, locked: wait };

    const user = this.library.members().find((m) => m.email.toLowerCase() === key);
    const valid = !!user && user.password === password && user.role === space;

    if (!valid) {
      const left = this.registerFailure(key);
      if (left === 0) return { ok: false, message: `Trop de tentatives. Réessayez dans ${LOCK_SECONDS} s.`, locked: LOCK_SECONDS };
      return { ok: false, message: `E-mail ou mot de passe incorrect. Il vous reste ${left} tentative${left > 1 ? 's' : ''}.` };
    }

    delete this.attempts[key];
    this.saveAttempts();
    this.sessionId.set(user.id);
    this.saveSession(user.id);
    return { ok: true, message: `Bienvenue ${user.firstName} !`, user };
  }

  /** secondes restantes avant de pouvoir réessayer avec cet e-mail (0 = pas bloqué) */
  lockRemaining(email: string): number {
    const key = this.keyOf(email);
    const a = this.attempts[key];
    if (!a || !a.lockUntil) return 0;
    const left = Math.ceil((a.lockUntil - Date.now()) / 1000);
    if (left <= 0) {
      delete this.attempts[key]; // le blocage est fini : on repart de zéro
      this.saveAttempts();
      return 0;
    }
    return left;
  }

  logout(): void {
    this.sessionId.set(null);
    this.saveSession(null);
  }

  register(data: { firstName: string; lastName: string; email: string; phone: string; password: string }): Result {
    return this.library.addMember(data);
  }

  // ───────────────────────── Interne ─────────────────────────

  private keyOf(email: string): string {
    return email.trim().toLowerCase();
  }

  /** note un échec ; renvoie le nombre d'essais restants (0 = on vient de bloquer) */
  private registerFailure(key: string): number {
    const a = this.attempts[key] ?? { count: 0, lockUntil: 0 };
    a.count += 1;
    if (a.count >= MAX_ATTEMPTS) a.lockUntil = Date.now() + LOCK_SECONDS * 1000;
    this.attempts[key] = a;
    this.saveAttempts();
    return Math.max(0, MAX_ATTEMPTS - a.count);
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

  private readAttempts(): Record<string, Attempt> {
    try {
      return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  private saveAttempts(): void {
    try {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(this.attempts));
    } catch {
      /* ignoré */
    }
  }
}