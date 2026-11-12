import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PasswordFieldComponent } from '../../shared/password-field/password-field.component';
import { EMAIL_PATTERN } from '../login/login.component';

/** Validateur du GROUPE : les deux mots de passe doivent être identiques. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const p = group.get('password')?.value as string;
  const c = group.get('confirmPassword')?.value as string;
  return c && p !== c ? { mismatch: true } : null;
}

/**
 * Inscription : nom, prénom, e-mail, mot de passe, confirmation, téléphone.
 * - Le bouton n'est JAMAIS bloqué : si le formulaire est invalide, on affiche les erreurs.
 * - Une erreur apparaît quand le champ est touché, et DISPARAÎT dès que la valeur est corrigée.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PasswordFieldComponent],
  templateUrl: './register.component.html',
  styleUrls: ['../auth.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group(
    {
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9 ]{8,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatch }
  );

  submitted = signal(false);
  error = signal('');
  success = signal(false);

  showError(c: AbstractControl): boolean {
    return c.invalid && (c.touched || this.submitted());
  }

  isValid(c: AbstractControl): boolean {
    return c.valid && (c.touched || c.dirty);
  }

  /** erreur « les mots de passe ne correspondent pas » : visible tant que c'est faux */
  mismatch(): boolean {
    const c = this.form.controls.confirmPassword;
    return this.form.hasError('mismatch') && (c.touched || c.dirty || this.submitted());
  }

  stateOf(c: AbstractControl): 'valid' | 'invalid' | '' {
    return this.showError(c) ? 'invalid' : this.isValid(c) ? 'valid' : '';
  }

  confirmState(): 'valid' | 'invalid' | '' {
    const c = this.form.controls.confirmPassword;
    if (this.showError(c) || this.mismatch()) return 'invalid';
    return c.valid && !this.form.hasError('mismatch') && c.dirty ? 'valid' : '';
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { lastName, firstName, email, phone, password } = this.form.getRawValue();
    const res = this.auth.register({ lastName, firstName, email, phone, password });
    if (!res.ok) {
      this.error.set(res.message);
      return;
    }
    this.success.set(true);
    // message vert, puis on envoie vers la connexion
    setTimeout(() => this.router.navigate(['/login'], { queryParams: { registered: '1' } }), 1400);
  }
}
