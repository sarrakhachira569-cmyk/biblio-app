import { Component, inject, signal } from '@angular/core';
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

  /** messages d'information selon la raison de l'arrivée sur cette page */
  justRegistered = this.route.snapshot.queryParamMap.get('registered') === '1';
  needLogin = this.route.snapshot.queryParamMap.get('reason') === 'auth';

  /** une erreur n'est affichée que si le champ a été touché OU si on a cliqué sur « Se connecter » */
  showError(c: AbstractControl): boolean {
    return c.invalid && (c.touched || this.submitted());
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    const res = this.auth.login(email, password, this.role);
    if (!res.ok || !res.user) {
      this.error.set(res.message);
      return;
    }
    this.toast.show(res.message, 'success');
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (this.isAdmin) this.router.navigateByUrl(returnUrl?.startsWith('/admin') && !returnUrl.startsWith('/admin/login') ? returnUrl : '/admin');
    else this.router.navigateByUrl(returnUrl && !returnUrl.startsWith('/admin') ? returnUrl : '/adherent');
  }
}
