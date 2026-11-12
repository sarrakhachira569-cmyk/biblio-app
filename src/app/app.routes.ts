import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { CatalogueComponent } from './components/catalogue/catalogue.component';
import { LoginComponent } from './components/login/login.component';
import { ConnexionComponent } from './components/connexion/connexion.component';
import { RegisterComponent } from './components/register/register.component';
import { AdherentSpaceComponent } from './components/adherent-space/adherent-space.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminOverviewComponent } from './components/admin-dashboard/admin-overview/admin-overview.component';
import { AdminBooksComponent } from './components/admin-dashboard/admin-books/admin-books.component';
import { AdminMembersComponent } from './components/admin-dashboard/admin-members/admin-members.component';
import { AdminLoansComponent } from './components/admin-dashboard/admin-loans/admin-loans.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Accueil · BiblioNova' },
  { path: 'catalogue', component: CatalogueComponent, title: 'Catalogue · BiblioNova' },
  { path: 'connexion', component: ConnexionComponent, title: 'Connexion · BiblioNova' },
  // même composant, deux pages : data.role indique quel espace on veut ouvrir
  { path: 'login', component: LoginComponent, data: { role: 'adherent' }, title: 'Connexion · BiblioNova' },
  { path: 'admin/login', component: LoginComponent, data: { role: 'admin' }, title: 'Connexion administrateur · BiblioNova' },
  { path: 'register', component: RegisterComponent, title: 'Inscription · BiblioNova' },
  {
    path: 'adherent',
    component: AdherentSpaceComponent,
    canActivate: [authGuard],
    data: { role: 'adherent' },
    title: 'Espace adhérent · BiblioNova'
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'admin' },
    title: 'Espace administrateur · BiblioNova',
    children: [
      { path: '', component: AdminOverviewComponent },
      { path: 'livres', component: AdminBooksComponent },
      { path: 'adherents', component: AdminMembersComponent },
      { path: 'emprunts', component: AdminLoansComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
