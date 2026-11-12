import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Champ « mot de passe » avec le petit œil 👁 pour afficher / masquer ce qu'on tape.
 * Réutilisé dans la connexion ET l'inscription (2 champs).
 */
@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="input-group">
      <input
        class="form-control"
        [class.is-invalid]="state() === 'invalid'"
        [class.is-valid]="state() === 'valid'"
        [type]="visible() ? 'text' : 'password'"
        [formControl]="control()"
        [id]="inputId()"
        [placeholder]="placeholder()"
        [attr.autocomplete]="autocomplete()"
      />
      <button
        type="button"
        class="btn btn-outline-secondary"
        (click)="visible.set(!visible())"
        [attr.aria-label]="visible() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        [attr.aria-pressed]="visible()"
        [title]="visible() ? 'Masquer' : 'Afficher'"
      >
        <i class="bi" [class.bi-eye]="!visible()" [class.bi-eye-slash]="visible()"></i>
      </button>
    </div>
  `
})
export class PasswordFieldComponent {
  control = input.required<FormControl<string>>();
  inputId = input<string>('password');
  placeholder = input<string>('Votre mot de passe');
  autocomplete = input<string>('current-password');
  state = input<'valid' | 'invalid' | ''>('');
  visible = signal(false);
}
