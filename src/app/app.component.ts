import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastService } from './services/toast.service';
import { SITE } from './data/site-info';

/** Composant racine : barre de menu en haut, page au milieu (router-outlet), pied de page en bas. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  toast = inject(ToastService);
  year = new Date().getFullYear();
  site = SITE;
  whatsappUrl = `https://wa.me/${SITE.whatsapp}`;
  mapsUrl = SITE.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`;
  gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SITE.email)}`;
  partnerMapsUrl = SITE.partnerMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.partnerAddress)}`;}
