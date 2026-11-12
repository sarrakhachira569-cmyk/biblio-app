# BiblioNova — Mini-projet Front-end (Angular 18 + Bootstrap)

## Lancer
```bash
npm install
npm start        # puis ouvrir http://localhost:4200
```

## Comptes de démonstration
- Adhérent (page /login) : yasmine@biblio.tn / 123456
- Administrateur (page /admin/login) : sarra@biblio.tn / sarra2026 — malek@biblio.tn / malek2026
(Données fictives gardées dans le navigateur : localStorage. Pour ajouter un admin : copier une ligne `role: 'admin'` dans `src/app/data/seed.ts`, puis changer le numéro de version `STORAGE_KEY` dans `library.service.ts`.)

## Images des livres
Mettre les images dans `public/images/covers/` (noms exacts dans `LISEZMOI.txt`). Si une image manque, une couverture est générée.

## Organisation du code
- `components/` : home, catalogue, login, register, navbar, adherent-space, admin-dashboard (+ 4 pages enfants)
- `shared/` : composants réutilisés (book-card, star-rating, password-field, bar-chart)
- `services/` : library.service (livres, adhérents, emprunts), auth.service, toast.service
- `guards/` : auth.guard (protège /adherent et /admin selon le rôle)
- `data/seed.ts` : données fictives · `models/` : types · `utils/` : dates et couvertures

## Phrases pour l'exposé
- « Le menu principal permet de naviguer entre les quatre espaces, et l'interface est cohérente et adaptée à tous les écrans. »
- « Le catalogue affiche les livres en grille et permet de les filtrer par titre, auteur ou catégorie ; le bouton Emprunter n'apparaît que si le livre est disponible. »
- « Après connexion, l'adhérent consulte son historique d'emprunts, fait une demande d'emprunt et suit l'état de ses demandes. »
- « Un seul service partage les données entre le catalogue et l'administration, donc tout reste cohérent. »
