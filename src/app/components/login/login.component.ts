import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Role } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { PasswordFieldComponent } from '../../shared/password-field/password-field.component';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Connexion (e-mail + mot de passe). Le MÊME composant sert pour 2 pages :
 *   /login        → adhérent (avec lien « Créer un compte »)
 *   /admin/login  → administrateur (sans inscription)
 * Le rôle vient de la route : data: { role: 'admin' }
 * Sécurité : message d'erreur unique + blocage de 30 s après 3 erreurs (voir AuthService).
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PasswordFieldComponent],
  templateUrl: './login.component.html',
  styleUrls: ['../auth.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  role: Role = (this.route.snapshot.data['role'] as Role | undefined) ?? 'adherent';
  isAdmin = this.role === 'admin';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required]]
  });

  submitted = signal(false);
  error = signal('');

  /** secondes restantes de blocage (0 = connexion possible) */
  lockLeft = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  /** messages d'information selon la raison de l'arrivée sur cette page */
  justRegistered = this.route.snapshot.queryParamMap.get('registered') === '1';
  needLogin = this.route.snapshot.queryParamMap.get('reason') === 'auth';

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTimer());
    // si on change d'e-mail pendant le blocage : on vérifie si CET e-mail-là est bloqué
    this.form.controls.email.valueChanges.subscribe((value) => {
      if (this.lockLeft() === 0) return;
      const wait = this.auth.lockRemaining(value);
      if (wait > 0) this.startLock(wait);
      else this.endLock();
    });
  }

  /** une erreur n'est affichée que si le champ a été touché OU si on a cliqué sur « Se connecter » */
  showError(c: AbstractControl): boolean {
    return c.invalid && (c.touched || this.submitted());
  }

  onSubmit(): void {
    if (this.lockLeft() > 0) return;
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    const res = this.auth.login(email, password, this.role);
    if (!res.ok || !res.user) {
      if (res.locked) this.startLock(res.locked);
      else this.error.set(res.message);
      return;
    }
    this.toast.show(res.message, 'success');
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (this.isAdmin) this.router.navigateByUrl(returnUrl?.startsWith('/admin') && !returnUrl.startsWith('/admin/login') ? returnUrl : '/admin');
    else this.router.navigateByUrl(returnUrl && !returnUrl.startsWith('/admin') ? returnUrl : '/adherent');
  }

  /** lance le compte à rebours (1 seconde par seconde) */
  private startLock(seconds: number): void {
    this.stopTimer();
    this.error.set('');
    this.lockLeft.set(seconds);
    this.timer = setInterval(() => {
      const left = this.lockLeft() - 1;
      if (left <= 0) this.endLock();
      else this.lockLeft.set(left);
    }, 1000);
  }

  private endLock(): void {
    this.stopTimer();
    this.lockLeft.set(0);
    this.error.set('');
  }

  private stopTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}